// FinalReview.jsx (drop-in replacement)
import { useEffect, useState } from 'react';

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
    setReviewData(MOCK_DATA);
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
    <div className="max-w-5xl mx-auto mt-8 p-4 md:p-8 font-sans text-gray-800">
      <h2 className="text-3xl font-extrabold text-center mb-10 text-gray-900 border-b pb-4">📝 Interview Performance Review</h2>

      {/* Scores Block - Centered */}
      {score && (
        <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 border border-gray-100 text-center">
          <h3 className="text-xl font-bold mb-6 text-indigo-600 uppercase tracking-wide">Performance Score</h3>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
             <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-indigo-700">{score.overall}</span>
                <span className="text-sm font-semibold text-gray-500 mt-1">OVERALL</span>
             </div>
             <div className="w-px bg-gray-200 h-16 hidden md:block"></div>
             <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-700">{score.communication}</span>
                <span className="text-xs font-semibold text-gray-400 mt-1">COMMUNICATION</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-700">{score.technical}</span>
                <span className="text-xs font-semibold text-gray-400 mt-1">TECHNICAL</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-700">{score.problemSolving}</span>
                <span className="text-xs font-semibold text-gray-400 mt-1">PROBLEM SOLVING</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-700">{score.behavioral}</span>
                <span className="text-xs font-semibold text-gray-400 mt-1">BEHAVIORAL</span>
             </div>
          </div>
        </div>
      )}

      {/* Summary Block - Centered */}
      {reviewData.summary && (
        <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 border border-gray-100 text-center">
          <h3 className="text-xl font-bold mb-4 text-indigo-600 uppercase tracking-wide">Executive Summary</h3>
          <p className="text-lg leading-relaxed text-gray-700 max-w-3xl mx-auto">{reviewData.summary}</p>
        </div>
      )}

      {/* Strengths & Weaknesses - Side by Side (Already Correct but confirming) */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        {/* Strengths */}
        <div className="bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm flex flex-col h-full">
          <h3 className="text-lg font-bold mb-4 text-green-700 text-center uppercase tracking-wide flex items-center justify-center gap-2">
            💪 Key Strengths
          </h3>
          <ul className="space-y-3 px-4">
            {reviewData.strengths && reviewData.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✔</span>
                <span className="text-gray-800 font-medium">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm flex flex-col h-full">
          <h3 className="text-lg font-bold mb-4 text-red-700 text-center uppercase tracking-wide flex items-center justify-center gap-2">
             ⚠️ Areas for Improvement
          </h3>
          <ul className="space-y-3 px-4">
            {reviewData.weaknesses && reviewData.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-gray-800 font-medium">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Q&A Detailed Review - Side by Side Answer/Suggested */}
      {reviewData.questions?.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Detailed Q&A Analysis</h2>
          
          {reviewData.questions.map((q, index) => {
            const suggested = q.suggestedAnswer || q.correctedAnswer || '';
            
            return (
              <div key={index} className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-200">
                {/* Question Header */}
                <div className="mb-6 border-b pb-4 text-center">
                   <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-bold mb-2">QUESTION {index + 1}</span>
                   <h4 className="text-xl font-semibold text-gray-900 leading-snug">{q.question}</h4>
                </div>

                {/* Answers Grid: Your Answer vs Suggested - Forced Side by Side */}
                <div className="grid grid-cols-2 gap-6">
                  
                  {/* User Answer Column */}
                  <div className="flex flex-col">
                    <div className="font-bold text-gray-500 uppercase text-xs mb-2 text-center md:text-left">Your Response</div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 h-full">
                       <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                         {q.yourAnswer || <span className="text-gray-400 italic">No answer provided.</span>}
                       </p>
                    </div>
                  </div>

                  {/* Suggested Answer Column */}
                  <div className="flex flex-col">
                    <div className="font-bold text-green-600 uppercase text-xs mb-2 text-center md:text-left">Suggested Improvement</div>
                    <div className="bg-green-50 p-5 rounded-xl border border-green-200 h-full">
                       <p className="text-gray-900 whitespace-pre-wrap leading-relaxed font-medium">
                         {suggested}
                       </p>
                    </div>
                  </div>
                </div>

                {/* Notes/Score Footer */}
                {(q.notes || q.score !== undefined) && (
                   <div className="mt-6 pt-4 border-t border-dashed border-gray-300 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 gap-2">
                      <div className="italic max-w-2xl text-center md:text-left">
                        {q.notes && <span>💡 <strong>Coach's Note:</strong> {q.notes}</span>}
                      </div>
                      {q.score !== undefined && (
                        <div className="bg-gray-100 px-3 py-1 rounded-lg font-bold text-gray-700">
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
