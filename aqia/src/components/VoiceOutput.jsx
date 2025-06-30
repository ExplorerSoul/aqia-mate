import React, { useEffect } from 'react';
import SpeechService from '../utils/speech';

const VoiceOutput = ({ text }) => {
  useEffect(() => {
    if (text) {
      SpeechService.speak(text).catch(err =>
        console.error('TTS error:', err)
      );
    }
  }, [text]);

  return (
    <div className="voice-output">
      <p><strong>AI:</strong> {text}</p>
    </div>
  );
};

export default VoiceOutput;
