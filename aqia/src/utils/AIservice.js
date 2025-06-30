class AIservice {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.groq.com/openai/v1/chat/completions'; // ✅ Groq endpoint
    this.conversationHistory = [];
    this.model = 'llama3-70b-8192'; // ✅ You can change to 'llama3-70b-8192' if preferred
  }

  // Generate domain-based system prompt
  generateSystemPrompt(domain, resumeText = '') {
    const domainPrompts = {
      'Software Engineer': 'You are a senior technical interviewer for a Software Engineering position. Focus on coding skills, system design, algorithms, and technical problem-solving.',
      'Data Analyst': 'You are an experienced interviewer for a Data Analyst role. Focus on SQL, data visualization, statistical analysis, and business intelligence tools.',
      'Product Manager': 'You are a seasoned interviewer for a Product Manager position. Focus on product strategy, user research, roadmap planning, and stakeholder management.',
      'Consultant': 'You are a senior partner interviewing for a Management Consultant role. Focus on case studies, problem-solving frameworks, client management, and analytical thinking.',
      'Marketing': 'You are a marketing director interviewing for a Marketing position. Focus on campaign strategy, digital marketing, analytics, and brand management.',
      'Sales': 'You are a sales director interviewing for a Sales role. Focus on sales methodology, client relationship building, negotiation, and target achievement.'
    };

    const basePrompt = domainPrompts[domain] || 'You are a professional interviewer.';

    return `${basePrompt}

The candidate's resume is:
${resumeText.trim()}

Conduct a structured interview with exactly 10 questions:
1. One introduction question (tell me about yourself)
2. Three skill-based questions related to their background
3. Four deep-dive technical/domain questions
4. Two project-specific questions based on their resume

Keep questions conversational and professional. After the 10th question is answered, provide a comprehensive evaluation with:
- Score out of 10
- Key strengths demonstrated
- Areas for improvement
- Polite closing remarks

Only ask one question at a time. Do not number your questions.`;
  }

  // Initialize interview
  initializeInterview(domain, resumeText = '') {
    const systemPrompt = this.generateSystemPrompt(domain, resumeText);
    this.conversationHistory = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Hello, I\'m ready to start the interview.' }
    ];
    return this.getNextQuestion();
  }

  // Send message and receive response from AI
  async sendMessage(userResponse) {
    if (userResponse) {
      this.conversationHistory.push({ role: 'user', content: userResponse });
    }

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: this.conversationHistory,
          max_tokens: 600,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content.trim();
      this.conversationHistory.push({ role: 'assistant', content: aiResponse });

      return aiResponse;

    } catch (error) {
      console.error('AI API Error:', error);
      throw new Error('Failed to get response from AI. Please check your API key and try again.');
    }
  }

  async getNextQuestion() {
    return await this.sendMessage();
  }

  getTranscript() {
    return this.conversationHistory
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        speaker: msg.role === 'user' ? 'Candidate' : 'Interviewer',
        content: msg.content
      }));
  }

  isInterviewComplete(response) {
    const lower = response.toLowerCase();
    const evaluationKeywords = [
      'your score',
      'you scored',
      'strengths',
      'areas for improvement',
      'final evaluation',
      'closing remarks',
      'overall performance'
    ];
    return evaluationKeywords.some(k => lower.includes(k));
  }

  static validateApiKey(apiKey) {
    return typeof apiKey === 'string' && apiKey.length >= 20;
  }
}

export default AIservice;
