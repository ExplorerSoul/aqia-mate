import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import Onboarding from './components/Onboarding';
import InterviewFlow from './components/InterviewFlow';
import FinalReview from './components/FinalReview'; // ✅ Import FinalReview if you have it

function App() {
  const [appData, setAppData] = useState({});
  const [gptService, setGptService] = useState(null); // ✅ Store GPT instance

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboarding setAppData={setAppData} />} />
        <Route
          path="/interview"
          element={
            <InterviewFlow
              appData={appData}
              setGptService={setGptService} // pass down
            />
          }
        />
        <Route
          path="/review"
          element={<FinalReview gptService={gptService} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
