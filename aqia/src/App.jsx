import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Onboarding from './components/Onboarding';
import InterviewFlow from './components/InterviewFlow';
import FinalReview from './components/FinalReview';

function App() {
  const [appData, setAppData] = useState(() => {
    // ✅ Load initial state from sessionStorage so refresh doesn't wipe data
    const apiKey = sessionStorage.getItem('user_api_key');
    const domain = sessionStorage.getItem('user_domain');
    const resumeText = sessionStorage.getItem('user_resume');
    return apiKey && domain && resumeText
      ? { apiKey, domain, resumeText }
      : {};
  });

  const [gptService, setGptService] = useState(null);

  // ✅ Keep appData in sync with sessionStorage
  useEffect(() => {
    if (appData.apiKey) sessionStorage.setItem('user_api_key', appData.apiKey);
    if (appData.domain) sessionStorage.setItem('user_domain', appData.domain);
    if (appData.resumeText)
      sessionStorage.setItem('user_resume', appData.resumeText);
  }, [appData]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Onboarding page */}
        <Route path="/" element={<Onboarding setAppData={setAppData} />} />

        {/* Interview flow */}
        <Route
          path="/interview"
          element={
            appData.apiKey && appData.domain && appData.resumeText ? (
              <InterviewFlow appData={appData} setGptService={setGptService} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Final review */}
        <Route
          path="/review"
          element={
            sessionStorage.getItem('final_review') ? (
              <FinalReview gptService={gptService} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
