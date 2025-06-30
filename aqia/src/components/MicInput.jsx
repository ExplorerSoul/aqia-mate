import React, { useState } from 'react';
import SpeechService from '../utils/speech';

const MicInput = ({ onResult }) => {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');

  const handleMicClick = async () => {
    if (listening) return;

    setListening(true);
    setError('');

    try {
      const transcript = await SpeechService.startListening(10000); // 10s timeout
      onResult(transcript); // Send transcript to parent
    } catch (err) {
      console.error('Mic error:', err);
      setError('Could not capture voice. Try again.');
    }

    setListening(false);
  };

  return (
    <div className="mic-input">
      <button onClick={handleMicClick} disabled={listening}>
        🎙️ {listening ? 'Listening...' : 'Speak Answer'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default MicInput;
