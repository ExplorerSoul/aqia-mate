// FinalReview.jsx (drop-in replacement)
import { useEffect, useState } from 'react';

const FinalReview = () => {
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detailed = sessionStorage.getItem('final_review_detailed');
    const simple = sessionStorage.getItem('final_review');

    let parsed = null;
    if (detailed) {
      try {
        parsed = JSON.parse(detailed);
      } catch (err) {
        console.error('Failed to parse detailed review JSON:', err);
      }
    }

    if (!parsed && simple) {
      // Fallback: wrap plain text into minimal object
      parsed = {
        score: null,
        summary: simple,
        strengths: [],
        weaknesses: [],
        questions: []
      };
    }

    setReviewData(parsed);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded-2xl shadow-md">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📝 Interview Summary</h2>
        <p className="text-gray-500 italic">Fetching your review...</p>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded-2xl shadow-md">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📝 Interview Summary</h2>
        <p className="text-red-500 font-medium">⚠️ No review available. Interview may have been skipped.</p>
      </div>
    );
  }

  const score = reviewData.score || null;

  return (
    <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📝 Interview Summary</h2>

      {/* Overall score & summary */}
      {score && (
        <div className="mb-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">📊 Scores</h3>
          <div className="grid grid-cols-2 gap-2 text-gray-800">
            <div><strong>Overall:</strong> {score.overall}/100</div>
            <div><strong>Communication:</strong> {score.communication}/100</div>
            <div><strong>Technical:</strong> {score.technical}/100</div>
            <div><strong>Problem Solving:</strong> {score.problemSolving}/100</div>
            <div><strong>Behavioral:</strong> {score.behavioral}/100</div>
          </div>
        </div>
      )}

      {reviewData.summary && (
        <div className="mb-4 p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">🧾 Summary</h3>
          <p className="text-gray-800 whitespace-pre-wrap">{reviewData.summary}</p>
        </div>
      )}

      {/* Questions review */}
      {reviewData.questions?.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">🧩 Question-by-Question Review</h3>
          {reviewData.questions.map((q, index) => {
            const suggested = q.suggestedAnswer || q.correctedAnswer || '';
            return (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-1">Q{index + 1}: {q.question}</h4>
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Your Answer</p>
                  <pre className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-2 rounded">{q.yourAnswer || 'N/A'}</pre>
                </div>

                {suggested && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">Suggested Improvement</p>
                    <pre className="whitespace-pre-wrap text-green-800 bg-green-50 p-2 rounded">{suggested}</pre>
                  </div>
                )}

                {(q.notes || q.score !== undefined) && (
                  <div className="text-sm text-gray-700">
                    {q.notes && <p className="mb-1"><strong>Notes:</strong> {q.notes}</p>}
                    {q.score !== undefined && <p><strong>Per-question score:</strong> {q.score}/10</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Strengths / Weaknesses */}
      {reviewData.strengths && reviewData.strengths.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">💪 Strengths</h3>
          <ul className="list-disc list-inside text-gray-800">
            {reviewData.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {reviewData.weaknesses && reviewData.weaknesses.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">⚠️ Weaknesses</h3>
          <ul className="list-disc list-inside text-gray-800">
            {reviewData.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FinalReview;
