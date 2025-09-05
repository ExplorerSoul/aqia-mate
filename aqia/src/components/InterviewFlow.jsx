// // InterviewFlow.jsx 
// import { useEffect, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// import AIservice from '../utils/AIservice';
// import SpeechService from '../utils/speech';
// import VoiceOutput from './VoiceOutput';
// import MicInput from './MicInput';

// const InterviewFlow = ({ appData }) => {
//   const apiKey = appData?.apiKey || sessionStorage.getItem('user_api_key');
//   const domain = appData?.domain || sessionStorage.getItem('user_domain');
//   const resumeText = appData?.resumeText || sessionStorage.getItem('user_resume');
//   const maxQuestions =
//     appData?.questionCount ||
//     Number(sessionStorage.getItem('user_question_count')) ||
//     8;

//   const navigate = useNavigate();

//   const [ai, setAi] = useState(null);
//   const [questionNumber, setQuestionNumber] = useState(1);
//   const [currentQuestion, setCurrentQuestion] = useState('');
//   const [transcript, setTranscript] = useState('');   // speech input
//   const [typedAnswer, setTypedAnswer] = useState(''); // manual input
//   const [loading, setLoading] = useState(true);
//   const [speaking, setSpeaking] = useState(false);
//   const [listening, setListening] = useState(false);
//   const [micError, setMicError] = useState('');
//   const [initialized, setInitialized] = useState(false);
//   const qaHistoryRef = useRef([]); // [{question, yourAnswer}]

//   // Speak question, then listen
//   const speakThenListen = async (text) => {
//     setSpeaking(true);
//     setMicError('');
//     try {
//       const cleanText = text.replace(/[*_`~]/g, '').replace(/\s{2,}/g, ' ').trim();
//       await SpeechService.speak(cleanText);
//     } catch (e) {
//       console.error('Speech error:', e);
//     }
//     setSpeaking(false);

//     setListening(true);
//     try {
//       await SpeechService.startListening({
//         onPartial: (live) => setTranscript(live),
//         onFinal: (finalText) => setTranscript(finalText),
//       });
//     } catch (err) {
//       console.warn('❗ Mic error:', err.message);
//       setMicError('⚠️ Mic error or silence. You may type instead.');
//       setTranscript('(No response)');
//     }
//   };

//   // Review and exit
//   const requestDetailedReviewAndExit = async ({ endedEarly = false } = {}) => {
//     try {
//       const convo = qaHistoryRef.current;
//       const brief = convo.map((x, i) =>
//         `Q${i + 1}: ${x.question}\nAnswer: ${x.yourAnswer}`
//       ).join('\n\n');

//       const prompt = {
//         role: 'user',
//         parts: [{
//           text: `
//       You are an experienced technical interviewer and coach.
//       Review the candidate's answers strictly in the following JSON schema:

//       {
//         "score": {
//           "overall": number, 
//           "communication": number, 
//           "technical": number, 
//           "problemSolving": number, 
//           "behavioral": number
//         },
//         "summary": string,
//         "strengths": [string],
//         "weaknesses": [string],
//         "questions": [
//           { 
//             "question": string, 
//             "yourAnswer": string, 
//             "suggestedAnswer": string, 
//             "notes": string, 
//             "score": number 
//           }
//         ]
//       }

//       Rules:
//       - Always fill ALL fields.
//       - Scores must be between 0–10 per question, and 0–100 overall.
//       - "summary" should be 3–5 sentences of feedback.
//       - "strengths" and "weaknesses" must each contain at least 2 items.
//       - "suggestedAnswer" should be a short, improved version of the candidate’s answer.
//       - Do not include any text outside JSON.
//       - Do not return markdown, commentary, or code fences.

//       Answers to review:
//       ${brief}
//           `
//         }]
//       };

//       // Ask AI
//       ai.conversationHistory.push(prompt);
//       const raw = await ai.sendMessage();

//       // Try to extract JSON
//       let parsed = null;
//       try {
//         parsed = JSON.parse(raw);
//       } catch {
//         const match = raw.match(/\{[\s\S]*\}/);
//         if (match) {
//           try { parsed = JSON.parse(match[0]); } catch {}
//         }
//       }

//       // Fallback if parsing fails
//       if (!parsed || !parsed.questions) {
//         parsed = {
//           score: { overall: 0, communication: 0, technical: 0, problemSolving: 0, behavioral: 0 },
//           summary: endedEarly ? 'Interview ended early.' : '⚠️ Review failed to generate fully.',
//           strengths: [],
//           weaknesses: [],
//           questions: convo.map(q => ({
//             question: q.question,
//             yourAnswer: q.yourAnswer,
//             suggestedAnswer: '',
//             notes: '',
//             score: 0
//           }))
//         };
//       }


//       sessionStorage.setItem('final_review_detailed', JSON.stringify(parsed));
//       navigate('/review');
//     } catch (err) {
//       console.error('❌ Review failed:', err);
//       const fallback = {
//         score: { overall: 0, communication: 0, technical: 0, problemSolving: 0, behavioral: 0 },
//         summary: '⚠️ Review generation failed.',
//         strengths: [],
//         weaknesses: [],
//         questions: qaHistoryRef.current
//       };
//       sessionStorage.setItem('final_review_detailed', JSON.stringify(fallback));
//       navigate('/review');
//     }
//   };

//   // ✅ Proceed to next
//   const handleProceed = async () => {
//     setListening(false);

//     const finalAnswer =
//       (typedAnswer.trim() || transcript.trim()) || '(No response)';

//     qaHistoryRef.current.push({
//       question: currentQuestion,
//       yourAnswer: finalAnswer,
//     });

//     // reset inputs
//     setTranscript('');
//     setTypedAnswer('');

//     try {
//       if (questionNumber >= maxQuestions) {
//         await requestDetailedReviewAndExit({ endedEarly: false });
//         return;
//       }

//       const response = await ai.sendMessage(finalAnswer);

//       if (ai.isInterviewComplete?.(response)) {
//         await SpeechService.speak('Thanks. Generating your final review now.');
//         await requestDetailedReviewAndExit({ endedEarly: false });
//         return;
//       }

//       setQuestionNumber(prev => prev + 1);
//       setCurrentQuestion(response);
//     } catch (err) {
//       alert('❌ AI Error: ' + err.message);
//     }
//   };

//   const handleEarlyExit = async () => {
//     setListening(false);
//     SpeechService.stopListening();
//     SpeechService.stopSpeaking();
//     await requestDetailedReviewAndExit({ endedEarly: true });
//   };

//   const handleManualStop = () => {
//     SpeechService.stopListening();
//     setListening(false);
//     setMicError('⏹️ Mic stopped manually.');
//   };

//   const handleResume = () => {
//     if (currentQuestion && !speaking && !listening) {
//       speakThenListen(currentQuestion);
//     }
//   };

//   // Init interview
//   useEffect(() => {
//     const init = async () => {
//       try {
//         const aiInstance = new AIservice(apiKey);
//         setAi(aiInstance);
//         const firstQ = await aiInstance.initializeInterview(domain, resumeText, {
//           maxQuestions,
//           noJargon: true
//         });
//         setCurrentQuestion(firstQ);
//         setInitialized(true);
//       } catch (err) {
//         alert('Initialization failed: ' + err.message);
//         navigate('/');
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (!initialized) init();
//   }, [apiKey, domain, resumeText, initialized, navigate, maxQuestions]);

//   // Speak each new question
//   useEffect(() => {
//     if (!loading && currentQuestion) speakThenListen(currentQuestion);
//   }, [currentQuestion, loading]);

//   useEffect(() => {
//     return () => {
//       SpeechService.stopSpeaking();
//       SpeechService.stopListening();
//     };
//   }, []);

//   if (loading) return <p>🌀 Preparing your interview...</p>;

//   return (
//     <div className="interview-container max-w-3xl mx-auto p-4">
//       <div className="flex items-center justify-between mb-3">
//         <h2 className="text-xl font-semibold">
//           🧠 Interview Question {questionNumber}/{maxQuestions}
//         </h2>
//         <button
//           onClick={handleEarlyExit}
//           className="px-3 py-2 rounded-md font-medium"
//           style={{ backgroundColor: '#dc3545', color: 'white' }}
//         >
//           ❌ End Interview Now
//         </button>
//       </div>

//       <VoiceOutput text={currentQuestion} />

//       <div className="my-3">
//         <MicInput
//           listening={listening}
//           speaking={speaking}
//           error={micError}
//           onStopListening={handleManualStop}
//           onResumeListening={handleResume}
//         />
//       </div>

//       {/* ✅ Separate typed vs speech answers */}
//       <div className="bg-gray-50 rounded-lg p-3 border">
//         <p className="text-sm font-medium mb-1">🗣️ Your Answer</p>
//         {transcript && !typedAnswer && (
//           <p className="text-gray-600 text-sm mb-2">🎤 Transcript: {transcript}</p>
//         )}
//         <textarea
//           className="w-full border rounded p-2"
//           rows={3}
//           placeholder="Type here (overrides spoken answer)..."
//           value={typedAnswer}
//           onChange={(e) => setTypedAnswer(e.target.value)}
//         />
//       </div>

//       <div className="mt-4 flex gap-2">
//         <button
//           onClick={handleProceed}
//           className="px-4 py-2 rounded-md bg-emerald-600 text-white"
//         >
//           ✅ Proceed to Next
//         </button>
//         <div className="ml-auto text-sm">
//           <strong>🔊 Speaking:</strong> {speaking ? 'Yes' : 'No'} |{' '}
//           <strong>🎤 Listening:</strong> {listening ? 'Yes' : 'No'}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InterviewFlow;


// InterviewFlow.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AIservice from '../utils/AIservice';
import SpeechService from '../utils/speech';
import VoiceOutput from './VoiceOutput';
import MicInput from './MicInput';

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
  const [transcript, setTranscript] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState('');
  const [initialized, setInitialized] = useState(false);
  const qaHistoryRef = useRef([]); // [{question, yourAnswer}]

  // Speak then listen
  const speakThenListen = async (text) => {
    setSpeaking(true);
    setMicError('');
    try {
      const cleanText = text.replace(/[*_`~]/g, '').replace(/\s{2,}/g, ' ').trim();
      await SpeechService.speak(cleanText);
    } catch (e) {
      console.error('Speech error:', e);
    }
    setSpeaking(false);

    setListening(true);
    try {
      await SpeechService.startListening({
        onPartial: (live) => setTranscript(live),
        onFinal: (finalText) => setTranscript(finalText),
      });
    } catch (err) {
      console.warn('❗ Mic error:', err.message);
      setMicError('⚠️ Mic error or silence. You may type instead.');
      setTranscript('(No response)');
    }
  };

  // Generate review JSON and exit
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

      const brief = convo.map((x, i) =>
        `Q${i + 1}: ${x.question}\nAnswer: ${x.yourAnswer}`
      ).join('\n\n');

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
      - summary = 3–5 sentences of feedback.
      - strengths & weaknesses ≥ 2 items each.
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

      sessionStorage.setItem('final_review_detailed', JSON.stringify(parsed));
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

  const handleProceed = async () => {
    setListening(false);

    const finalAnswer =
      (typedAnswer.trim() || transcript.trim()) || '(No response)';

    qaHistoryRef.current.push({
      question: currentQuestion,
      yourAnswer: finalAnswer,
    });

    setTranscript('');
    setTypedAnswer('');

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

  const handleEarlyExit = async () => {
    setListening(false);
    SpeechService.stopListening();
    SpeechService.stopSpeaking();
    await requestDetailedReviewAndExit({ endedEarly: true });
  };

  const handleManualStop = () => {
    SpeechService.stopListening();
    setListening(false);
    setMicError('⏹️ Mic stopped manually.');
  };

  const handleResume = () => {
    if (currentQuestion && !speaking && !listening) {
      speakThenListen(currentQuestion);
    }
  };

  // Init
  useEffect(() => {
    const init = async () => {
      try {
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
    if (!loading && currentQuestion) speakThenListen(currentQuestion);
  }, [currentQuestion, loading]);

  useEffect(() => {
    return () => {
      SpeechService.stopSpeaking();
      SpeechService.stopListening();
    };
  }, []);

  if (loading) return <p>🌀 Preparing your interview...</p>;

  return (
    <div className="interview-container max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">
          🧠 Interview Question {questionNumber}/{maxQuestions}
        </h2>
      </div>

      <VoiceOutput text={currentQuestion} />

      <div className="my-3">
        <MicInput
          listening={listening}
          speaking={speaking}
          error={micError}
          transcript={transcript}
          typedAnswer={typedAnswer}
          onTypedChange={(val) => setTypedAnswer(val)}
          onStopListening={handleManualStop}
          onResumeListening={handleResume}
          onManualSubmit={() => handleProceed()}
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-3 border space-y-3">
        <div className="flex gap-2 items-center">
          <button
            onClick={handleProceed}
            className="px-4 py-2 rounded-md bg-emerald-600 text-white"
          >
            ✅ Proceed to Next
          </button>
          <button
            onClick={handleEarlyExit}
            className="px-3 py-2 rounded-md font-medium"
            style={{ backgroundColor: '#dc3545', color: 'white' }}
          >
            ❌ End Interview Now
          </button>
          <div className="ml-auto text-sm text-gray-600">
            <strong>🔊 Speaking:</strong> {speaking ? 'Yes' : 'No'} |{' '}
            <strong>🎤 Listening:</strong> {listening ? 'Yes' : 'No'}
          </div>
        </div>

        {transcript && (
          <div className="bg-white border rounded p-2 text-sm text-gray-700">
            <p className="font-medium text-gray-600 mb-1">🎤 Transcript (speech):</p>
            <p className="whitespace-pre-line">{transcript}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewFlow;
