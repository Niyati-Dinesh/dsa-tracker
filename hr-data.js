const HR_DATA = {
  "meta": {
    "title": "HR / Behavioral Interview Tracker",
    "description": "General frequently-asked HR questions with a field to store your own answer, plus a separate STAR-format bank (Situation/Task/Action/Result) tagged by company/competency where applicable.",
    "how_to_use": "Fill 'your_answer' in general_questions as free text. Fill each of situation/task/action/result in star_questions.star_answer to build a structured story bank you can reuse across interviews."
  },
  "general_questions": [
    {
      "id": "HR-1",
      "question": "Tell me about yourself.",
      "category": "Opening",
      "your_answer": ""
    },
    {
      "id": "HR-2",
      "question": "Why do you want to work here?",
      "category": "Motivation",
      "your_answer": ""
    },
    {
      "id": "HR-3",
      "question": "Why should we hire you?",
      "category": "Self-pitch",
      "your_answer": ""
    },
    {
      "id": "HR-4",
      "question": "What are your strengths?",
      "category": "Self-assessment",
      "your_answer": ""
    },
    {
      "id": "HR-5",
      "question": "What are your weaknesses?",
      "category": "Self-assessment",
      "your_answer": ""
    },
    {
      "id": "HR-6",
      "question": "Where do you see yourself in 5 years?",
      "category": "Career goals",
      "your_answer": ""
    },
    {
      "id": "HR-7",
      "question": "Why are you leaving your current job?",
      "category": "Career transition",
      "your_answer": ""
    },
    {
      "id": "HR-8",
      "question": "Why do you have a gap in your resume?",
      "category": "Career transition",
      "your_answer": ""
    },
    {
      "id": "HR-9",
      "question": "What do you know about our company?",
      "category": "Company research",
      "your_answer": ""
    },
    {
      "id": "HR-10",
      "question": "What is your expected salary?",
      "category": "Compensation",
      "your_answer": ""
    },
    {
      "id": "HR-11",
      "question": "Are you willing to relocate?",
      "category": "Logistics",
      "your_answer": ""
    },
    {
      "id": "HR-12",
      "question": "Do you have any questions for us?",
      "category": "Closing",
      "your_answer": ""
    },
    {
      "id": "HR-13",
      "question": "How do you handle stress and pressure?",
      "category": "Work style",
      "your_answer": ""
    },
    {
      "id": "HR-14",
      "question": "What motivates you?",
      "category": "Motivation",
      "your_answer": ""
    },
    {
      "id": "HR-15",
      "question": "How do you prioritize your work?",
      "category": "Work style",
      "your_answer": ""
    },
    {
      "id": "HR-16",
      "question": "What is your leadership style?",
      "category": "Leadership",
      "your_answer": ""
    },
    {
      "id": "HR-17",
      "question": "Are you a team player or do you prefer working alone?",
      "category": "Work style",
      "your_answer": ""
    },
    {
      "id": "HR-18",
      "question": "What is your biggest achievement?",
      "category": "Self-assessment",
      "your_answer": ""
    },
    {
      "id": "HR-19",
      "question": "How do you handle failure?",
      "category": "Resilience",
      "your_answer": ""
    },
    {
      "id": "HR-20",
      "question": "What is your ideal work environment?",
      "category": "Culture fit",
      "your_answer": ""
    },
    {
      "id": "HR-21",
      "question": "How do you keep yourself updated with industry trends?",
      "category": "Learning",
      "your_answer": ""
    },
    {
      "id": "HR-22",
      "question": "What would your previous manager/colleagues say about you?",
      "category": "Self-assessment",
      "your_answer": ""
    },
    {
      "id": "HR-23",
      "question": "How do you handle criticism?",
      "category": "Resilience",
      "your_answer": ""
    },
    {
      "id": "HR-24",
      "question": "Describe your dream job.",
      "category": "Career goals",
      "your_answer": ""
    },
    {
      "id": "HR-25",
      "question": "Why should we not hire you? / What could stop us from hiring you?",
      "category": "Self-assessment",
      "your_answer": ""
    },
    {
      "id": "HR-26",
      "question": "What is your availability / notice period?",
      "category": "Logistics",
      "your_answer": ""
    },
    {
      "id": "HR-27",
      "question": "Have you applied to any other companies?",
      "category": "Logistics",
      "your_answer": ""
    },
    {
      "id": "HR-28",
      "question": "What's a time you disagreed with company policy?",
      "category": "Values",
      "your_answer": ""
    },
    {
      "id": "HR-29",
      "question": "How do you define success?",
      "category": "Values",
      "your_answer": ""
    },
    {
      "id": "HR-30",
      "question": "Do you prefer working independently or in a team?",
      "category": "Work style",
      "your_answer": ""
    }
  ],
  "star_questions": [
    {
      "id": "STAR-1",
      "question": "Tell me about a time you disagreed with a team member. How did you handle it?",
      "company": "General",
      "tags": [
        "conflict resolution",
        "teamwork"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-2",
      "question": "Tell me about a time you had to meet a tight deadline.",
      "company": "General",
      "tags": [
        "time management",
        "pressure"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-3",
      "question": "Describe a situation where you failed at something. What did you learn?",
      "company": "General",
      "tags": [
        "failure",
        "learning"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-4",
      "question": "Tell me about a time you went above and beyond for a customer or stakeholder.",
      "company": "Amazon",
      "tags": [
        "Customer Obsession"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-5",
      "question": "Tell me about a time you had to make a decision with incomplete information.",
      "company": "Amazon",
      "tags": [
        "Bias for Action",
        "Are Right, A Lot"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-6",
      "question": "Describe a time you took ownership of a problem that wasn't directly your responsibility.",
      "company": "Amazon",
      "tags": [
        "Ownership"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-7",
      "question": "Tell me about a time you simplified a complex process.",
      "company": "Amazon",
      "tags": [
        "Invent and Simplify"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-8",
      "question": "Tell me about a time you had to dive deep into data to solve a problem.",
      "company": "Amazon",
      "tags": [
        "Dive Deep"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-9",
      "question": "Describe a time you challenged the status quo or pushed back on a decision (even if it was unpopular).",
      "company": "Amazon",
      "tags": [
        "Have Backbone; Disagree and Commit"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-10",
      "question": "Tell me about a time you had to influence a team or stakeholders without formal authority.",
      "company": "Google",
      "tags": [
        "influence",
        "googleyness"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-11",
      "question": "Describe a time you worked with ambiguous requirements. How did you handle it?",
      "company": "Google",
      "tags": [
        "ambiguity",
        "general cognitive ability"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-12",
      "question": "Tell me about a time you had a conflict with your manager. How did you resolve it?",
      "company": "Microsoft",
      "tags": [
        "growth mindset",
        "conflict"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-13",
      "question": "Give an example of when you had to learn something completely new quickly to complete a task.",
      "company": "Microsoft",
      "tags": [
        "growth mindset",
        "learning agility"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-14",
      "question": "Tell me about a time you had to say no to a stakeholder or push back on scope.",
      "company": "Meta",
      "tags": [
        "move fast",
        "prioritization"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-15",
      "question": "Describe a time you received difficult feedback. How did you respond?",
      "company": "General",
      "tags": [
        "feedback",
        "self-awareness"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-16",
      "question": "Tell me about a time you led a project from start to finish.",
      "company": "General",
      "tags": [
        "leadership",
        "project management"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-17",
      "question": "Describe a time you had to work with a difficult team member.",
      "company": "General",
      "tags": [
        "teamwork",
        "conflict"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-18",
      "question": "Tell me about a time you identified a problem before anyone else noticed it.",
      "company": "Amazon",
      "tags": [
        "Insist on the Highest Standards"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-19",
      "question": "Tell me about a time you had to balance multiple competing priorities.",
      "company": "General",
      "tags": [
        "prioritization",
        "time management"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    },
    {
      "id": "STAR-20",
      "question": "Describe a time you mentored or helped a colleague grow.",
      "company": "General",
      "tags": [
        "mentorship",
        "teamwork"
      ],
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      }
    }
  ],
  "star_stories": [
    {
      "id": "STORY-1",
      "title": "Migrating Monolithic Auth to Distributed JWT Service with Zero Downtime",
      "situation": "During peak traffic spikes, user login response times degraded to >2.5s due to bottlenecked relational session table locks.",
      "task": "I was tasked with decoupling the authentication mechanism into a stateless micro-service with sub-50ms latency SLAs.",
      "action": "Designed an asynchronous dual-write migration strategy with Redis caching, implemented asymmetric RS256 JWT key rotation, and orchestrated shadow traffic validation.",
      "result": "Achieved 18ms p99 login latency (92% reduction), eliminated database session locks, and handled 50,000 req/sec during Cyber Week with 100% uptime.",
      "competencies": [
        "Architecture",
        "Ownership",
        "Dive Deep",
        "Bias for Action"
      ],
      "companies": [
        "Amazon",
        "Google",
        "Microsoft"
      ],
      "tags": [
        "distributed-systems",
        "microservices",
        "caching",
        "jwt",
        "zero-downtime"
      ],
      "confidence": "High",
      "lastPracticed": 1787225495353,
      "notes": "Great story to demonstrate both deep technical understanding (dual-write, asymmetric encryption) and business impact (zero downtime, SLA compliance)."
    },
    {
      "id": "STORY-2",
      "title": "Resolving Architecture Disagreement on Database Choice for High-Throughput Ingestion",
      "situation": "Two senior engineers were split between PostgreSQL with table partitioning and Apache Cassandra for a new real-time analytics ingestion pipeline.",
      "task": "As the project technical lead, I needed to resolve the deadlock within 48 hours to avoid blocking 4 downstream sprint deliverables.",
      "action": "Built reproducible micro-benchmarks simulating our 500k writes/sec workload, documented trade-off matrices for operational maintenance vs query flexibility, and facilitated a blameless decision review meeting.",
      "result": "Aligned team unanimously on Cassandra for raw write ingestion with a Postgres read replica; delivered pipeline 3 days ahead of sprint schedule.",
      "competencies": [
        "Conflict Resolution",
        "Have Backbone; Disagree and Commit",
        "Invent and Simplify"
      ],
      "companies": [
        "Amazon",
        "Meta",
        "General"
      ],
      "tags": [
        "conflict-resolution",
        "benchmarking",
        "databases",
        "leadership"
      ],
      "confidence": "High",
      "lastPracticed": 1786966295354,
      "notes": "Emphasize data-driven consensus building rather than emotional debate; highlight how micro-benchmarks depersonalized the technical disagreement."
    }
  ]
};
