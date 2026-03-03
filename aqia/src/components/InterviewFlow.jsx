import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AIservice from '../utils/AIservice';
import SpeechService from '../utils/speech';
// import VoiceOutput from './VoiceOutput'; // Replaced by Left Transcript Box
// import MicInput from './MicInput'; // Replaced by Inline Controls

const InterviewFlow = ({ appData }) => {
  const apiKey = appData?.apiKey || sessionStorage.getItem('user_api_key');
  const domain = appData?.domain || sessionStorage.getItem('user_domain');
  const resumeText = appData?.resumeText || sessionStorage.getItem('user_resume');
  const maxQuestions =
    appData?.questionCount ||
    Number(sessionStorage.getItem('user_question_count')) ||
    8;

  const navigate = useNavigate();

  const [ai, setAi] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState('');
  
  // Transcript / Answer State
  const [transcript, setTranscript] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [inputMode, setInputMode] = useState('voice'); // 'voice' | 'text'

  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [started, setStarted] = useState(false); 
  const [answerStartTime, setAnswerStartTime] = useState(null);
  
  const qaHistoryRef = useRef([]); // [{question, yourAnswer, metrics}]
  const transcriptBoxRef = useRef(null);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptBoxRef.current) {
      transcriptBoxRef.current.scrollTop = transcriptBoxRef.current.scrollHeight;
    }
  }, [transcript, typedAnswer, currentQuestion]);

  // --- Speech Logic ---

  const speakThenListen = async (text) => {
    // OLD BUG: if (inputMode !== 'voice') return;
    // FIX: Always speak the question, regardless of mode.
    
    setSpeaking(true);
    try {
      const cleanText = text
        .replace(/[*_`~#]/g, '')
        .replace(/https?:\/\/\S+/g, 'link')
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
        
      await SpeechService.speak(cleanText);
    } catch (e) {
      console.error('Speech error:', e);
    }
    setSpeaking(false);
    setAnswerStartTime(Date.now()); // Track when the candidate should start answering

    // Only auto-listen if we are in Voice Mode
    if (inputMode === 'voice') {
      startListening();
    }
  };

  const startListening = async () => {
    if (listening) return;
    setListening(true);
    setTranscript('');
    try {
      await SpeechService.startListening((liveText) => {
        setTranscript(liveText);
      });
    } catch (err) {
      console.warn('Mic error:', err);
      setListening(false);
      setInputMode('text'); // Fallback
    }
  };

  const stopAndTranscribe = async () => {
    if (!listening) return transcript;
    
    setListening(false);
    setIsTranscribing(true);
    try {
      const text = await SpeechService.stopListening();
      if (text) setTranscript(text);
      setIsTranscribing(false);
      return text || transcript;
    } catch (e) {
      console.error("Transcription error:", e);
      setIsTranscribing(false);
      return transcript;
    }
  };

  // --- Flow Logic ---

  const handleProceed = async () => {
    let finalAnswer = '';

    if (inputMode === 'voice') {
      // If listening, stop and get final text
      let currentTranscript = transcript;
      if (listening) {
        currentTranscript = await stopAndTranscribe();
      }
      finalAnswer = currentTranscript.trim();
    } else {
      // Text mode
      finalAnswer = typedAnswer.trim();
    }

    finalAnswer = finalAnswer || '(No response)';

    // Speech Metrics Calculation
    const durationSeconds = answerStartTime ? Math.max(1, Math.round((Date.now() - answerStartTime) / 1000)) : 10;
    const durationMinutes = durationSeconds / 60;
    const wordCount = finalAnswer.split(/\s+/).filter(w => w.length > 0).length;
    const wpm = durationMinutes > 0 ? Math.round(wordCount / durationMinutes) : 0;
    
    // Check for common filler words
    const fillerWordsRegex = /\b(um|umm|uh|uhh|like|you know|basically|actually|literally)\b/gi;
    const fillerMatch = finalAnswer.match(fillerWordsRegex);
    const fillerCount = finalAnswer === '(No response)' ? 0 : (fillerMatch ? fillerMatch.length : 0);

    const metrics = {
      durationSeconds,
      wordCount,
      wpm,
      fillerCount
    };

    // Save
    qaHistoryRef.current.push({
      question: currentQuestion,
      yourAnswer: finalAnswer,
      metrics: metrics
    });

    // Reset for next
    setTranscript('');
    setTypedAnswer('');
    setAnswerStartTime(Date.now()); // Reset time for next input just in case
    // Keep input mode as is? Or reset to voice? Let's keep as is for continuity.

    try {
      if (questionNumber >= maxQuestions) {
        await requestDetailedReviewAndExit({ endedEarly: false });
        return;
      }

      const response = await ai.sendMessage(finalAnswer);

      if (ai.isInterviewComplete?.(response)) {
        await SpeechService.speak('Thanks. Generating your final review now.');
        await requestDetailedReviewAndExit({ endedEarly: false });
        return;
      }

      setQuestionNumber((prev) => prev + 1);
      setCurrentQuestion(response);
    } catch (err) {
      alert('❌ AI Error: ' + err.message);
    }
  };

  const requestDetailedReviewAndExit = async ({ endedEarly = false } = {}) => {
    try {
        const convo = qaHistoryRef.current;
  
        // ✅ Guard: No answers → no review
        if (!convo.length || convo.every(x => !x.yourAnswer || x.yourAnswer === '(No response)')) {
          const noData = {
            score: { overall: 0, communication: 0, technical: 0, problemSolving: 0, behavioral: 0 },
            summary: '⚠️ No valid answers were provided. Interview ended before evaluation.',
            strengths: [],
            weaknesses: [],
            questions: [],
          };
          sessionStorage.setItem('final_review_detailed', JSON.stringify(noData));
          navigate('/review');
          return;
        }
  
        const brief = convo.map((x, i) => {
          const m = x.metrics || { wpm: 0, fillerCount: 0 };
          return `Q${i + 1}: ${x.question}\nAnswer: ${x.yourAnswer}\n[Speech Metrics: ${m.wpm} words/min, ${m.fillerCount} filler words]`;
        }).join('\n\n');
  
        const prompt = `
        You are an experienced technical interviewer.
        Review the candidate's answers below.
        Respond ONLY with strict JSON (no markdown, no commentary).
        {
          "score": {
            "overall": number,
            "communication": number,
            "technical": number,
            "problemSolving": number,
            "behavioral": number
          },
          "summary": string,
          "strengths": [string],
          "weaknesses": [string],
          "questions": [
            { "question": string, "yourAnswer": string, "suggestedAnswer": string, "notes": string, "score": number }
          ]
        }
  
        Rules:
        - Fill all fields.
        - Overall 0–100. Per-question score 0–10.
        - summary = 3–5 sentences of feedback. MUST comment on their communication confidence, speech pacing, and filler word usage based on the [Speech Metrics] provided.
        - strengths & weaknesses ≥ 2 items each. Include verbal communication observations.
        - suggestedAnswer = improved version of candidate’s answer.
  
        ${endedEarly ? "Interview ended early — judge only provided answers." : ""}
        
        Answers:
        ${brief}
        `;
  
        const raw = await ai.sendMessage(prompt, { expectJson: true });
  
        let parsed = null;
        try {
          parsed = JSON.parse(raw);
        } catch {
          const match = raw.match(/\{[\s\S]*\}/);
          if (match) parsed = JSON.parse(match[0]);
        }
  
        if (!parsed || !parsed.questions) {
          parsed = {
            score: { overall: 0, communication: 0, technical: 0, problemSolving: 0, behavioral: 0 },
            summary: endedEarly ? 'Interview ended early.' : '⚠️ Review generation failed.',
            strengths: [],
            weaknesses: [],
            questions: convo.map(q => ({
              question: q.question,
              yourAnswer: q.yourAnswer,
              suggestedAnswer: '',
              notes: '',
              score: 0,
            })),
          };
        }
  
        // Append calculated raw speech metrics for UI
        let totalWpm = 0;
        let totalFiller = 0;
        let validAnswers = 0;
        convo.forEach(x => {
           if (x.metrics && x.metrics.wpm > 0) {
              totalWpm += x.metrics.wpm;
              totalFiller += x.metrics.fillerCount;
              validAnswers++;
           }
        });
        parsed.speechMetrics = {
           avgWpm: validAnswers > 0 ? Math.round(totalWpm / validAnswers) : 0,
           totalFiller: totalFiller
        };
  
        sessionStorage.setItem('final_review_detailed', JSON.stringify(parsed));

        // --- Save interview to the database (best-effort, never blocks navigation) ---
        try {
          const token = localStorage.getItem('token');
          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
          const payload = {
            job_category: domain || 'General',
            overall_score: parsed.score?.overall ?? null,
            questions: convo.map(item => ({
              question_asked: item.question || '',
              user_answer: item.yourAnswer || '',
              ai_feedback: parsed.questions?.find(q => q.question === item.question)?.notes || '',
              score: parsed.questions?.find(q => q.question === item.question)?.score ?? null,
            })),
            analytics_scores: parsed.score ? {
              'Communication': parsed.score.communication ?? null,
              'Technical': parsed.score.technical ?? null,
              'Problem Solving': parsed.score.problemSolving ?? null,
              'Behavioral': parsed.score.behavioral ?? null,
            } : null,
          };
          await fetch(`${baseUrl}/api/interviews`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
          });
        } catch (saveErr) {
          console.warn('Could not save interview to DB (non-critical):', saveErr);
        }

        navigate('/review');
      } catch (err) {
        console.error('❌ Review failed:', err);
        const fallback = {
          score: { overall: 0, communication: 0, technical: 0, problemSolving: 0, behavioral: 0 },
          summary: '⚠️ Review generation failed.',
          strengths: [],
          weaknesses: [],
          questions: qaHistoryRef.current,
        };
        sessionStorage.setItem('final_review_detailed', JSON.stringify(fallback));
        navigate('/review');
      }
  };

  const handleEarlyExit = async () => {
    // Immediately kill all audio and mic before doing anything else
    SpeechService.stopAll();
    setListening(false);
    await requestDetailedReviewAndExit({ endedEarly: true });
  };

  // --- Handlers for Icons ---

  const toggleInputMode = () => {
    if (inputMode === 'voice') {
      // Switching to text
      stopAndTranscribe().then(text => {
        setTypedAnswer(text || transcript);
        setInputMode('text');
      });
    } else {
      // Switching to voice
      setInputMode('voice');
      // Should we auto-start listening? 
      // Probably yes, for seamless flow.
      setTimeout(() => startListening(), 100);
    }
  };

  const toggleListening = () => {
    if (listening) {
      stopAndTranscribe();
    } else {
      startListening();
    }
  };

  // --- Init Effects ---
  useEffect(() => {
    const init = async () => {
      try {
        SpeechService.reset(); // Clear any leftover stopped state from previous session
        const aiInstance = new AIservice(apiKey);
        setAi(aiInstance);
        const firstQ = await aiInstance.initializeInterview(domain, resumeText, {
          maxQuestions,
          noJargon: true,
        });
        setCurrentQuestion(firstQ);
        setInitialized(true);
      } catch (err) {
        alert('Initialization failed: ' + err.message);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    if (!initialized) init();
  }, [apiKey, domain, resumeText, initialized, navigate, maxQuestions]);

  useEffect(() => {
    if (!loading && currentQuestion && started) {
      speakThenListen(currentQuestion);
    }
  }, [currentQuestion, loading, started]);

  useEffect(() => {
    return () => {
      // Immediately kill all speech and mic when component unmounts (navigate away)
      SpeechService.stopAll();
    };
  }, []);

  if (loading) return <p className="p-10 text-center text-lg">🌀 Preparing your interview...</p>;

  if (!started) {
    return (
      <div className="interview-container max-w-3xl mx-auto p-4 flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Ready to Interview?</h2>
        <p className="mb-6 text-gray-600">Click below to start. This ensures audio playback works correctly.</p>
        <button 
          onClick={() => setStarted(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
        >
          🚀 Start Interview
        </button>
      </div>
    );
  }

  return (
    <div className="interview-container">
      <div className="flex items-center justify-between mb-2">
         {/* Helper header if needed, or keeping it clean */}
      </div>

      <div className="interview-grid">
        {/* Left: Question Transcript */}
        <div className="transcript-box">
          <div className="transcript-header">
            <h3>Question {questionNumber}</h3>
            {speaking && <span className="text-sm opacity-90 animate-pulse">🔊 Speaking...</span>}
          </div>
          <div className="transcript-content">
             <p className="whitespace-pre-line">
                {currentQuestion || "..."}
             </p>
          </div>
        </div>

        {/* Right: Answer Transcript */}
        <div className="transcript-box">
          <div className="transcript-header">
             <h3>Your Answer</h3>
             {inputMode === 'voice' && listening && (
                <span className="text-sm opacity-90 animate-pulse">🎤 Listening...</span>
             )}
          </div>
          
          <div className="transcript-content" ref={transcriptBoxRef}>
            {inputMode === 'voice' ? (
                <>
                  <p className="whitespace-pre-line text-lg">
                    {transcript || <span className="text-gray-400 italic">Listening...</span>}
                  </p>
                  {isTranscribing && <p className="text-sm text-blue-600 mt-2">⏳ Finalizing transcript...</p>}
                </>
            ) : (
                <textarea 
                  className="w-full h-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Type your answer here..."
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  style={{ background: 'transparent', border: 'none' }}
                />
            )}
          </div>

          <div className="action-bar">
            {/* Edit Mode Toggle */}
            <button 
              className={`icon-btn ${inputMode === 'text' ? 'active' : ''}`}
              onClick={toggleInputMode}
              title={inputMode === 'voice' ? "Switch to Typing" : "Switch to Voice"}
            >
              {inputMode === 'voice' ? '✏️' : '🎤'}
            </button>

            {/* Mic Toggle (only in voice mode or to force start) */}
            {inputMode === 'voice' && (
                <button 
                className={`icon-btn ${listening ? 'active' : ''}`}
                onClick={toggleListening}
                title={listening ? "Pause Mic" : "Start Mic"}
                style={{ color: listening ? '#e02424' : '#667eea', borderColor: listening ? '#e02424' : '' }}
                >
                {listening ? '⏸️' : '▶️'}
                </button>
            )}

            <button className="submit-btn" onClick={handleProceed}>
               Submit
            </button>
          </div>
        </div>
      </div>

      <div className="interview-controls">
         <button onClick={handleProceed} className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300">
            Next Question
         </button>
         <button onClick={handleEarlyExit} className="stop-btn">
            End Interview
         </button>
      </div>
    </div>
  );
};

export default InterviewFlow;
