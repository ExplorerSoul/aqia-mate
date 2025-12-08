import './MicInput.css';

const MicInput = ({
  listening,
  speaking,
  error,      
  typedAnswer,       // manual typed answer from parent
  onTypedChange,
  onStopListening,
  onResumeListening,
  onManualSubmit,
}) => {
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
            ⏹️ Stop Recording
          </button>
        </div>
      )}

      

      {/* Manual typed input */}
      <div className="manual-input">
        <p className="label">⌨️ Type Answer (optional)</p>
        <input
          value={typedAnswer}
          placeholder="Type here (will override transcript)"
          onChange={(e) => onTypedChange?.(e.target.value)}
        />
        <button
          onClick={() => {
            onManualSubmit?.(typedAnswer);
          }}
        >
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
