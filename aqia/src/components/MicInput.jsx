import { useState, useEffect } from 'react';
import './MicInput.css';

const MicInput = ({
  listening,
  speaking,
  error,
  transcript,          // ✅ pass live transcript from parent (speech service)
  onStopListening,
  onResumeListening,
  onManualChange,
  onManualSubmit,
}) => {
  const [inputValue, setInputValue] = useState('');

  // ✅ Sync transcript into local state when listening
  useEffect(() => {
    if (listening && transcript) {
      setInputValue(transcript);
    }
  }, [transcript, listening]);

  return (
    <div className="mic-input">
      {/* Status indicator */}
      <div className="mic-status">
        🎙️ {listening ? 'Listening…' : speaking ? 'Speaking…' : 'Idle'}
      </div>

      {/* Active listening state */}
      {listening && !speaking && (
        <div className="waveform">
          <span></span><span></span><span></span><span></span><span></span>
          <button className="stop-btn" onClick={onStopListening}>
            ⏹️ Pause Mic
          </button>
        </div>
      )}

      {/* Transcript box (always visible so you can see & edit) */}
      <div className="manual-input">
        <input
          value={inputValue}
          placeholder="Your response will appear here…"
          onChange={(e) => {
            setInputValue(e.target.value);
            onManualChange?.(e.target.value);
          }}
        />
        <button onClick={() => onManualSubmit?.(inputValue)}>
          Submit Answer
        </button>
      </div>

      {/* Mic paused state */}
      {!listening && !speaking && (
        <div className="mic-paused">
          <button onClick={onResumeListening}>🎙 Resume Mic</button>
        </div>
      )}

      {/* Error display */}
      {error && <p className="mic-error">{error}</p>}
    </div>
  );
};

export default MicInput;
