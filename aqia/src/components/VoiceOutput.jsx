const VoiceOutput = ({ text, speaking }) => {
  if (!text) return null;

  return (
    <div className="voice-output">
      <p>
        <strong>AI:</strong> {text}
        {speaking && <span className="speaking-indicator"> 🔊</span>}
      </p>
    </div>
  );
};

export default VoiceOutput;
