import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.min.mjs';
import ResumeParser from './ResumeParser';

// ✅ Vite-compatible worker path
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
  <ResumeParser onParse={(text) => setResumeText(text)} />

  // Handle PDF resume upload and parse text
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];

    // ✅ Add this block right after getting the file
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

        setResumeText(text.trim());
        } catch (err) {
        console.error('Failed to parse PDF:', err);
        alert('❌ Error reading resume.');
        }
        setLoading(false);
    };

    reader.readAsArrayBuffer(file);
};


  const handleStart = () => {
    if (!apiKey || !domain || !resumeText) {
      alert('Please fill all fields and upload resume.');
      return;
    }

    sessionStorage.setItem('user_api_key', apiKey);

    // Store initial data for interview
    setAppData({
      apiKey,
      domain,
      resumeText
    });

    navigate('/interview');
  };

  return (
    <div className="onboarding-container">
      <h1>🎤 AQIA</h1>

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
        <option value="Analyst">Analyst</option>
        <option value="Product Manager">Product Manager</option>
      </select>

      <label>📄 Upload Resume (PDF):</label>
      <input type="file" accept="application/pdf" onChange={handleResumeUpload} />


      {loading && <p>⏳ Parsing resume...</p>}
      {resumeText && <p>✅ Resume loaded</p>}

      <button onClick={handleStart}>🚀 Start Interview</button>
    </div>
  );
};

export default Onboarding;
