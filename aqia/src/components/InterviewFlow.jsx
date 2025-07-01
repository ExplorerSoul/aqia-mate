import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AIservice from '../utils/AIservice';
import SpeechService from '../utils/speech';
import VoiceOutput from './VoiceOutput';
import MicInput from './MicInput';

const InterviewFlow = ({ appData }) => {
  const apiKey = appData?.apiKey || sessionStorage.getItem('user_api_key');
  const domain = appData?.domain || sessionStorage.getItem('user_domain');
  const resumeText = appData?.resumeText || sessionStorage.getItem('user_resume');

  const navigate = useNavigate();

  const [ai, setAi] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState('');
  const [initialized, setInitialized] = useState(false);

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
      const userSpeech = await SpeechService.startListening();
      setTranscript(userSpeech || '(No response)');
    } catch (err) {
      console.warn('❗ Mic error:', err.message);
      setMicError('⚠️ Mic error or silence. You may click Proceed to continue.');
      setTranscript('(No response)');
    }
  };

  const handleProceed = async () => {
    if (!transcript?.trim()) {
      setMicError('⚠️ No speech detected. Try again or click Proceed.');
      return;
    }

    setListening(false);

    try {
      const response = await ai.sendMessage(transcript);

      if (ai.isInterviewComplete(response)) {
        await SpeechService.speak(response);
        sessionStorage.setItem('final_review', response);
        navigate('/review');
        return;
      }

      setTranscript('');
      setQuestionNumber(prev => prev + 1);
      setCurrentQuestion(response);
    } catch (err) {
      alert('❌ AI Error: ' + err.message);
    }
  };

  const handleEarlyExit = async () => {
    setListening(false);
    SpeechService.stopListening();
    SpeechService.stopSpeaking();

    try {
      const finalReviewPrompt = {
        role: 'user',
        content: 'Please provide the final evaluation based on the conversation so far.'
      };

      ai.conversationHistory.push(finalReviewPrompt);
      const review = await ai.sendMessage();

      sessionStorage.setItem('final_review', review);
      navigate('/review');
    } catch (err) {
      alert('❌ Failed to generate review: ' + err.message);
    }
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

  // Initialize interview and get Q1 from AI
  useEffect(() => {
    const init = async () => {
      try {
        const aiInstance = new AIservice(apiKey);
        setAi(aiInstance);
        const firstQ = await aiInstance.initializeInterview(domain, resumeText);
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
  }, [apiKey, domain, resumeText, initialized, navigate]);

  // Speak each new question
  useEffect(() => {
    if (!loading && currentQuestion) {
      speakThenListen(currentQuestion);
    }
  }, [currentQuestion, loading]);

  // Stop voice and mic on exit
  useEffect(() => {
    return () => {
      SpeechService.stopSpeaking();
      SpeechService.stopListening();
    };
  }, []);

  if (loading) return <p>🌀 Preparing your interview...</p>;

  return (
    <div className="interview-container">
      <h2>🧠 Interview Question {questionNumber} of 10</h2>

      <VoiceOutput text={currentQuestion} />

      <MicInput
        listening={listening}
        speaking={speaking}
        error={micError}
        onStopListening={handleManualStop}
        onResumeListening={handleResume}
      />

      <button onClick={handleProceed} disabled={!transcript?.trim()}>
        ✅ Proceed to Next
      </button>
      <button onClick={handleEarlyExit} style={{ backgroundColor: '#dc3545', marginLeft: '1rem', color: 'white' }}>
        ❌ End Interview Now
      </button>


      <p><strong>🔊 Speaking:</strong> {speaking ? 'Yes' : 'No'} | 🎤 Listening: {listening ? 'Yes' : 'No'}</p>
      {transcript && <p><strong>You said:</strong> {transcript}</p>}
    </div>
  );
};

export default InterviewFlow;
