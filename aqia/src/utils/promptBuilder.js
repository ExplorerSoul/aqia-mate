class PromptBuilder {
  constructor() {
    this.domainTemplates = {
      'Software Engineer': {
        focus: 'coding skills, system design, algorithms, data structures, software architecture',
        skillQuestions: [
          'programming languages and frameworks',
          'database design and optimization',
          'system scalability and performance'
        ],
        deepDive: [
          'algorithm complexity and optimization',
          'system design for large-scale applications',
          'code review and best practices',
          'debugging and troubleshooting techniques'
        ]
      },
      'Data Analyst': {
        focus: 'SQL, data visualization, statistical analysis, business intelligence',
        skillQuestions: [
          'data analysis tools and techniques',
          'statistical methods and interpretation',
          'data visualization and reporting'
        ],
        deepDive: [
          'complex SQL queries and database optimization',
          'A/B testing and experimental design',
          'data pipeline and ETL processes',
          'business metrics and KPI analysis'
        ]
      },
      'Product Manager': {
        focus: 'product strategy, user research, roadmap planning, stakeholder management',
        skillQuestions: [
          'product development lifecycle',
          'user research and customer feedback',
          'market analysis and competitive intelligence'
        ],
        deepDive: [
          'product roadmap prioritization frameworks',
          'feature specification and requirement gathering',
          'cross-functional team collaboration',
          'product metrics and success measurement'
        ]
      },
      'Consultant': {
        focus: 'case studies, problem-solving frameworks, client management, analytical thinking',
        skillQuestions: [
          'analytical and problem-solving approaches',
          'client communication and presentation skills',
          'industry knowledge and market trends'
        ],
        deepDive: [
          'structured problem-solving methodologies',
          'stakeholder management and influence',
          'change management and implementation',
          'business case development and ROI analysis'
        ]
      },
      'Marketing': {
        focus: 'campaign strategy, digital marketing, analytics, brand management',
        skillQuestions: [
          'marketing channels and campaign management',
          'brand positioning and messaging',
          'marketing analytics and performance measurement'
        ],
        deepDive: [
          'customer segmentation and targeting strategies',
          'multi-channel campaign optimization',
          'marketing automation and lead nurturing',
          'ROI measurement and attribution modeling'
        ]
      },
      'Sales': {
        focus: 'sales methodology, client relationship building, negotiation, target achievement',
        skillQuestions: [
          'sales process and pipeline management',
          'customer relationship building',
          'negotiation and closing techniques'
        ],
        deepDive: [
          'complex deal structuring and negotiation',
          'account management and expansion strategies',
          'sales forecasting and territory planning',
          'competitive positioning and objection handling'
        ]
      }
    };
  }

  analyzeResume(resumeText) {
    const text = resumeText.toLowerCase();

    let experience = 'entry-level';
    if (/senior|lead|principal/.test(text)) {
      experience = 'senior-level';
    } else if (/mid|[2-9]\s*(\+)?\s*years?/.test(text)) {
      experience = 'mid-level';
    }

    const skillKeywords = [
      'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
      'machine learning', 'data analysis', 'tableau', 'excel', 'powerbi',
      'product management', 'agile', 'scrum', 'jira', 'analytics',
      'marketing', 'seo', 'sem', 'social media', 'campaign',
      'sales', 'crm', 'salesforce', 'pipeline', 'negotiation'
    ];

    const keySkills = skillKeywords.filter(skill =>
      text.includes(skill.toLowerCase())
    );

    const projectKeywords = ['project', 'built', 'developed', 'created', 'implemented', 'designed'];
    const projects = [];

    const sentences = resumeText.split(/[.!?\n]+/);
    for (let sentence of sentences) {
      if (projectKeywords.some(k => sentence.toLowerCase().includes(k))) {
        const clean = sentence.trim();
        if (clean.length >= 30 && clean.length <= 250) {
          projects.push(clean);
        }
      }
    }

    return {
      experience,
      keySkills: keySkills.slice(0, 5),
      projects: projects.slice(0, 3)
    };
  }

  buildEvaluationPrompt(conversationHistory, domain) {
    return `You are evaluating a ${domain} interview. Based on the following conversation, provide a detailed assessment.

INTERVIEW CONVERSATION:
${conversationHistory.map(msg => `${msg.speaker}: ${msg.content}`).join('\n')}

EVALUATION FORMAT:
Score: X/10

Strengths:
- (List 3–4)

Areas for Improvement:
- (List 2–3)

Final Recommendation: Strong Hire / Hire / No Hire

Closing Message: Thank the candidate politely and suggest next steps.`;
  }

  getAvailableDomains() {
    return Object.keys(this.domainTemplates);
  }

  isValidDomain(domain) {
    return this.domainTemplates.hasOwnProperty(domain);
  }
}

export default PromptBuilder;
