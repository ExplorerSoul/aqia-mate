import PromptBuilder from './promptBuilder';

class AIservice {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.groq.com/openai/v1/chat/completions";
    this.model = "llama-3.3-70b-versatile"; // Updated to latest supported model
    this.conversationHistory = [];
    this.promptBuilder = new PromptBuilder();
    this.questionCount = 0;
    this.maxQuestions = 8;
    this.resumeAnalysis = null;
    this.domain = '';
    this.currentPhase = 'opening'; // opening, resume, domain, behavioral, closing
  }

  async initializeInterview(domain, resumeText, options = {}) {
    this.domain = domain;
    this.maxQuestions = options.maxQuestions || 8;
    this.resumeAnalysis = this.promptBuilder.analyzeResume(resumeText);
    
    // System Prompt
    const systemPrompt = this.promptBuilder.getInterviewPrompt(domain, resumeText, this.resumeAnalysis);
    
    this.conversationHistory = [
      { role: "system", content: systemPrompt }
    ];

    // Generate first question (Opening)
    // We force the first question to be the opening one to save a turn or ensure consistency
    const opener = "Hello! I've reviewed your resume and I'm excited to chat. Can you briefly introduce yourself and tell me what brings you here today?";
    
    this.conversationHistory.push({ role: "assistant", content: opener });
    return opener;
  }

  async sendMessage(userResponse = '', options = { expectJson: false }) {
    if (userResponse) {
      this.conversationHistory.push({ role: "user", content: userResponse });
      this.questionCount++;
    }

    // Check if we reached the limit
    if (this.questionCount >= this.maxQuestions && !options.expectJson) {
      return 'END_OF_INTERVIEW';
    }

    try {
      const messages = [...this.conversationHistory];
      
      // If expecting JSON (Review), append a specific instruction if not already present
      // The prompt for JSON is usually passed as 'userResponse' in the calling code (InterviewFlow),
      // so it's already in history. We just need to ensure we ask for JSON mode if supported or just text.
      // Groq supports JSON mode for Llama3.

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.6,
          max_tokens: options.expectJson ? 2000 : 1024,
          response_format: options.expectJson ? { type: "json_object" } : undefined
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Groq API Error");
      }

      const data = await response.json();
      const aiText = data.choices[0].message.content;

      if (!options.expectJson) {
        this.conversationHistory.push({ role: "assistant", content: aiText });
      }

      return aiText;

    } catch (error) {
      console.error("Groq API Error:", error);
      throw error;
    }
  }

  isInterviewComplete(response) {
    return this.questionCount >= this.maxQuestions;
  }
}

export default AIservice;