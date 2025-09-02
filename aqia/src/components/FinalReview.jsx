import { useEffect, useState } from 'react';

const FinalReview = () => {
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem('final_review_detailed');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReviewData(parsed);
      } catch (err) {
        console.error('Failed to parse review data', err);
        setReviewData(null);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded-2xl shadow-md">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          📝 Interview Summary
        </h2>
        <p className="text-gray-500 italic">Fetching your review...</p>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded-2xl shadow-md">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          📝 Interview Summary
        </h2>
        <p className="text-red-500 font-medium">
          ⚠️ No review available. Interview may have been skipped.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        📝 Interview Summary
      </h2>

      {reviewData.questions?.length > 0 && (
        <div className="space-y-4">
          {reviewData.questions.map((q, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-1">
                Q{index + 1}: {q.question}
              </h3>
              <p className="text-gray-700 mb-1">
                <strong>Your Answer:</strong> {q.yourAnswer || 'N/A'}
              </p>
              {q.correctedAnswer && (
                <p className="text-green-700">
                  <strong>Suggested Improvement:</strong> {q.correctedAnswer}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {reviewData.strengths && reviewData.strengths.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">💪 Strengths:</h3>
          <ul className="list-disc list-inside text-gray-800">
            {reviewData.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {reviewData.weaknesses && reviewData.weaknesses.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">⚠️ Weaknesses:</h3>
          <ul className="list-disc list-inside text-gray-800">
            {reviewData.weaknesses.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FinalReview;
