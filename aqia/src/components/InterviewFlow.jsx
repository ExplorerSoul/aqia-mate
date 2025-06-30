import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AIservice from '../utils/AIservice'; // ✅ Corrected name
import SpeechService from '../utils/speech';
import VoiceOutput from './VoiceOutput';
import MicInput from './MicInput';

const InterviewFlow = ({ appData }) => {
  const { apiKey, domain, resumeText } = appData;
  const navigate = useNavigate();

  const [ai, setAi] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  // ✅ Speak the AI's response
  const speakQuestion = async (text) => {
    setSpeaking(true);
    try {
      await SpeechService.speak(text);
    } catch (err) {
      console.error('TTS error:', err);
    }
    setSpeaking(false);
  };

  // ✅ Handle user's voice answer
  const handleAnswer = async (userAnswer) => {
    setTranscript(userAnswer);

    try {
      const response = await ai.sendMessage(userAnswer);

      if (ai.isInterviewComplete(response)) {
        await speakQuestion(response);
        alert('✅ Interview Completed!\n\n' + response);
        navigate('/review');
      } else {
        setQuestionNumber((prev) => prev + 1);
        setCurrentQuestion(response);
        await speakQuestion(response);
      }
    } catch (err) {
      alert('❌ AI Error: ' + err.message);
    }
  };

  // ✅ Start AI session
  useEffect(() => {
    const init = async () => {
      try {
        const aiInstance = new AIservice(apiKey);
        setAi(aiInstance);
        const firstQuestion = await aiInstance.initializeInterview(domain, resumeText);
        setCurrentQuestion(firstQuestion);
        await speakQuestion(firstQuestion);
      } catch (err) {
        alert('Initialization failed: ' + err.message);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [apiKey, domain, resumeText, navigate]);

  if (loading) return <p>🌀 Preparing your interview...</p>;

  return (
    <div className="interview-container">
      <h2>🧠 Interview Question {questionNumber} of 10</h2>
      <VoiceOutput text={currentQuestion} />

      <MicInput onResult={handleAnswer} />

      {transcript && (
        <p><strong>You:</strong> {transcript}</p>
      )}

      {speaking && <p>🔊 Speaking...</p>}
    </div>
  );
};

export default InterviewFlow;
