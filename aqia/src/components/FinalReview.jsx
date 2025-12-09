// FinalReview.jsx (drop-in replacement)
import { useEffect, useState } from 'react';
import './FinalReview.css';

const FinalReview = () => {
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Try Session Storage
    const detailed = sessionStorage.getItem('final_review_detailed');
    const simple = sessionStorage.getItem('final_review');

    if (detailed) {
      try {
        setReviewData(JSON.parse(detailed));
        setLoading(false);
        return;
      } catch (err) {
        console.error('Failed to parse detailed review JSON:', err);
      }
    }

    if (simple) {
       setReviewData({
        score: null,
        summary: simple,
        strengths: [],
        weaknesses: [],
        questions: []
       });
       setLoading(false);
       return;
    }

    // 2. Fallback to MOCK_DATA for verification/demo if no real data
    // Assuming MOCK_DATA is global or imported, keeping as is
    // setReviewData(MOCK_DATA); 
    // Commenting out explicit MOCK_DATA reference if not defined in file scope
    // to avoid ReferenceError if it was removed. But keeping logic same as before.
    setLoading(false);

  }, []);

  if (loading) {
    return (
      <div className="fr-message-box">
        <h2 className="fr-message-title">📝 Interview Summary</h2>
        <p className="fr-loading-text">Fetching your review...</p>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="fr-message-box">
        <h2 className="fr-message-title">📝 Interview Summary</h2>
        <p className="fr-error-text">⚠️ No review available. Interview may have been skipped.</p>
      </div>
    );
  }

  const score = reviewData.score || null;

  return (
    <div className="fr-container">
      <h2 className="fr-heading-main">📝 Interview Performance Review</h2>

      {/* Scores Block - Centered */}
      {score && (
        <div className="fr-card">
          <h3 className="fr-section-title">Performance Score</h3>
          <div className="fr-score-grid">
             <div className="fr-score-item">
                <span className="fr-score-large">{score.overall}</span>
                <span className="fr-label-sub">OVERALL</span>
             </div>
             <div className="fr-divider"></div>
             <div className="fr-score-item">
                <span className="fr-score-medium">{score.communication}</span>
                <span className="fr-label-mini">COMMUNICATION</span>
             </div>
             <div className="fr-score-item">
                <span className="fr-score-medium">{score.technical}</span>
                <span className="fr-label-mini">TECHNICAL</span>
             </div>
             <div className="fr-score-item">
                <span className="fr-score-medium">{score.problemSolving}</span>
                <span className="fr-label-mini">PROBLEM SOLVING</span>
             </div>
             <div className="fr-score-item">
                <span className="fr-score-medium">{score.behavioral}</span>
                <span className="fr-label-mini">BEHAVIORAL</span>
             </div>
          </div>
        </div>
      )}

      {/* Summary Block - Centered */}
      {reviewData.summary && (
        <div className="fr-card">
          <h3 className="fr-section-title">Executive Summary</h3>
          <p className="fr-summary-text">{reviewData.summary}</p>
        </div>
      )}

      {/* Strengths & Weaknesses - Side by Side */}
      <div className="fr-grid-2">
        {/* Strengths */}
        <div className="fr-card-strength">
          <h3 className="fr-section-title fr-section-title-center fr-title-strength">
            💪 Key Strengths
          </h3>
          <ul className="fr-list">
            {reviewData.strengths && reviewData.strengths.map((s, i) => (
              <li key={i} className="fr-list-item">
                <span className="fr-icon-check">✔</span>
                <span className="fr-list-text">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="fr-card-weakness">
          <h3 className="fr-section-title fr-section-title-center fr-title-weakness">
             ⚠️ Areas for Improvement
          </h3>
          <ul className="fr-list">
            {reviewData.weaknesses && reviewData.weaknesses.map((w, i) => (
              <li key={i} className="fr-list-item">
                <span className="fr-icon-cross"></span>
                <span className="fr-list-text">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Q&A Detailed Review - Side by Side Answer/Suggested */}
      {reviewData.questions?.length > 0 && (
        <div className="fr-qa-section">
          <h2 className="fr-qa-heading">Detailed Q&A Analysis</h2>
          
          {reviewData.questions.map((q, index) => {
            const suggested = q.suggestedAnswer || q.correctedAnswer || '';
            
            return (
              <div key={index} className="fr-qa-card">
                {/* Question Header */}
                <div className="fr-qa-header">
                   <span className="fr-badge-question">QUESTION {index + 1}</span>
                   <h4 className="fr-question-text">{q.question}</h4>
                </div>

                {/* Answers Grid: Your Answer vs Suggested - Side by Side */}
                <div className="fr-qa-grid">
                  
                  {/* User Answer Column */}
                  <div className="fr-col-answer">
                    <div className="fr-label-answer">Your Response</div>
                    <div className="fr-box-answer">
                       <p className={`fr-text-answer ${!q.yourAnswer ? 'fr-text-empty' : ''}`}>
                         {q.yourAnswer || "No answer provided."}
                       </p>
                    </div>
                  </div>

                  {/* Suggested Answer Column */}
                  <div className="fr-col-answer">
                    <div className="fr-label-answer fr-label-suggested">Suggested Improvement</div>
                    <div className="fr-box-suggested">
                       <p className="fr-text-suggested">
                         {suggested}
                       </p>
                    </div>
                  </div>
                </div>

                {/* Notes/Score Footer */}
                {(q.notes || q.score !== undefined) && (
                   <div className="fr-qa-footer">
                      <div className="fr-note-text">
                        {q.notes && <span>💡 <strong>Coach's Note:</strong> {q.notes}</span>}
                      </div>
                      {q.score !== undefined && (
                        <div className="fr-score-badge">
                           Score: {q.score}/10
                        </div>
                      )}
                   </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default FinalReview;
