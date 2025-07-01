import { useEffect, useState } from 'react';

const FinalReview = () => {
  const [review, setReview] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('final_review');
    if (saved) setReview(saved);
  }, []);

  if (!review) return <p>⚠️ No review available. Please complete an interview first.</p>;

  return (
    <div className="final-review-container">
      <h2>📝 Interview Summary</h2>
      <pre>{review}</pre>
    </div>
  );
};

export default FinalReview;
