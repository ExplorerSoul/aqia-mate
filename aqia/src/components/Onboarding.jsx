import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.min.mjs';

// Set global PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const Onboarding = ({ setAppData }) => {
  const [apiKey, setApiKey] = useState('');
  const [domain, setDomain] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Load saved values from sessionStorage
  useEffect(() => {
    const storedApiKey = sessionStorage.getItem('user_api_key');
    const storedDomain = sessionStorage.getItem('user_domain');
    const storedResume = sessionStorage.getItem('user_resume');

    if (storedApiKey) setApiKey(storedApiKey);
    if (storedDomain) setDomain(storedDomain);
    if (storedResume) setResumeText(storedResume);
  }, []);

  // ✅ Parse uploaded resume
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
        const pdf = await pdfjsLib.getDocument(reader.result).promise;
        let text = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ') + '\n';
        }

        const cleaned = text.trim();
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

  // ✅ Handle form submit
  const handleStart = () => {
    if (!apiKey || !domain || !resumeText) {
      alert('❗ Please fill all fields and upload a resume.');
      return;
    }

    sessionStorage.setItem('user_api_key', apiKey);
    sessionStorage.setItem('user_domain', domain);
    sessionStorage.setItem('user_resume', resumeText);

    setAppData({ apiKey, domain, resumeText });
    navigate('/interview');
  };

  return (
    <div className="onboarding-container">
      <h1>AQIA - AI Interview Assistant</h1>

      <label>🔑 Groq API Key:</label>
      <input
        type="password"
        placeholder="gsk_..."
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />

      <label>🎯 Select Interview Domain:</label>
      <select value={domain} onChange={(e) => setDomain(e.target.value)}>
        <option value="">-- Choose Domain --</option>
        <option value="Software Engineer">Software Engineer</option>
        <option value="Consultant">Consultant</option>
        <option value="Data Analyst">Data Analyst</option>
        <option value="Product Manager">Product Manager</option>
        <option value="Marketing">Marketing</option>
        <option value="Sales">Sales</option>
      </select>

      <label>📄 Upload Resume (PDF only):</label>
      <input type="file" accept="application/pdf" onChange={handleResumeUpload} />

      {loading && <p>⏳ Parsing resume...</p>}
      {!loading && resumeText && <p>✅ Resume loaded ({resumeText.length} characters)</p>}

      <button onClick={handleStart}>🚀 Start Interview</button>
    </div>
  );
};

export default Onboarding;
