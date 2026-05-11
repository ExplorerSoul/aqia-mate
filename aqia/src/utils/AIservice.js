import PromptBuilder from './promptBuilder';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

class AIservice {
  constructor() {
    // API key is now server-side only — no longer needed on the client
    this.model = "llama-3.3-70b-versatile";
    this.conversationHistory = [];
    this.promptBuilder = new PromptBuilder();
    this.questionCount = 0;
    this.maxQuestions = 8;
    this.resumeAnalysis = null;
    this.domain = '';
  }

  async initializeInterview(domain, resumeText, options = {}) {
    this.domain = domain;
    this.maxQuestions = options.maxQuestions || 8;
    this.resumeAnalysis = this.promptBuilder.analyzeResume(resumeText);

    const systemPrompt = this.promptBuilder.getInterviewPrompt(domain, resumeText, this.resumeAnalysis);

    this.conversationHistory = [
      { role: "system", content: systemPrompt }
    ];

    const opener = "Hello! I've reviewed your resume and I'm excited to chat. Can you briefly introduce yourself and tell me what brings you here today?";
    this.conversationHistory.push({ role: "assistant", content: opener });
    return opener;
  }

  async sendMessage(userResponse = '', options = { expectJson: false }) {
    if (userResponse) {
      this.conversationHistory.push({ role: "user", content: userResponse });
      this.questionCount++;
    }

    if (this.questionCount >= this.maxQuestions && !options.expectJson) {
      return 'END_OF_INTERVIEW';
    }

    const token = localStorage.getItem('token');
    const body = {
      model: this.model,
      messages: [...this.conversationHistory],
      temperature: 0.6,
      max_tokens: options.expectJson ? 2000 : 1024,
    };
    if (options.expectJson) {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Chat API error ${response.status}`);
    }

    const data = await response.json();
    const aiText = data.choices[0].message.content;

    if (!options.expectJson) {
      this.conversationHistory.push({ role: "assistant", content: aiText });
    }

    return aiText;
  }

  isInterviewComplete() {
    return this.questionCount >= this.maxQuestions;
  }
}

export default AIservice;
