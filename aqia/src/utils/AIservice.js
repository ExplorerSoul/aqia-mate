import PromptBuilder from './promptBuilder';

class AIservice {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.groq.com/openai/v1/chat/completions';
    this.conversationHistory = [];
    this.model = 'llama3-70b-8192';

    this.questionCount = 0;
    this.maxQuestions = 10;
    this.awaitingRetry = false;
    this.systemPrompt = ''; // ✅ store for later
  }

  generateSystemPrompt(domain, resumeText = '') {
    const builder = new PromptBuilder();
    const resumeAnalysis = builder.analyzeResume(resumeText);
    const domainPrompts = {
      'Software Engineer': 'You are a senior technical interviewer for a Software Engineering position. Focus on coding, system design, data structures, and technical problem-solving.',
      'Data Analyst': 'You are an experienced interviewer for a Data Analyst role. Focus on SQL, visualization, statistics, and business intelligence.',
      'Product Manager': 'You are a seasoned interviewer for a Product Manager role. Focus on product strategy, user research, planning, and stakeholder communication.',
      'Consultant': 'You are a senior partner interviewing for a Management Consultant role. Focus on case studies, frameworks, communication, and analytics.',
      'Marketing': 'You are a marketing director interviewing for a Marketing role. Focus on campaign strategy, digital analytics, and brand building.',
      'Sales': 'You are a sales director interviewing for a Sales role. Focus on pipeline, negotiation, targets, and client relationship building.'
    };

    const basePrompt = domainPrompts[domain] || 'You are a professional interviewer.';

    return `${basePrompt}

CANDIDATE'S RESUME:
${resumeText.trim()}

Experience level: ${resumeAnalysis.experience}
Top skills: ${resumeAnalysis.keySkills.join(', ') || 'N/A'}
Projects mentioned: ${resumeAnalysis.projects.join(', ') || 'N/A'}

You must conduct a 10-question structured interview in this order:
- 1 introduction-style question (e.g., "Tell me about yourself")
- 3 skill-based questions
- 4 deep-dive domain questions
- 2 project-based questions

IMPORTANT: Respond with ONLY the question text. Do not include:
- Question numbers (like "Question 1:", "1.", etc.)
- Greetings or introductions
- Question types or categories
- Any explanatory text before or after the question
- Multiple questions at once

Just ask the direct question as a human interviewer would naturally ask it.`;
  }

  async initializeInterview(domain, resumeText = '') {
    this.systemPrompt = this.generateSystemPrompt(domain, resumeText);
    this.conversationHistory = [
      { role: 'system', content: this.systemPrompt }
    ];
    this.questionCount = 0;
    this.awaitingRetry = false;
    return await this.getNextQuestion();
  }

  async sendMessage(userResponse = '') {
    if (userResponse) {
      this.conversationHistory.push({ role: 'user', content: userResponse });

      if (!this._isWeakAnswer(userResponse)) {
        this.questionCount++;
      } else {
        this.awaitingRetry = true;
      }
    }

    if (this.questionCount >= this.maxQuestions && !this.awaitingRetry) {
      this.conversationHistory.push({
        role: 'user',
        content: 'Please give the final evaluation now.'
      });
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
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content.trim();
      
      // Clean the response to extract only the core question
      const cleanedResponse = this._extractCoreQuestion(aiResponse);
      
      this.conversationHistory.push({ role: 'assistant', content: aiResponse });

      return cleanedResponse;
    } catch (error) {
      console.error('AI API Error:', error);
      throw new Error('Failed to get response from AI. Please check your API key and try again.');
    }
  }

  async getNextQuestion() {
    return await this.sendMessage();
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
    return this.questionCount >= this.maxQuestions || evaluationKeywords.some(k => lower.includes(k));
  }

  getTranscript() {
    return this.conversationHistory
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        speaker: msg.role === 'user' ? 'Candidate' : 'Interviewer',
        content: msg.content
      }));
  }

  static validateApiKey(apiKey) {
    return typeof apiKey === 'string' && apiKey.length >= 20;
  }

  _isWeakAnswer(answer) {
    const weakPhrases = ['sorry', 'i don\'t know', 'not sure', 'no idea', 'skip'];
    return weakPhrases.some(p => answer.toLowerCase().includes(p));
  }

  _extractCoreQuestion(response) {
    // Remove question numbers and prefixes
    let cleaned = response
      .replace(/^(Question\s*\d+[\s\.\:\-]*)/i, '')
      .replace(/^\d+[\s\.\:\-]+/, '')
      .replace(/^(Here's|Now|Let's|Next)\s+(question|is)\s*\d*[\s\.\:\-]*/i, '')
      .replace(/^(Introduction|Skill|Domain|Project).*?question[\s\.\:\-]*/i, '');

    // Remove common interviewer intro phrases
    cleaned = cleaned
      .replace(/^(Great|Good|Thank you|Thanks|Alright|Okay|Now|So|Let me ask you|I'd like to ask|Let's talk about|Tell me about)[\s\,\.\-]*/i, '')
      .replace(/^(Moving on|Next up|For this question|Here's what I want to know)[\s\,\.\-]*/i, '');

    // Extract the actual question (usually the last sentence ending with ?)
    const sentences = cleaned.split(/[.!]+/).filter(s => s.trim());
    const questionSentence = sentences.find(s => s.includes('?'));
    
    if (questionSentence) {
      return questionSentence.trim();
    }

    // If no question mark found, return the cleaned response
    return cleaned.trim();
  }
}

export default AIservice;