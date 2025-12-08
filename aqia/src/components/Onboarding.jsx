// Onboarding.jsx (drop-in replacement)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.min.mjs';

import PromptBuilder from '../utils/promptBuilder';

//  Set global PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const Onboarding = ({ setAppData }) => {
  const defaultApiKey = import.meta.env.VITE_GROQ_API_KEY || '';

  const [apiKey, setApiKey] = useState(defaultApiKey);
  const [domain, setDomain] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [questionCount, setQuestionCount] = useState(
    Number(sessionStorage.getItem('user_question_count')) || 8
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  //  Load saved values (except apiKey)
  useEffect(() => {
    const storedDomain = sessionStorage.getItem('user_domain');
    const storedResume = sessionStorage.getItem('user_resume');
    if (storedDomain) setDomain(storedDomain);
    if (storedResume) setResumeText(storedResume);
  }, []);

  //  Resume upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('❌ Please upload a valid PDF file only.');
      return;
    }

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const pdf = await pdfjsLib.getDocument({ data: reader.result }).promise;
        let text = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ') + '\n';
        }

        const cleaned = text.trim();
        if (!cleaned) {
          alert('❌ Could not extract text. Upload a text-based PDF.');
          return;
        }

        setResumeText(cleaned);
        sessionStorage.setItem('user_resume', cleaned);
      } catch (err) {
        console.error('❌ Failed to parse PDF:', err);
        alert('Error reading resume.');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  //  Handle Start
  const handleStart = () => {
    if (!apiKey) {
      alert('❌ API key missing. Check your .env file (VITE_GROQ_API_KEY).');
      return;
    }
    if (!domain || !resumeText) {
      alert('❗ Please select a domain and upload a resume.');
      return;
    }
    if (!new PromptBuilder().isValidDomain(domain)) {
      alert('❌ Invalid domain selected.');
      return;
    }
    if (!Number.isInteger(questionCount) || questionCount < 3 || questionCount > 20) {
      alert('❗ Questions must be between 3 and 20.');
      return;
    }

    // Save session values
    sessionStorage.setItem('user_domain', domain);
    sessionStorage.setItem('user_resume', resumeText);
    sessionStorage.setItem('user_question_count', String(questionCount));
    sessionStorage.setItem('user_api_key', apiKey);

    setAppData({ apiKey, domain, resumeText, questionCount });
    navigate('/interview');
  };

  return (
    <div className="onboarding-container">
      <h1>AQIA - AI Interview Assistant</h1>

      {/*  API key info */}
      {apiKey ? (
        <p style={{ fontSize: '0.9rem', color: 'gray' }}>
          🔑 Using system API key from .env
        </p>
      ) : (
        <p style={{ fontSize: '0.9rem', color: 'red' }}>
          ⚠️ No API key found. Add VITE_GROQ_API_KEY to your .env file.
        </p>
      )}

      <label>🎯 Select Interview Domain:</label>
      <select value={domain} onChange={(e) => setDomain(e.target.value)}>
        <option value="">-- Choose Domain --</option>
        {new PromptBuilder().getAvailableDomains().map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <label>🔢 Number of Questions:</label>
      <input
        type="number"
        min={3}
        max={20}
        value={questionCount}
        onChange={(e) => setQuestionCount(Number(e.target.value))}
        style={{ width: 120 }}
      />

      <label>📄 Upload Resume (PDF only):</label>
      <input type="file" accept="application/pdf" onChange={handleResumeUpload} />

      {loading && <p>⏳ Parsing resume...</p>}
      {!loading && resumeText && (
        <p>✅ Resume loaded ({resumeText.length} characters)</p>
      )}

      <button onClick={handleStart}>🚀 Start Interview</button>
    </div>
  );
};

export default Onboarding;
