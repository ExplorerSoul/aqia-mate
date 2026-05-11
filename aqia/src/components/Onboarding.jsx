// Onboarding.jsx (drop-in replacement)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.min.mjs';

import PromptBuilder from '../utils/promptBuilder';
import './Onboarding.css';

//  Set global PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const Onboarding = ({ setAppData }) => {
  const [domain, setDomain] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFilename, setResumeFilename] = useState('');
  const [questionCount, setQuestionCount] = useState(
    Number(sessionStorage.getItem('user_question_count')) || 8
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      setError('❌ Please upload a valid PDF file only.');
      return;
    }

    setError('');
    setLoading(true);
    setResumeFilename(file.name);
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
          setError('❌ Could not extract text. Upload a text-based PDF.');
          setResumeFilename('');
          return;
        }

        setResumeText(cleaned);
        sessionStorage.setItem('user_resume', cleaned);
      } catch (err) {
        console.error('❌ Failed to parse PDF:', err);
        setError('Error reading resume. Please try again.');
        setResumeFilename('');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleStart = () => {
    setError('');

    if (!domain || !resumeText) {
      setError('❗ Please select a domain and upload a resume.');
      return;
    }
    if (!new PromptBuilder().isValidDomain(domain)) {
      setError('❌ Invalid domain selected.');
      return;
    }
    if (!Number.isInteger(questionCount) || questionCount < 3 || questionCount > 20) {
      setError('❗ Questions must be between 3 and 20.');
      return;
    }

    sessionStorage.setItem('user_domain', domain);
    sessionStorage.setItem('user_resume', resumeText);
    sessionStorage.setItem('user_question_count', String(questionCount));

    setAppData({ domain, resumeText, questionCount });
    navigate('/interview');
  };

  return (
    <div className="onboarding-container">
      <h1>AQIA — AI Interview Assistant</h1>

      {/* Domain selector */}
      <div className="onboarding-field">
        <label>🎯 Interview Domain</label>
        <select value={domain} onChange={(e) => setDomain(e.target.value)}>
          <option value="">— Choose a domain —</option>
          {new PromptBuilder().getAvailableDomains().map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Question count slider */}
      <div className="onboarding-field">
        <label>🔢 Number of Questions</label>
        <div className="range-row">
          <input
            type="range"
            min={3}
            max={20}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
          />
          <span className="range-value">{questionCount}</span>
        </div>
      </div>

      {/* Resume upload */}
      <div className="onboarding-field">
        <label>📄 Resume (PDF only)</label>
        <div className="upload-area">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleResumeUpload}
          />
          <span className="upload-icon">📁</span>
          <p className="upload-hint">
            <strong>Click to upload</strong> or drag &amp; drop your PDF
          </p>
        </div>

        {loading && (
          <span className="upload-parsing">Parsing resume…</span>
        )}

        {!loading && resumeText && resumeFilename && (
          <span className="resume-badge">✅ {resumeFilename}</span>
        )}

        {!loading && resumeText && !resumeFilename && (
          <span className="resume-badge">✅ Resume loaded</span>
        )}
      </div>

      {/* Inline error */}
      {error && <div className="onboarding-error">{error}</div>}

      <button onClick={handleStart}>🚀 Start Interview</button>
    </div>
  );
};

export default Onboarding;
