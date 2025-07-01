import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.min.mjs';

// Configure PDF.js worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const ResumeParser = ({ onParse }) => {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('❌ Please upload a valid PDF file.');
      return;
    }

    setFileName(file.name);
    setLoading(true);

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(reader.result).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map(item => item.str).join(' ');
          text += pageText + '\n';
        }

        onParse(text.trim());
      } catch (error) {
        console.error('❌ PDF parsing error:', error);
        alert('Error parsing resume.');
        onParse(null);
        setFileName('');
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      alert('❌ Error reading file.');
      onParse(null);
      setFileName('');
      setLoading(false);
    };
  };

  return (
    <div className="resume-parser">
      <label>📄 Upload Resume (PDF Only):</label>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileUpload}
        disabled={loading}
      />

      {loading && <p>⏳ Parsing resume...</p>}
      {fileName && !loading && <p>✅ <strong>{fileName}</strong> uploaded</p>}
    </div>
  );
};

export default ResumeParser;
