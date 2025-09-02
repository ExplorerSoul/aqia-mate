import PromptBuilder from './promptBuilder';

class AIservice {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    this.conversationHistory = [];
    this.model = 'gemini-1.5-flash';

    this.questionCount = 0;
    this.maxQuestions = 5;
    this.awaitingRetry = false;
    this.systemPrompt = '';
    this.promptBuilder = new PromptBuilder();
    this.domain = '';
    this.resumeText = '';

    this.currentPhase = 'opening';
    this.askedQuestions = new Set();
    this.resumeInsights = null;
  }

  generateSystemPrompt(domain, resumeText = '') {
    const builder = new PromptBuilder();
    this.resumeInsights = builder.analyzeResume(resumeText);
    const interviewPrompt = builder.getInterviewPrompt(domain, resumeText, this.resumeInsights);

    return `${interviewPrompt}

CRITICAL INSTRUCTIONS:
- Only ONE question per response
- Never generic, always resume-specific
- Reference actual projects, companies, or skills
- Phases: opening → resume_deep_dive → domain_specific → behavioral → closing
- Max ${this.maxQuestions} questions, then STOP and wait for evaluation

Start with a warm opener.`;
  }

  async initializeInterview(domain, resumeText = '') {
    this.domain = domain;
    this.resumeText = resumeText;
    this.currentPhase = 'opening';
    this.askedQuestions.clear();
    this.systemPrompt = this.generateSystemPrompt(domain, resumeText);
    this.conversationHistory = [];
    this.questionCount = 0;
    this.awaitingRetry = false;

    return await this.getNextQuestion();
  }

  async sendMessage(userResponse = '') {
    // ✅ Hard stop if we hit max questions
    if (this.questionCount >= this.maxQuestions && !this.awaitingRetry) {
      return await this.endInterview();
    }

    this._updateInterviewPhase();

    let contents = [];

    if (this.conversationHistory.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: this.systemPrompt }],
      });
    } else {
      contents = this.conversationHistory
        .filter((msg) => msg.role === 'user')
        .map((msg) => ({ role: 'user', parts: msg.parts }));
    }

    if (userResponse && userResponse.trim()) {
      const contextualPrompt = this._buildContextualPrompt(userResponse);
      contents.push({
        role: 'user',
        parts: [{ text: `${userResponse}\n\n${contextualPrompt}` }],
      });

      if (!this._isWeakAnswer(userResponse)) {
        this.questionCount++;
        this.awaitingRetry = false;
      } else {
        this.awaitingRetry = true;
      }
    }

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 150,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API Error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!aiResponse) {
        throw new Error('Invalid response format from API');
      }

      if (userResponse) {
        this.conversationHistory.push({
          role: 'user',
          parts: [{ text: userResponse }],
        });
      }
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: aiResponse }],
      });

      const cleanQuestion = this._extractCoreQuestion(aiResponse);
      this.askedQuestions.add(cleanQuestion.toLowerCase());

      return cleanQuestion;
    } catch (error) {
      console.error('AI API Error:', error);
      throw new Error(`Failed to get response from AI: ${error.message}`);
    }
  }

  async getNextQuestion() {
    return await this.sendMessage();
  }

  async endInterview() {
    const evalPrompt = this.promptBuilder.buildEvaluationPrompt(
      this.getTranscript(),
      this.domain
    );

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: evalPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API Error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!aiResponse) {
        throw new Error('Invalid response format from API');
      }

      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: aiResponse }],
      });

      // ✅ Persist review so FinalReview can show it
      sessionStorage.setItem('final_review', aiResponse);

      return aiResponse;
    } catch (error) {
      console.error('End Interview Error:', error);
      throw new Error(`Failed to end interview: ${error.message}`);
    }
  }

  _updateInterviewPhase() {
    if (this.questionCount <= 1) {
      this.currentPhase = 'opening';
    } else if (this.questionCount <= 2) {
      this.currentPhase = 'resume_deep_dive';
    } else if (this.questionCount <= 3) {
      this.currentPhase = 'domain_specific';
    } else if (this.questionCount <= 4) {
      this.currentPhase = 'behavioral';
    } else {
      this.currentPhase = 'closing';
    }
  }

  getTranscript() {
    return this.conversationHistory
      .filter((msg) => msg.role !== 'system')
      .map((msg) => ({
        speaker: msg.role === 'user' ? 'Candidate' : 'Interviewer',
        content: msg.parts[0].text,
      }));
  }

  static validateApiKey(apiKey) {
    return typeof apiKey === 'string' && apiKey.length >= 20;
  }

  _isWeakAnswer(answer) {
    const weakPhrases = [
      'sorry',
      "i don't know",
      'not sure',
      'no idea',
      'skip',
      "i don't have",
      'never done',
      "can't say",
      'not familiar',
    ];
    return (
      weakPhrases.some((p) => answer.toLowerCase().includes(p)) ||
      answer.trim().length < 20
    );
  }

  _extractCoreQuestion(response) {
    let cleaned = response
      .replace(/^(Question\s*\d+[\s\.\:\-]*)/i, '')
      .replace(/^\d+[\s\.\:\-]+/, '')
      .replace(/^(Here('|)s|Now|Let('|)s|Next)\s+(question|is)?\s*\d*[\s\.\:\-]*/i, '')
      .replace(/^(Great|Good|Thanks|Alright|Okay|So|Well)[\s,.\-]*/i, '')
      .replace(/--- INTERVIEWER CONTEXT ---[\s\S]*$/i, '')
      .trim();

    const sentences = cleaned
      .split(/(?<=[?.!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const questionSentence = sentences.find((s) => s.endsWith('?'));

    if (!questionSentence) {
      const questionLike = sentences.find((s) =>
        /\b(how|what|why|when|can|would|could|tell|explain|walk|describe|share)\b/i.test(
          s
        )
      );
      return questionLike || cleaned.trim();
    }

    return questionSentence;
  }
}

export default AIservice;
