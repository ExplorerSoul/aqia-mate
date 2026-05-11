import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Onboarding from "./components/Onboarding";
import InterviewFlow from "./components/InterviewFlow";
import FinalReview from "./components/FinalReview";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard"; // We'll build this next
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="loading">Loading...</div>;
  
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  const [appData, setAppData] = useState(() => {
    const domain = sessionStorage.getItem("user_domain");
    const resumeText = sessionStorage.getItem("user_resume");
    return domain && resumeText ? { domain, resumeText } : {};
  });

  const [gptService, setGptService] = useState(null);

  useEffect(() => {
    if (appData.domain) sessionStorage.setItem("user_domain", appData.domain);
    if (appData.resumeText) sessionStorage.setItem("user_resume", appData.resumeText);
  }, [appData]);

  const { user, loading } = useAuth();
  const router = createBrowserRouter([
    {
      path: "/login",
      element: user ? <Navigate to="/" replace /> : <AuthPage />
    },
    {
      path: "/",
      element: (
        <PrivateRoute>
          <Dashboard setAppData={setAppData} />
        </PrivateRoute>
      )
    },
    {
      path: "/setup",
      element: (
        <PrivateRoute>
          <Onboarding setAppData={setAppData} />
        </PrivateRoute>
      )
    },
    {
      path: "/interview",
      element:
        appData.domain && appData.resumeText ? (
          <PrivateRoute>
             <InterviewFlow appData={appData} setGptService={setGptService} />
          </PrivateRoute>
        ) : (
          <Navigate to="/setup" replace />
        )
    },
    {
      path: "/review",
      element: (
        <PrivateRoute>
           <FinalReview gptService={gptService} />
        </PrivateRoute>
      )
    },
    {
      path: "*",
      element: <Navigate to="/" replace />
    }
  ]);

  if (loading) return <div className="loading">Initializing...</div>;

  return <RouterProvider router={router} />;
}

export default function AppWithProvider() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
