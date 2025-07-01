import './MicInput.css';

const MicInput = ({ listening, speaking, error, onStopListening, onResumeListening }) => {
  return (
    <div className="mic-input">
      <button disabled>
        🎙️ {listening ? 'Listening...' : 'Waiting...'}
      </button>

      {listening && !speaking && (
        <div className="waveform">
          <span></span><span></span><span></span><span></span><span></span>
          <button className="stop-btn" onClick={onStopListening}>
            ⏹️ Pause Mic
          </button>
        </div>
      )}

      {!listening && !speaking && (
        <button onClick={onResumeListening}>
          🎙 Resume Mic
        </button>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default MicInput;
