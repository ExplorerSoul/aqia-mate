class PromptBuilder {
  constructor() {
    this.askedQuestions = new Set();

    this.domainTemplates = {
      'Software Engineer': {
        focus: 'system design, code quality, debugging, technical decisions, scalability, and architecture',
        style: 'act like a senior tech lead who values clean code, smart solutions, and practical engineering',
        scenarioQuestions: [
          'How would you design a system to handle 1 million concurrent users?',
          'A service is responding slowly in production. Walk me through your debugging process.',
          'You need to migrate a legacy monolith to microservices. What\'s your approach?',
          'How do you ensure code quality when working with a team of developers at different skill levels?'
        ]
      },
      'Data Analyst': {
        focus: 'data interpretation, statistical thinking, business insights, visualization, and analytical frameworks',
        style: 'be like a curious data detective who loves uncovering stories in numbers and driving business impact',
        scenarioQuestions: [
          'Sales dropped 25% last month. How would you investigate the root cause?',
          'Design an A/B test to improve website conversion rates. What would you measure?',
          'A stakeholder questions your statistical significance. How do you explain it?',
          'You find conflicting data from two different sources. How do you resolve this?'
        ]
      },
      'Product Manager': {
        focus: 'user empathy, strategic thinking, prioritization, cross-functional leadership, and business impact',
        style: 'think like a strategic product leader who balances user needs with business goals and technical constraints',
        scenarioQuestions: [
          'Engineering says a feature will take 6 months, but sales needs it in 2. How do you handle this?',
          'Your top competitor just launched a feature your users are requesting. What\'s your response?',
          'User retention dropped 15% after your last release. How do you investigate and respond?',
          'You have limited engineering resources. How do you prioritize between new features and technical debt?'
        ]
      },
      'Consultant': {
        focus: 'structured problem-solving, client communication, analytical frameworks, and business impact',
        style: 'approach like a strategic advisor who breaks complex problems into clear, actionable solutions',
        scenarioQuestions: [
          'A retail client\'s profits dropped 30% - you have 2 weeks to present initial findings. What\'s your approach?',
          'The client\'s CEO disagrees with your data-driven recommendation. How do you handle this?',
          'You need to help a company decide: build in-house vs. buy vs. partner. What\'s your framework?',
          'A project is behind schedule and the client is getting nervous. How do you manage the situation?'
        ]
      },
      'Marketing': {
        focus: 'customer insights, campaign strategy, growth metrics, creative execution, and ROI optimization',
        style: 'think like a growth-focused marketer who combines creative storytelling with data-driven optimization',
        scenarioQuestions: [
          'Customer acquisition costs increased 50% overnight. How do you diagnose and respond?',
          'Launch a new product in a saturated market with a limited budget. What\'s your strategy?',
          'A competitor is aggressively targeting your customers. How do you respond?',
          'How do you balance brand building with performance marketing when budgets are tight?'
        ]
      },
      'Sales': {
        focus: 'relationship building, deal strategy, objection handling, pipeline management, and revenue growth',
        style: 'engage like a consultative sales leader who builds trust through deep customer understanding',
        scenarioQuestions: [
          'A qualified prospect goes silent after 3 months of engagement. What\'s your approach?',
          'You\'re selling to a buyer who was burned by a competitor. How do you build trust?',
          'You\'re 40% behind quota with 2 months left in the year. What\'s your plan?',
          'A long-term customer wants to cancel their contract. How do you handle the conversation?'
        ]
      }
    };

    this.conversationStarters = [
      "I'm excited to learn about your background. Tell me your story and what drew you to this role.",
      "Let's start with you - I'd love to hear about your journey and what interests you about this opportunity.",
      "Before we dive into the technical details, help me understand your background and motivation.",
      "I've reviewed your resume and I'm curious - walk me through your career journey so far.",
      "Tell me about yourself and what excites you most about the work you do."
    ];
  }

  analyzeResume(resumeText) {
    if (!resumeText || resumeText.trim().length < 50) {
      return {
        experience: 'entry-level',
        keySkills: [],
        projects: [],
        companies: [],
        achievements: [],
        technologies: [],
        industries: []
      };
    }

    const text = resumeText.toLowerCase();
    const originalText = resumeText;

    // Experience
    let experience = 'entry-level';
    const yearMatches = text.match(/(\d+)[\+\-\s]*years?/g) || [];
    const experienceYears = yearMatches.map(match => parseInt(match.match(/\d+/)[0]));
    const maxYears = Math.max(...experienceYears, 0);

    const seniorityIndicators = {
      'senior': /\b(senior|sr\.?|lead|principal|architect|staff|director|manager|head\s+of|vp|vice\s+president)\b/gi,
      'mid': /\b(mid|intermediate|associate|specialist|analyst|coordinator)\b/gi,
      'junior': /\b(junior|jr\.?|entry|intern|trainee|assistant)\b/gi
    };

    if (seniorityIndicators.senior.test(text) || maxYears >= 7) experience = 'senior-level';
    else if (seniorityIndicators.mid.test(text) || maxYears >= 3) experience = 'mid-level';
    else if (seniorityIndicators.junior.test(text) || maxYears >= 1) experience = 'junior-level';

    // Skills
    const skillCategories = {
      'Programming': ['javascript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'typescript', 'php', 'ruby'],
      'Frontend': ['react', 'vue', 'angular', 'html', 'css', 'sass', 'webpack', 'next.js', 'nuxt'],
      'Backend': ['node.js', 'express', 'django', 'flask', 'spring', 'asp.net', 'rails', 'laravel'],
      'Database': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sqlite'],
      'Cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'serverless'],
      'Data': ['pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn', 'tableau', 'power bi', 'r'],
      'Mobile': ['react native', 'flutter', 'ios', 'android', 'swift', 'kotlin'],
      'Tools': ['git', 'jenkins', 'jira', 'confluence', 'slack', 'figma', 'sketch']
    };

    const keySkills = [];
    const technologies = [];
    
    for (const [category, skills] of Object.entries(skillCategories)) {
      for (const skill of skills) {
        if (text.includes(skill.toLowerCase())) {
          keySkills.push(skill);
          technologies.push({ name: skill, category });
        }
      }
    }

    // Companies
    const companyPatterns = [
      /(?:at|with|for|worked at|joined|company|employed by)\s+([A-Z][a-zA-Z\s&.,]+(?:Inc|LLC|Corp|Ltd|Co|Company|Technologies|Solutions|Systems|Group|Labs)?)/gi,
      /([A-Z][a-zA-Z\s&.]+(?:Inc|LLC|Corp|Ltd|Co|Company|Technologies|Solutions|Systems|Group|Labs))/gi
    ];
    const companies = new Set();
    for (const pattern of companyPatterns) {
      const matches = originalText.match(pattern) || [];
      matches.forEach(match => {
        const cleaned = match.replace(/^(at|with|for|worked at|joined|company|employed by)\s+/i, '').trim();
        if (cleaned.length > 2 && cleaned.length < 50 && companies.size < 5) companies.add(cleaned);
      });
    }

    // Projects
    const projectIndicators = [
      /(?:built|developed|created|designed|implemented|engineered|launched|delivered|led|managed|architected|optimized)\s+([^.!?]+)/gi,
      /(?:project|system|application|platform|tool|website|app|solution|service|feature)\s*:?\s*([^.!?]+)/gi
    ];
    const projects = new Set();
    for (const pattern of projectIndicators) {
      const matches = originalText.match(pattern) || [];
      matches.forEach(match => {
        const cleaned = match.trim();
        if (cleaned.length >= 30 && cleaned.length <= 200 && projects.size < 6) projects.add(cleaned);
      });
    }

    // Achievements
    const achievementPatterns = [
      /(?:increased|improved|boosted|grew|enhanced|optimized|reduced|decreased|minimized|saved|generated|delivered)\s+[^.!?]*?(?:\d+%|\d+x|\$\d+(?:k|m)?|\d+\s*(?:million|thousand|users|customers|leads))/gi,
      /(?:achieved|reached|exceeded|surpassed|delivered|completed|managed|handled|processed)\s+[^.!?]*?(?:\d+%|\d+x|\$\d+(?:k|m)?|\d+\s*(?:million|thousand|users|customers|projects))/gi
    ];
    const achievements = new Set();
    for (const pattern of achievementPatterns) {
      const matches = originalText.match(pattern) || [];
      matches.forEach(match => {
        const cleaned = match.trim();
        if (cleaned.length >= 20 && cleaned.length <= 150 && achievements.size < 4) achievements.add(cleaned);
      });
    }

    // Industries
    const industryKeywords = {
      'fintech': ['fintech', 'finance', 'banking', 'payments', 'trading', 'investment'],
      'healthcare': ['healthcare', 'medical', 'hospital', 'pharma', 'biotech', 'health'],
      'e-commerce': ['e-commerce', 'ecommerce', 'retail', 'shopping', 'marketplace', 'store'],
      'saas': ['saas', 'software', 'enterprise', 'b2b', 'platform', 'subscription'],
      'gaming': ['gaming', 'games', 'mobile games', 'console', 'unity', 'unreal'],
      'education': ['education', 'edtech', 'learning', 'university', 'school', 'training']
    };
    const industries = [];
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) industries.push(industry);
    }

    return {
      experience,
      keySkills: Array.from(new Set(keySkills)).slice(0, 8),
      projects: Array.from(projects).slice(0, 6),
      companies: Array.from(companies).slice(0, 4),
      achievements: Array.from(achievements).slice(0, 4),
      technologies: technologies.slice(0, 10),
      industries: industries.slice(0, 3),
      textLength: resumeText.length,
      analysisQuality: resumeText.length > 200 ? 'detailed' : resumeText.length > 100 ? 'basic' : 'minimal'
    };
  }

  getAvailableDomains() {
    return [
      "Software Engineering",
      "Data Science",
      "Product Management",
      "UI/UX Design",
      "Cybersecurity",
      "Cloud Computing",
      "DevOps",
      "Machine Learning",
      "AI Research"
    ];
  }

  isValidDomain(domain) {
    return this.getAvailableDomains().includes(domain);
  }

  getInterviewPrompt(domain, resumeText, analysis) {
    const template = this.domainTemplates[domain] || {
      focus: 'relevant skills and professional experience',
      style: 'be professional yet conversational, showing genuine interest in their background'
    };

    const experienceContext = this._getExperienceContext(analysis.experience);

    return `You are conducting a ${domain} interview. ${template.style}.

🎯 CANDIDATE PROFILE:
Experience Level: ${analysis.experience} (${experienceContext})
Key Technologies: ${analysis.keySkills.join(', ') || 'Various technologies'}
Companies: ${analysis.companies.join(', ') || 'Previous work experience'}
Industries: ${analysis.industries.join(', ') || 'Cross-industry experience'}

📋 SPECIFIC PROJECTS TO REFERENCE:
${analysis.projects.map((p, i) => `${i + 1}. ${p}`).join('\n') || 'Various projects mentioned in background'}

🏆 ACHIEVEMENTS TO EXPLORE:
${analysis.achievements.map((a, i) => `${i + 1}. ${a}`).join('\n') || 'Professional accomplishments'}

🎪 INTERVIEW STRATEGY:
Focus Areas: ${template.focus}

Your conversation should feel natural and engaging. 
- Acknowledge the candidate’s answers briefly before moving on.
- Ask ONE focused question at a time.
- Avoid repeating the same project/skill.
- Use resume context wherever possible.
- Adapt to students (minimal resume) with project/coursework/motivation questions.
- Sound genuinely curious, not robotic.

PHASE STRUCTURE:
1. OPENING → "${this.conversationStarters[Math.floor(Math.random() * this.conversationStarters.length)]}"
2. RESUME DEEP DIVE → Ask about projects, technologies, companies, or achievements
3. DOMAIN EXPERTISE → Role-specific scenarios
4. BEHAVIORAL → Leadership, teamwork, problem-solving
5. CLOSING → Candidate’s questions, career goals

IMPORTANT: You have a strict limit of 8 questions. Manage the conversation to cover all phases within this limit.

 conversational-style responses:
- Start your response with a natural acknowledgement of the candidate's answer (e.g., "That's a solid approach," "Okay, I see," "Good example," "Nice," "Context is helpful").
- VARY these acknowledgements. Do not use the same one every time.
- If the answer is brief or lacks detail, use neutral acknowledgements (e.g., "Okay," "Understood").
- If the answer is detailed and structured, use positive acknowledgements (e.g., "That's a great comprehensive answer," "Excellent explanation").
- Sound genuinely curious, not robotic.
- Keep your responses concise (ideally under 3-4 sentences total) to avoid overwhelming the audio output.
`;
  }

  _getExperienceContext(level) {
    const contexts = {
      'entry-level': 'Focus on learning, projects, and motivation. Avoid expecting deep work experience.',
      'junior-level': 'Ask about hands-on experience, learning curve, and teamwork.',
      'mid-level': 'Explore ownership, problem-solving, and mentoring experiences.',
      'senior-level': 'Ask about architecture, leadership, and strategic decisions.'
    };
    return contexts[level] || contexts['mid-level'];
  }

  // Restored methods
  generateContextualQuestion(domain, previousAnswer, resumeInsights, currentPhase) {
    const template = this.domainTemplates[domain];
    if (!template) return null;

    const hooks = this._extractResponseHooks(previousAnswer);

    switch (currentPhase) {
      case 'resume_deep_dive':
        return this._generateResumeQuestion(hooks, resumeInsights);
      case 'domain_specific':
        return this._generateDomainQuestion(template);
      case 'behavioral':
        return this._generateBehavioralQuestion(resumeInsights.experience);
      default:
        return this._generateFollowUpQuestion(hooks, template);
    }
  }

  _extractResponseHooks(answer) {
    const hooks = { technologies: [], challenges: [], teams: [], achievements: [] };
    const tech_patterns = /\b(react|python|javascript|aws|docker|sql|node|angular|vue)\b/gi;
    hooks.technologies = [...new Set((answer.match(tech_patterns) || []).map(t => t.toLowerCase()))];

    if (/challenge|difficult|problem|issue|obstacle/i.test(answer)) hooks.challenges.push('challenge');
    if (/team|collaborate|work with|group|colleagues/i.test(answer)) hooks.teams.push('teamwork');
    if (/achieved|accomplished|improved|increased|delivered/i.test(answer)) hooks.achievements.push('achievement');
    return hooks;
  }

  _generateResumeQuestion(hooks, insights) {
    for (const project of insights.projects || []) {
      if (!this.askedQuestions.has(project)) {
        this.askedQuestions.add(project);
        return `I'd love to hear about your project: "${project.substring(0, 80)}...". What was your role and biggest contribution?`;
      }
    }

    for (const skill of insights.keySkills || []) {
      if (!this.askedQuestions.has(skill)) {
        this.askedQuestions.add(skill);
        return `I noticed you’ve used ${skill}. Can you share a specific time you applied it to solve a problem?`;
      }
    }

    if (insights.analysisQuality === 'minimal') {
      return "Tell me about a project or subject from your coursework that you found most exciting.";
    }

    return null;
  }

  _generateDomainQuestion(template) {
    const scenarios = template.scenarioQuestions || [];
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  }

  _generateBehavioralQuestion(experienceLevel) {
    const behavioralQs = {
      'senior-level': [
        "Tell me about a time you had to make a difficult decision that affected the team.",
        "How do you handle situations where your team disagrees with your technical approach?"
      ],
      'mid-level': [
        "Tell me about a time you had to learn a new skill quickly for a project.",
        "How do you handle competing priorities when everything seems urgent?"
      ],
      'junior-level': [
        "Tell me about a mistake you made and how you handled it.",
        "How do you approach learning new technologies outside of class?"
      ],
      'entry-level': [
        "What motivated you to choose this field of study?",
        "Tell me about a class project or hackathon you really enjoyed."
      ]
    };
    const pool = behavioralQs[experienceLevel] || behavioralQs['mid-level'];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  _generateFollowUpQuestion(hooks, template) {
    if (hooks.challenges.length) return "What was the toughest part of that challenge, and how did you overcome it?";
    if (hooks.teams.length) return "How did collaboration with your team influence the outcome?";
    if (hooks.achievements.length) return "What specific impact did that achievement have?";
    const followUps = template.followUps || this.getDomainFollowUps('default');
    return followUps[Math.floor(Math.random() * followUps.length)];
  }

  getDomainFollowUps() {
    return [
      "Can you walk me through your thought process there?",
      "What challenges did you encounter with that approach?",
      "How did you measure success in that case?",
      "What would you do differently if you faced that again?",
      "How did that experience shape your current approach?"
    ];
  }
}

export default PromptBuilder;
