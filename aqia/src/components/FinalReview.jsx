import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FinalReview = ({ gptService }) => {
  const [report, setReport] = useState('');
  const [transcript, setTranscript] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const generateReport = async () => {
      try {
        const finalPrompt = [
          { role: 'system', content: 'You are an AI interviewer. The candidate has completed the interview. Evaluate them.' },
          ...gptService.conversationHistory
        ];

        const finalResponse = await gptService.sendMessage();
        const finalTranscript = gptService.getTranscript();

        setReport(finalResponse);
        setTranscript(finalTranscript);
      } catch (err) {
        alert('❌ Failed to load review.');
        navigate('/');
      }
    };

    generateReport();
  }, []);

  return (
    <div className="final-review-container">
      <h2>🧾 Interview Summary & Feedback</h2>

      <section>
        <h3>📜 Transcript</h3>
        <ul>
          {transcript.map((entry, index) => (
            <li key={index}>
              <strong>{entry.speaker}:</strong> {entry.content}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>🧠 Final Evaluation</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{report}</pre>
      </section>

      <button onClick={() => navigate('/')}>🔁 Start New Interview</button>
    </div>
  );
};

export default FinalReview;
