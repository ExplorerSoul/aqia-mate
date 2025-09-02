// AIservice.js
import PromptBuilder from './promptBuilder';

class AIservice {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    this.promptBuilder = new PromptBuilder();
    this.model = 'gemini-1.5-flash';

    this.conversationHistory = [];
    this.resumeInsights = null;
    this.domain = '';
    this.resumeText = '';

    this.questionCount = 0;
    this.maxQuestions = 10;
    this.awaitingRetry = false;

    this.currentPhase = 'opening';
    this.askedQuestions = new Set();
    this.systemPrompt = '';
  }

  generateSystemPrompt(domain, resumeText = '') {
    try {
      this.resumeInsights = this.promptBuilder.analyzeResume(resumeText);
    } catch {
      this.resumeInsights = null;
    }

    const interviewPrompt = this.promptBuilder.getInterviewPrompt(
      domain,
      resumeText,
      this.resumeInsights || {}
    );

    return `${interviewPrompt}

RULES:
- Ask only ONE clear question at a time.
- Do NOT repeat resume lines word-for-word.
- Use natural, conversational tone.
- Start friendly → then ask about resume/projects → then technical/domain → then teamwork/behavioral → then closing.
- No numbering (no "Question 1", "Phase 2").
- Stop after ${this.maxQuestions} questions.`;
  }

  async initializeInterview(domain, resumeText = '') {
    if (!domain) throw new Error('Domain is required.');
    this.domain = domain;
    this.resumeText = resumeText || '';
    this.systemPrompt = this.generateSystemPrompt(domain, resumeText);

    this.conversationHistory = [];
    this.questionCount = 0;
    this.awaitingRetry = false;
    this.currentPhase = 'opening';
    this.askedQuestions = new Set();

    return await this.getNextQuestion();
  }

  async sendMessage(userResponse = '') {
    if (userResponse && userResponse.trim()) {
      this.conversationHistory.push({ role: 'user', parts: [{ text: userResponse }] });

      if (!this._isWeakAnswer(userResponse)) {
        this.questionCount++;
        this.awaitingRetry = false;
      } else {
        this.awaitingRetry = true;
      }
    }

    // End → evaluation
    if (this.questionCount >= this.maxQuestions && !this.awaitingRetry) {
      const evalPrompt = this.promptBuilder.buildEvaluationPrompt(
        this.getTranscript(),
        this.domain,
        this.resumeInsights || {}
      );
      this.conversationHistory.push({ role: 'user', parts: [{ text: evalPrompt }] });
      return evalPrompt;
    }

    // Update phase internally (not shown to AI)
    if (userResponse && !this.awaitingRetry) {
      if (this.questionCount === 1) this.currentPhase = 'resume';
      else if (this.questionCount === 3) this.currentPhase = 'domain';
      else if (this.questionCount === 6) this.currentPhase = 'behavioral';
      else if (this.questionCount === this.maxQuestions - 1) this.currentPhase = 'closing';
    }

    // Build request
    const contents = this.conversationHistory.map(m => ({
      role: m.role,
      parts: m.parts
    }));

    if (this.conversationHistory.length === 0) {
      contents.push({ role: 'user', parts: [{ text: this.systemPrompt }] });
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: this._phaseInstruction() }]
      });
    }

    const body = {
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
    };

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      const aiResponse =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim?.() || '';

      this.conversationHistory.push({ role: 'model', parts: [{ text: aiResponse }] });

      return this._extractCoreQuestion(aiResponse);
    } catch (err) {
      throw new Error(`AI API Error: ${err.message}`);
    }
  }

  async getNextQuestion() {
    return await this.sendMessage();
  }

  async endInterviewEarly() {
    const evalPrompt = this.promptBuilder.buildEvaluationPrompt(
      this.getTranscript(),
      this.domain,
      this.resumeInsights || {}
    );
    return await this.sendMessage(evalPrompt);
  }

  isInterviewComplete(response = '') {
    if (this.questionCount >= this.maxQuestions && !this.awaitingRetry) return true;
    const lower = (response || '').toLowerCase();
    return ['score', 'strengths', 'weaknesses', 'evaluation', 'recommendation'].some(k =>
      lower.includes(k)
    );
  }

  getTranscript() {
    return this.conversationHistory
      .filter(m => m.role !== 'system')
      .map(m => ({
        speaker: m.role === 'user' ? 'Candidate' : 'Interviewer',
        content: m.parts?.[0]?.text || ''
      }));
  }

  static validateApiKey(apiKey) {
    return typeof apiKey === 'string' && apiKey.length >= 20;
  }

  _isWeakAnswer(answer) {
    const weakPhrases = ["sorry", "i don't know", "not sure", "skip", "pass"];
    return weakPhrases.some(p => answer.toLowerCase().includes(p));
  }

  _extractCoreQuestion(response) {
    if (!response || typeof response !== 'string') return '';

    let cleaned = response
      .replace(/^(Question\s*\d+[:.\-]*)/i, '')
      .replace(/^\d+[:.\-]+/, '')
      .replace(/^(Here('|)s|Now|Next|Let('|)s)\s+(question|is)?\s*\d*[:.\-]*/i, '')
      .replace(/^(Great|Good|Thanks|Alright|Okay|So|Well)[,.\-]*/i, '');

    if (!cleaned.trim().endsWith('?')) {
      cleaned = cleaned.replace(/^you .*$/i, '').trim();
    }

    const sentences = cleaned.split(/(?<=[?.!])\s+/).map(s => s.trim());
    const qSentence = sentences.find(s => s.endsWith('?'));
    return (
      qSentence ||
      sentences.find(s =>
        /\b(how|what|why|when|where|which|who|can|could|would|should)\b/i.test(s)
      ) ||
      ''
    );
  }

  // 🔥 Natural instructions instead of "phase names"
  _phaseInstruction() {
    switch (this.currentPhase) {
      case 'opening':
        return 'Ask a friendly question about their background or motivation.';
      case 'resume':
        return 'Ask about a project, skill, or achievement mentioned in their background.';
      case 'domain':
        return `Ask a practical question about ${this.domain} or problem-solving in that field.`;
      case 'behavioral':
        return 'Ask about teamwork, leadership, or how they handled challenges.';
      case 'closing':
        return 'Ask a closing question about future goals or if they have any questions.';
      default:
        return 'Ask a clear, relevant interview question.';
    }
  }
}

export default AIservice;
