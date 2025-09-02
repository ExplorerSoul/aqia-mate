import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Onboarding from "./components/Onboarding";
import InterviewFlow from "./components/InterviewFlow";
import FinalReview from "./components/FinalReview";

function App() {
  const [appData, setAppData] = useState(() => {
    const apiKey = sessionStorage.getItem("user_api_key");
    const domain = sessionStorage.getItem("user_domain");
    const resumeText = sessionStorage.getItem("user_resume");
    return apiKey && domain && resumeText ? { apiKey, domain, resumeText } : {};
  });

  const [gptService, setGptService] = useState(null);

  useEffect(() => {
    if (appData.apiKey) sessionStorage.setItem("user_api_key", appData.apiKey);
    if (appData.domain) sessionStorage.setItem("user_domain", appData.domain);
    if (appData.resumeText) sessionStorage.setItem("user_resume", appData.resumeText);
  }, [appData]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Onboarding setAppData={setAppData} />
    },
    {
      path: "/interview",
      element:
        appData.apiKey && appData.domain && appData.resumeText ? (
          <InterviewFlow appData={appData} setGptService={setGptService} />
        ) : (
          <Navigate to="/" replace />
        )
    },
    {
      path: "/review",
      element: <FinalReview gptService={gptService} />
    },
    {
      path: "*",
      element: <Navigate to="/" replace />
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;
