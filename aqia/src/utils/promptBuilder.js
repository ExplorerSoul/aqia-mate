class PromptBuilder {
  constructor() {
    this.domainTemplates = {
      'Software Engineer': {
        focus: 'coding decisions, system architecture, debugging approach, and technical trade-offs',
        style: 'act like a senior engineer who cares about clean code and scalable solutions',
        resumeQuestions: [
          'I see you used {technology} in {project}. What made you choose that over alternatives?',
          'Looking at your {project} - how did you handle {technical_aspect}?',
          'You mentioned {achievement} - walk me through your technical approach.',
          'In your experience with {technology}, what\'s the biggest lesson you learned?'
        ],
        scenarioQuestions: [
          'If you had to design a system for {specific_scale}, how would you approach it?',
          'How would you debug a performance issue in {relevant_technology}?',
          'What\'s your process for code reviews when working with junior developers?',
          'If a critical production bug happened at 3 AM, walk me through your response.'
        ],
        followUps: [
          'What were the trade-offs you considered?',
          'How did you measure the impact of that decision?',
          'What would you do differently now?',
          'How did you handle edge cases?'
        ]
      },
      'Data Analyst': {
        focus: 'data interpretation, business insights, statistical reasoning, and visualization choices',
        style: 'be curious like a data detective who loves turning numbers into stories',
        resumeQuestions: [
          'I noticed you worked on {specific_analysis} - what story did the data tell?',
          'You used {tool} for {project} - why was that the right choice?',
          'Looking at your {dashboard/report} work - how did you ensure accuracy?',
          'Tell me about a time your analysis changed a business decision.'
        ],
        scenarioQuestions: [
          'If conversion rates suddenly dropped 15%, how would you investigate?',
          'How would you design an A/B test for {relevant_business_scenario}?',
          'A stakeholder questions your methodology - how do you respond?',
          'What metrics would you track for {business_context}?'
        ],
        followUps: [
          'How did you validate those findings?',
          'What assumptions did you challenge?',
          'How did you present this to non-technical stakeholders?',
          'What biases did you account for?'
        ]
      },
      'Product Manager': {
        focus: 'user needs, business impact, prioritization logic, and cross-team collaboration',
        style: 'think like a strategic partner who balances user value with business goals',
        resumeQuestions: [
          'You launched {product/feature} - how did you validate user needs first?',
          'I see you worked with {team_size} teams - how did you align everyone?',
          'Looking at your {achievement} - what metrics proved success?',
          'Tell me about a feature you decided NOT to build and why.'
        ],
        scenarioQuestions: [
          'If engineering says a feature will take 6 months but sales wants it in 2, how do you handle it?',
          'How would you prioritize between fixing technical debt vs new features?',
          'A key customer threatens to leave without feature X - what\'s your approach?',
          'How do you decide what to build when you have limited engineering resources?'
        ],
        followUps: [
          'How did you measure user impact?',
          'What stakeholder pushback did you get?',
          'How did you communicate trade-offs?',
          'What did usage data tell you?'
        ]
      },
      'Consultant': {
        focus: 'problem-solving frameworks, client communication, structured thinking, and business impact',
        style: 'approach like a trusted advisor who breaks complex problems into clear solutions',
        resumeQuestions: [
          'You worked on {client_project} - how did you structure the problem?',
          'Looking at your {industry} experience - what frameworks did you use?',
          'Tell me about a time you had to change a client\'s mind about something.',
          'I see you delivered {specific_outcome} - how did you get stakeholder buy-in?'
        ],
        scenarioQuestions: [
          'A retail client\'s sales dropped 20% - walk me through your first week.',
          'How would you help a company decide between building vs buying a solution?',
          'A client\'s CEO disagrees with your recommendation - how do you proceed?',
          'You have 3 days to present a market entry strategy - what\'s your approach?'
        ],
        followUps: [
          'How did you validate those assumptions?',
          'What frameworks guided your thinking?',
          'How did you handle conflicting data?',
          'What implementation challenges did you foresee?'
        ]
      },
      'Marketing': {
        focus: 'campaign strategy, audience insights, creative execution, and ROI measurement',
        style: 'think like a growth-focused marketer who loves both creativity and data',
        resumeQuestions: [
          'Your {campaign} achieved {result} - what was your targeting strategy?',
          'I see you used {channel/platform} - why was that the right choice for {goal}?',
          'Looking at your {brand/growth} work - how did you measure success?',
          'Tell me about a campaign that didn\'t work and what you learned.'
        ],
        scenarioQuestions: [
          'If CAC increased 40% overnight, how would you diagnose and respond?',
          'How would you launch a product in a saturated market with limited budget?',
          'A competitor just launched a similar product - what\'s your response strategy?',
          'How do you balance brand building vs performance marketing?'
        ],
        followUps: [
          'What attribution challenges did you face?',
          'How did you optimize for different funnel stages?',
          'What creative insights drove performance?',
          'How did you segment your audience?'
        ]
      },
      'Sales': {
        focus: 'deal strategy, relationship building, objection handling, and revenue impact',
        style: 'engage like a sales leader who values both relationships and results',
        resumeQuestions: [
          'You hit {achievement} - what was your approach to pipeline building?',
          'Looking at your {industry/segment} experience - what objections did you face most?',
          'Tell me about your biggest deal and how you closed it.',
          'I see you managed {territory/accounts} - how did you prioritize your time?'
        ],
        scenarioQuestions: [
          'A key prospect goes dark after 3 months of engagement - what\'s your move?',
          'How would you sell to a buyer who\'s been burned by a competitor?',
          'You\'re 40% behind quota with 2 months left - what\'s your plan?',
          'A customer wants to cancel - how do you approach the conversation?'
        ],
        followUps: [
          'How did you build trust with that stakeholder?',
          'What objections did you anticipate?',
          'How did you structure the negotiation?',
          'What was your follow-up strategy?'
        ]
      }
    };

    // Human conversation starters
    this.conversationStarters = [
      "Tell me about yourself and what drew you to this role.",
      "I'd love to hear your story - walk me through your background.",
      "Let's start with you - what's your journey been like so far?",
      "Before we dive in, help me understand your background.",
      "I'm excited to learn about you - tell me your story."
    ];

    // Transition phrases for natural flow
    this.transitions = [
      "That's interesting - ",
      "Building on that - ",
      "I'm curious about something you mentioned - ",
      "That reminds me - ",
      "Speaking of {topic} - ",
      "You brought up {concept}, which makes me wonder - ",
      "I noticed in your background - "
    ];
  }

  analyzeResume(resumeText) {
    if (!resumeText) return { experience: 'entry-level', keySkills: [], projects: [], companies: [], achievements: [] };
    
    const text = resumeText.toLowerCase();

    // Enhanced experience detection
    let experience = 'entry-level';
    const yearMatches = text.match(/\b(\d+)\+?\s*years?\b/g);
    const seniorityKeywords = text.match(/\b(senior|lead|principal|architect|director|manager|head of)\b/g);
    
    if (seniorityKeywords || (yearMatches && yearMatches.some(y => parseInt(y) >= 7))) {
      experience = 'senior-level';
    } else if (yearMatches && yearMatches.some(y => parseInt(y) >= 3) || /\b(mid|intermediate)\b/.test(text)) {
      experience = 'mid-level';
    } else if (/\b(junior|associate|analyst|coordinator)\b/.test(text)) {
      experience = 'junior/early career';
    }

    // Enhanced skill extraction with context
    const skillPatterns = {
      'JavaScript': ['javascript', 'js', 'node.js', 'nodejs'],
      'Python': ['python', 'django', 'flask', 'pandas'],
      'React': ['react', 'reactjs', 'react.js'],
      'SQL': ['sql', 'mysql', 'postgresql', 'sqlite'],
      'AWS': ['aws', 'amazon web services', 'ec2', 's3'],
      'Machine Learning': ['machine learning', 'ml', 'tensorflow', 'pytorch'],
      'Data Analysis': ['data analysis', 'analytics', 'tableau', 'power bi'],
      'Project Management': ['project management', 'agile', 'scrum', 'jira'],
      'Marketing': ['marketing', 'seo', 'sem', 'google ads', 'facebook ads'],
      'Sales': ['sales', 'crm', 'salesforce', 'hubspot', 'pipeline']
    };

    const keySkills = [];
    for (const [skill, patterns] of Object.entries(skillPatterns)) {
      if (patterns.some(pattern => text.includes(pattern))) {
        keySkills.push(skill);
      }
    }

    // Extract companies with context
    const companyIndicators = ['at ', 'worked at', 'joined', 'company', 'inc', 'llc', 'corp'];
    const companies = [];
    const sentences = resumeText.split(/[.!?\n]+/);
    
    for (let sentence of sentences) {
      const lower = sentence.toLowerCase();
      if (companyIndicators.some(indicator => lower.includes(indicator))) {
        const words = sentence.trim().split(/\s+/);
        const companyLike = words.find(word => 
          word.length > 2 && 
          /^[A-Z][a-zA-Z]+/.test(word) && 
          !['The', 'And', 'With', 'For', 'In', 'At'].includes(word)
        );
        if (companyLike && companies.length < 3) {
          companies.push(companyLike);
        }
      }
    }

    // Enhanced project extraction with impact
    const projectIndicators = [
      'built', 'developed', 'created', 'designed', 'implemented', 'engineered',
      'launched', 'delivered', 'led', 'managed', 'architected', 'optimized'
    ];
    
    const projects = [];
    for (let sentence of sentences) {
      const lower = sentence.toLowerCase();
      if (projectIndicators.some(indicator => lower.includes(indicator))) {
        const clean = sentence.trim();
        if (clean.length >= 20 && clean.length <= 200 && projects.length < 5) {
          projects.push(clean);
        }
      }
    }

    // Extract achievements with metrics
    const achievementPatterns = [
      /increased?\s+.*?by\s+(\d+%|\d+x)/gi,
      /reduced?\s+.*?by\s+(\d+%)/gi,
      /improved?\s+.*?by\s+(\d+%)/gi,
      /achieved?\s+.*?(\$\d+|\d+%|\d+x)/gi,
      /managed?\s+.*?(\$\d+|\d+ people|\d+ team)/gi
    ];

    const achievements = [];
    for (let sentence of sentences) {
      if (achievementPatterns.some(pattern => pattern.test(sentence))) {
        const clean = sentence.trim();
        if (clean.length >= 15 && clean.length <= 150 && achievements.length < 3) {
          achievements.push(clean);
        }
      }
    }

    return {
      experience,
      keySkills: keySkills.slice(0, 8),
      projects: projects.slice(0, 5),
      companies: companies.slice(0, 3),
      achievements: achievements.slice(0, 3)
    };
  }

  getInterviewPrompt(domain, resumeText, analysis) {
    const template = this.domainTemplates[domain] || { 
      focus: 'relevant skills and experience', 
      style: 'be professional but conversational' 
    };

    return `You are a skilled ${domain} interviewer conducting a real interview.

🎯 YOUR ROLE:
${template.style}. Focus on: ${template.focus}.

📋 CANDIDATE PROFILE:
Experience: ${analysis.experience}
Key Skills: ${analysis.keySkills.join(', ') || 'General skills'}
Companies: ${analysis.companies.join(', ') || 'Various companies'}
Notable Projects: ${analysis.projects.slice(0, 2).join(' | ') || 'Various projects'}
Achievements: ${analysis.achievements.join(' | ') || 'Professional accomplishments'}

🗣️ INTERVIEW APPROACH:
1. Start conversationally: "${this.conversationStarters[Math.floor(Math.random() * this.conversationStarters.length)]}"

2. Then reference SPECIFIC items from their background:
   - Pick actual projects/companies mentioned
   - Ask about specific technologies they used
   - Reference their achievements with follow-ups
   
3. Use natural transitions:
   - "That's interesting, you mentioned [specific thing]..."
   - "I'm curious about [specific project/skill]..."
   - "Building on what you said about [specific detail]..."

🎯 QUESTION EXAMPLES FOR THIS CANDIDATE:
Based on their background, you might ask:
${this._generateSampleQuestions(analysis, template, domain)}

💬 CONVERSATION RULES:
- Sound like a human interviewer having a real conversation
- Always reference something specific from their actual background
- Ask follow-up questions that build on their previous answers
- Use "I see you..." "Looking at your..." "You mentioned..."
- NO generic questions unless tied to their specific experience
- React naturally to what they tell you

🎭 REMEMBER:
You're not reading from a script - you're having a genuine professional conversation with someone whose background you've studied. Be curious, be specific, be human.

Ready to begin the interview.`;
  }

  _generateSampleQuestions(analysis, template, domain) {
    const questions = [];
    
    // Project-based questions
    if (analysis.projects.length > 0) {
      const project = analysis.projects[0];
      questions.push(`- "I see you ${project.toLowerCase().substring(0, 50)}... - what was your biggest technical challenge there?"`);
    }
    
    // Skill-based questions
    if (analysis.keySkills.length > 0) {
      const skill = analysis.keySkills[0];
      questions.push(`- "You have experience with ${skill} - tell me about a specific project where you really leveraged that."`);
    }
    
    // Company-based questions
    if (analysis.companies.length > 0) {
      const company = analysis.companies[0];
      questions.push(`- "During your time at ${company}, what was the most interesting problem you solved?"`);
    }
    
    // Achievement-based questions
    if (analysis.achievements.length > 0) {
      const achievement = analysis.achievements[0];
      questions.push(`- "You mentioned ${achievement.substring(0, 40)}... - walk me through your approach."`);
    }

    // Add domain-specific examples
    if (template.resumeQuestions) {
      const domainQ = template.resumeQuestions[0];
      questions.push(`- Domain-specific: "${domainQ.replace('{technology}', analysis.keySkills[0] || 'your main technology').replace('{project}', 'your key project')}"`);
    }

    return questions.slice(0, 4).join('\n');
  }

  buildEvaluationPrompt(conversationHistory, domain) {
    return `You are evaluating a candidate's interview performance for a ${domain} position.
Provide detailed, constructive feedback based on the actual conversation.

INTERVIEW TRANSCRIPT:
${conversationHistory.map(msg => `${msg.speaker}: ${msg.content}`).join('\n\n')}

Provide your evaluation in this exact format:

🔹 **Overall Score: X/10**

🔹 **Strengths:**
- [List 3-4 specific strengths you observed, with examples from their answers]
- [Focus on: technical knowledge, communication clarity, problem-solving approach, relevant experience]

🔹 **Areas for Improvement:**
- [List 2-3 specific areas where they could improve, with constructive suggestions]
- [Be specific about what they could have done better in their actual responses]

🔹 **Answer Analysis:**
- [Review 2-3 specific answers they gave, commenting on depth, accuracy, and clarity]
- [Mention which questions they handled well and which could have been stronger]

🔹 **Technical/Domain Assessment:**
- [Evaluate their domain-specific knowledge and practical experience]
- [Comment on how well they demonstrated ${domain} competencies]

🔹 **Final Recommendation:**
**[Choose one: Strong Hire / Hire / Borderline - Hire / Borderline - No Hire / No Hire]**

🔹 **Message to Candidate:**
[Write a personalized, encouraging message directly to the candidate. Thank them for their time, highlight something positive from the interview, and provide next steps or general advice for their career growth. Keep it warm and professional.]

Focus on providing actionable feedback based on their actual responses and demonstrated competencies.`;
  }

  getAvailableDomains() {
    return Object.keys(this.domainTemplates);
  }

  isValidDomain(domain) {
    return this.domainTemplates.hasOwnProperty(domain);
  }

  // Helper method to get domain-specific follow-up questions
  getDomainFollowUps(domain) {
    return this.domainTemplates[domain]?.followUps || [
      'Can you elaborate on that approach?',
      'What challenges did you face there?',
      'How did you measure success?',
      'What would you do differently?'
    ];
  }

  // Helper method to get conversation transitions
  getTransitionPhrase(topic = '') {
    const transitions = this.transitions.slice();
    if (topic) {
      transitions.push(`Speaking of ${topic} - `, `You brought up ${topic}, which makes me wonder - `);
    }
    return transitions[Math.floor(Math.random() * transitions.length)];
  }

  // Generate contextual questions based on previous answers
  generateContextualQuestion(domain, previousAnswer, resumeInsights) {
    const template = this.domainTemplates[domain];
    if (!template) return null;

    const lowerAnswer = previousAnswer.toLowerCase();
    
    // Analyze what they mentioned to ask relevant follow-ups
    if (lowerAnswer.includes('challenge') || lowerAnswer.includes('difficult')) {
      return `${this.getTransitionPhrase()}you mentioned some challenges - how did you work through those obstacles?`;
    }
    
    if (lowerAnswer.includes('team') || lowerAnswer.includes('collaborate')) {
      return `${this.getTransitionPhrase()}teamwork - what's your approach to handling different perspectives in a team?`;
    }
    
    if (lowerAnswer.includes('project')) {
      const projects = resumeInsights.projects || [];
      if (projects.length > 0) {
        const project = projects[Math.floor(Math.random() * projects.length)];
        return `That's interesting. Looking at another project you worked on - ${project.substring(0, 60)}... - how did that compare in terms of complexity?`;
      }
    }

    // Default to domain-specific scenarios
    const scenarios = template.scenarioQuestions || [];
    if (scenarios.length > 0) {
      return scenarios[Math.floor(Math.random() * scenarios.length)];
    }

    return null;
  }
}

export default PromptBuilder;