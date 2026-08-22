/* ================================================================
   JOB APPLICATION TRACKER - SEED DATA & DEFAULT CUSTOM FIELDS
   ================================================================ */

const DEFAULT_APPLICATION_CUSTOM_FIELDS = [
  {
    id: "cf_target_comp",
    name: "Target Compensation",
    type: "text",
    options: "",
    order: 0
  },
  {
    id: "cf_tech_stack",
    name: "Tech Stack",
    type: "text",
    options: "",
    order: 1
  },
  {
    id: "cf_source",
    name: "Job Board / Source",
    type: "select",
    options: "LinkedIn, Referral, Company Careers, Wellfound, Recruiter InMail, Otta",
    order: 2
  }
];

const INITIAL_APPLICATIONS_DATA = [
  {
    id: "app-101",
    company: "Stripe",
    role: "Backend Engineer - Payments Infrastructure",
    jobUrl: "https://stripe.com/jobs/infrastructure-swe",
    location: "Seattle, WA / Remote",
    workMode: "Remote",
    dateFound: "2026-08-05",
    dateApplied: "2026-08-08",
    status: "Interview",
    currentStage: "System Design & Coding Loop",
    recruiter: "Sarah Jenkins",
    recruiterEmail: "sjenkins@stripe.com",
    referral: "Referred by Alex Vance (Staff SWE)",
    applicationDeadline: "2026-08-30",
    priority: "High",
    notes: "Passed technical phone screen on idempotent API design and rate limiting. Upcoming 4-round loop covers distributed queues, DB transactions, and STAR behavioral questions.",
    nextAction: "Deep dive into idempotency key architecture & distributed locks",
    nextActionDate: "2026-08-25",
    resume: {
      name: "Resume_Senior_Backend_2026.pdf",
      size: 142800,
      dataUrl: "",
      uploadedAt: 1754668800000
    },
    coverLetter: {
      name: "Stripe_Cover_Letter.pdf",
      size: 68400,
      dataUrl: "",
      uploadedAt: 1754668800000
    },
    interviewDate: "2026-08-28 14:00",
    followUpDate: "2026-08-29",
    offerRejectionStatus: "In Progress",
    customFields: {
      cf_target_comp: "$210k Base + $140k Equity",
      cf_tech_stack: "Go, Ruby, PostgreSQL, Kafka",
      cf_source: "Referral"
    },
    archived: false,
    created: 1754668800000,
    updated: 1754841600000
  },
  {
    id: "app-102",
    company: "Google",
    role: "Software Engineer III - Cloud Storage",
    jobUrl: "https://careers.google.com/jobs/results/10984920",
    location: "Sunnyvale, CA",
    workMode: "Hybrid",
    dateFound: "2026-08-02",
    dateApplied: "2026-08-04",
    status: "Screening",
    currentStage: "Online Assessment (OA)",
    recruiter: "David Chen",
    recruiterEmail: "dchen.recruiting@google.com",
    referral: "None",
    applicationDeadline: "2026-08-24",
    priority: "High",
    notes: "OA invitation received. 2 questions, 90 minutes. Focus on tree algorithms, topological sort, and optimal sliding window.",
    nextAction: "Complete OA before deadline",
    nextActionDate: "2026-08-23",
    resume: {
      name: "Resume_General_SWE_2026.pdf",
      size: 139200,
      dataUrl: "",
      uploadedAt: 1754323200000
    },
    coverLetter: null,
    interviewDate: "",
    followUpDate: "2026-08-26",
    offerRejectionStatus: "Awaiting OA Score",
    customFields: {
      cf_target_comp: "$195k Base + $120k GSU",
      cf_tech_stack: "C++, Go, Spanner, Colossus",
      cf_source: "Company Careers"
    },
    archived: false,
    created: 1754323200000,
    updated: 1754409600000
  },
  {
    id: "app-103",
    company: "Datadog",
    role: "Software Engineer - Distributed Tracing",
    jobUrl: "https://careers.datadoghq.com/detail/5849201",
    location: "New York, NY",
    workMode: "Hybrid",
    dateFound: "2026-07-28",
    dateApplied: "2026-07-30",
    status: "Offer",
    currentStage: "Offer Negotiation",
    recruiter: "Elena Rostova",
    recruiterEmail: "elena.r@datadoghq.com",
    referral: "Referral from alumni network",
    applicationDeadline: "2026-08-26",
    priority: "High",
    notes: "Received written offer for SWE II on APM team. Package: $185k Base + $85k RSUs/yr + $25k Sign-on. Comparing with other potential loops.",
    nextAction: "Review benefit documentation and schedule compensation discussion",
    nextActionDate: "2026-08-24",
    resume: {
      name: "Resume_Distributed_Systems.pdf",
      size: 144500,
      dataUrl: "",
      uploadedAt: 1753881600000
    },
    coverLetter: null,
    interviewDate: "",
    followUpDate: "2026-08-25",
    offerRejectionStatus: "$185k Base + $85k RSU + $25k Sign-on",
    customFields: {
      cf_target_comp: "$185k Base + $85k RSU",
      cf_tech_stack: "Go, Python, Kafka, Cassandra",
      cf_source: "Referral"
    },
    archived: false,
    created: 1753881600000,
    updated: 1755200000000
  },
  {
    id: "app-104",
    company: "Linear",
    role: "Product Engineer - Core Sync",
    jobUrl: "https://linear.app/careers/product-engineer",
    location: "San Francisco, CA / Remote",
    workMode: "Remote",
    dateFound: "2026-08-10",
    dateApplied: "2026-08-12",
    status: "Applied",
    currentStage: "Application Submitted",
    recruiter: "Karri Saarinen",
    recruiterEmail: "jobs@linear.app",
    referral: "Direct application with portfolio project",
    applicationDeadline: "2026-09-01",
    priority: "Medium",
    notes: "Submitted application highlighting offline-first client sync engine and optimistic UI replication.",
    nextAction: "Check application portal / InMail follow-up",
    nextActionDate: "2026-08-26",
    resume: {
      name: "Resume_Fullstack_2026.pdf",
      size: 138000,
      dataUrl: "",
      uploadedAt: 1755000000000
    },
    coverLetter: {
      name: "Linear_Sync_Cover_Letter.pdf",
      size: 54000,
      dataUrl: "",
      uploadedAt: 1755000000000
    },
    interviewDate: "",
    followUpDate: "2026-08-26",
    offerRejectionStatus: "Pending Review",
    customFields: {
      cf_target_comp: "$190k Base + Equity",
      cf_tech_stack: "TypeScript, React, SQLite, WebSockets",
      cf_source: "Otta"
    },
    archived: false,
    created: 1755000000000,
    updated: 1755000000000
  },
  {
    id: "app-105",
    company: "Airbnb",
    role: "Backend Engineer - Search & Ranking",
    jobUrl: "https://careers.airbnb.com/positions/4920192",
    location: "San Francisco, CA / Remote",
    workMode: "Remote",
    dateFound: "2026-08-14",
    dateApplied: "",
    status: "Wishlist",
    currentStage: "Bookmark / Sourcing Referral",
    recruiter: "TBD",
    recruiterEmail: "",
    referral: "Connecting with Mike (Engineering Manager)",
    applicationDeadline: "2026-09-15",
    priority: "Medium",
    notes: "Need to refresh vector search and inverted index concepts before submitting referral.",
    nextAction: "Message Mike on LinkedIn regarding team headcount",
    nextActionDate: "2026-08-24",
    resume: null,
    coverLetter: null,
    interviewDate: "",
    followUpDate: "2026-08-24",
    offerRejectionStatus: "Not Applied Yet",
    customFields: {
      cf_target_comp: "$195k Base + $110k Equity",
      cf_tech_stack: "Java, Kotlin, Elasticsearch, HDFS",
      cf_source: "LinkedIn"
    },
    archived: false,
    created: 1755172800000,
    updated: 1755172800000
  },
  {
    id: "app-106",
    company: "Robinhood",
    role: "Software Engineer - Trading & Settlement",
    jobUrl: "https://robinhood.com/careers/49102",
    location: "Menlo Park, CA",
    workMode: "Hybrid",
    dateFound: "2026-07-15",
    dateApplied: "2026-07-18",
    status: "Rejected",
    currentStage: "Post-Technical Phone Screen",
    recruiter: "Marcus Bell",
    recruiterEmail: "mbell@robinhood.com",
    referral: "None",
    applicationDeadline: "2026-07-31",
    priority: "Low",
    notes: "Feedback: Strong on concurrency and thread safety, but role required deeper experience in FIX protocols.",
    nextAction: "Re-apply after 6 months with fintech domain projects",
    nextActionDate: "2027-01-15",
    resume: {
      name: "Resume_Backend_2026.pdf",
      size: 141000,
      dataUrl: "",
      uploadedAt: 1752840000000
    },
    coverLetter: null,
    interviewDate: "",
    followUpDate: "",
    offerRejectionStatus: "Rejected (Technical round feedback noted)",
    customFields: {
      cf_target_comp: "$180k Base + Equity",
      cf_tech_stack: "Python, Go, Kafka, PostgreSQL",
      cf_source: "LinkedIn"
    },
    archived: true,
    created: 1752840000000,
    updated: 1753444800000
  }
];

if (typeof window !== "undefined") {
  window.DEFAULT_APPLICATION_CUSTOM_FIELDS = DEFAULT_APPLICATION_CUSTOM_FIELDS;
  window.INITIAL_APPLICATIONS_DATA = INITIAL_APPLICATIONS_DATA;
}
