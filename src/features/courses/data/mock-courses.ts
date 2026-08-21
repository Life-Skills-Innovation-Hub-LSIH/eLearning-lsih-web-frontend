import type { Course } from "@/shared/types";

function quiz(
  id: string,
  title: string,
  level: "module" | "course",
  prompts: Array<[string, string[], number]>,
) {
  return {
    id,
    title,
    level,
    passingScore: 70,
    questions: prompts.map(([prompt, options, correctIndex], index) => ({
      id: `${id}-q${index + 1}`,
      prompt,
      options,
      correctIndex,
    })),
  };
}

export const mockCourses: Course[] = [
  {
    id: "c1",
    slug: "hospital-infection-control-basics",
    title: "Hospital Infection Control Basics",
    shortDescription:
      "Core practices for preventing healthcare-associated infections.",
    description:
      "Learn essential infection prevention principles used in hospitals and clinics. This course covers hand hygiene, PPE, environmental cleaning, and outbreak response through modules, video lessons, PDF guides, and quizzes.",
    category: "Clinical Safety",
    price: 49,
    status: "published",
    thumbnailGradient: "from-[#004DA0] to-[#0A6BCF]",
    studentsCount: 128,
    instructor: "Dr. Sothea Chan",
    level: "beginner",
    rating: 4.8,
    whatYouWillLearn: [
      "Hand hygiene standards",
      "PPE selection",
      "Cleaning checklists",
      "Outbreak response basics",
    ],
    modules: [
      {
        id: "m1",
        title: "Module 1 — Foundations",
        description: "Why infection control matters and how pathogens spread.",
        order: 1,
        lessons: [
          {
            id: "l1",
            title: "Welcome & Course Overview",
            description: "What you will learn and how to complete the course.",
            type: "video",
            durationMinutes: 8,
            isFreePreview: true,
            mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            order: 1,
          },
          {
            id: "l2",
            title: "Transmission Pathways (PDF Guide)",
            description: "Reference sheet covering contact, droplet, and airborne routes.",
            type: "pdf",
            durationMinutes: 12,
            isFreePreview: true,
            mediaUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            order: 2,
          },
          {
            id: "l3",
            title: "Hand Hygiene in Practice",
            description: "Step-by-step hand hygiene for clinical settings.",
            type: "video",
            durationMinutes: 15,
            isFreePreview: false,
            mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            order: 3,
          },
        ],
        quiz: quiz("q-m1", "Module 1 Quiz", "module", [
          [
            "Which practice is the most effective for reducing HAIs?",
            ["Wearing jewelry", "Proper hand hygiene", "Skipping PPE", "Sharing equipment"],
            1,
          ],
          [
            "Droplet transmission typically requires which distance precaution?",
            ["No distance needed", "Close proximity care", "Only outdoor work", "Only lab settings"],
            1,
          ],
        ]),
      },
      {
        id: "m2",
        title: "Module 2 — PPE & Environment",
        description: "Personal protective equipment and cleaning standards.",
        order: 2,
        lessons: [
          {
            id: "l4",
            title: "PPE Selection Walkthrough",
            description: "Choose the right PPE for common clinical scenarios.",
            type: "video",
            durationMinutes: 18,
            isFreePreview: false,
            mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            order: 1,
          },
          {
            id: "l5",
            title: "Environmental Cleaning Checklist (PDF)",
            description: "Printable checklist for ward cleaning routines.",
            type: "pdf",
            durationMinutes: 10,
            isFreePreview: false,
            mediaUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            order: 2,
          },
        ],
        quiz: quiz("q-m2", "Module 2 Quiz", "module", [
          [
            "When should gloves be changed?",
            ["Once per shift", "Between patients/tasks as needed", "Never", "Only after lunch"],
            1,
          ],
          [
            "High-touch surfaces should be cleaned:",
            ["Monthly", "Only when dirty", "Regularly with approved disinfectant", "With plain water only"],
            2,
          ],
        ]),
      },
    ],
    courseQuiz: quiz("q-c1", "Final Course Quiz", "course", [
      [
        "Infection control programs aim primarily to:",
        ["Increase paperwork", "Prevent healthcare-associated infections", "Replace clinical judgment", "Reduce staffing"],
        1,
      ],
      [
        "A completed course typically includes:",
        ["Only videos", "Modules, lessons, and assessments", "Only PDFs", "No evaluation"],
        1,
      ],
      [
        "PPE should be selected based on:",
        ["Fashion", "Risk and procedure type", "Room color", "Shift length only"],
        1,
      ],
    ]),
  },
  {
    id: "c2",
    slug: "patient-communication-essentials",
    title: "Patient Communication Essentials",
    shortDescription: "Clear, respectful communication for better patient outcomes.",
    description:
      "Build practical communication skills for consultations, consent discussions, and difficult conversations. Includes short videos, PDF scripts, module quizzes, and a final assessment.",
    category: "Soft Skills",
    price: 0,
    status: "published",
    thumbnailGradient: "from-[#003A7A] to-[#F26522]",
    studentsCount: 86,
    instructor: "Ms. Kanha Meas",
    level: "beginner",
    rating: 4.7,
    whatYouWillLearn: [
      "Active listening",
      "Plain language",
      "Difficult conversations",
      "Teach-back technique",
    ],
    modules: [
      {
        id: "m3",
        title: "Module 1 — Listening & Clarity",
        description: "Active listening and plain-language explanations.",
        order: 1,
        lessons: [
          {
            id: "l6",
            title: "Active Listening Demo",
            description: "Watch a short consultation simulation.",
            type: "video",
            durationMinutes: 11,
            isFreePreview: true,
            mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            order: 1,
          },
          {
            id: "l7",
            title: "Plain Language Scripts (PDF)",
            description: "Sample phrases for common explanations.",
            type: "pdf",
            durationMinutes: 8,
            isFreePreview: false,
            mediaUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            order: 2,
          },
        ],
        quiz: quiz("q-m3", "Module 1 Quiz", "module", [
          [
            "Plain language means:",
            ["Using slang", "Clear words patients can understand", "Speaking faster", "Avoiding eye contact"],
            1,
          ],
        ]),
      },
      {
        id: "m4",
        title: "Module 2 — Difficult Conversations",
        description: "Frameworks for sensitive discussions.",
        order: 2,
        lessons: [
          {
            id: "l8",
            title: "Breaking Bad News Framework",
            description: "A structured approach for difficult updates.",
            type: "video",
            durationMinutes: 16,
            isFreePreview: false,
            mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            order: 1,
          },
        ],
        quiz: null,
      },
    ],
    courseQuiz: quiz("q-c2", "Final Course Quiz", "course", [
      [
        "Good patient communication usually includes:",
        ["Assumptions only", "Listening and checking understanding", "Medical jargon only", "No questions"],
        1,
      ],
      [
        "A teach-back moment is used to:",
        ["Test staff memory", "Confirm patient understanding", "End the visit early", "Replace consent"],
        1,
      ],
    ]),
  },
  {
    id: "c3",
    slug: "emergency-triage-intro",
    title: "Emergency Triage Introduction",
    shortDescription: "Intro-level triage priorities for urgent care settings.",
    description:
      "An introductory course on recognizing urgent presentations and prioritizing care. Draft course visible in admin only until published.",
    category: "Emergency",
    price: 79,
    status: "draft",
    thumbnailGradient: "from-[#004DA0] to-[#F26522]",
    studentsCount: 0,
    instructor: "Mr. Rithy Sok",
    level: "intermediate",
    rating: 4.5,
    whatYouWillLearn: [
      "Triage levels",
      "First assessment",
      "Priority decisions",
    ],
    modules: [
      {
        id: "m5",
        title: "Module 1 — Triage Basics",
        description: "Priority levels and first assessment.",
        order: 1,
        lessons: [
          {
            id: "l9",
            title: "Triage Levels Explained",
            description: "Overview of common triage categories.",
            type: "video",
            durationMinutes: 14,
            isFreePreview: false,
            mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            order: 1,
          },
        ],
        quiz: quiz("q-m5", "Module 1 Quiz", "module", [
          [
            "Triage is mainly used to:",
            ["Prioritize care by urgency", "Bill patients", "Replace doctors", "Schedule meetings"],
            0,
          ],
        ]),
      },
    ],
    courseQuiz: null,
  },
  {
    id: "c4",
    slug: "digital-workplace-productivity",
    title: "Digital Workplace Productivity",
    shortDescription: "Organize work, meetings, and focus with simple digital habits.",
    description:
      "A practical course for students and staff who want better daily productivity using digital tools, clear priorities, and healthy work routines.",
    category: "Productivity",
    price: 29,
    status: "published",
    thumbnailGradient: "from-[#0A6BCF] to-[#004DA0]",
    studentsCount: 204,
    instructor: "Ms. Dara Lim",
    level: "beginner",
    rating: 4.6,
    whatYouWillLearn: [
      "Weekly planning",
      "Focus blocks",
      "Digital habits",
      "Review routines",
    ],
    modules: [
      {
        id: "m6",
        title: "Module 1 — Plan Your Week",
        description: "Priorities, calendars, and realistic goals.",
        order: 1,
        lessons: [
          {
            id: "l10",
            title: "Weekly Planning Framework",
            description: "A simple system for planning work and study time.",
            type: "video",
            durationMinutes: 12,
            isFreePreview: true,
            mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            order: 1,
          },
          {
            id: "l11",
            title: "Planning Template (PDF)",
            description: "Printable weekly planner template.",
            type: "pdf",
            durationMinutes: 8,
            isFreePreview: true,
            mediaUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            order: 2,
          },
        ],
        quiz: quiz("q-m6", "Module 1 Quiz", "module", [
          [
            "A good weekly plan should start with:",
            ["Random tasks", "Top priorities", "Only meetings", "Social media"],
            1,
          ],
        ]),
      },
      {
        id: "m7",
        title: "Module 2 — Focus Habits",
        description: "Reduce distractions and protect deep work time.",
        order: 2,
        lessons: [
          {
            id: "l12",
            title: "Deep Work Basics",
            description: "How to protect focus blocks in a busy day.",
            type: "video",
            durationMinutes: 14,
            isFreePreview: false,
            mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            order: 1,
          },
        ],
        quiz: quiz("q-m7", "Module 2 Quiz", "module", [
          [
            "Deep work is best protected by:",
            ["Constant notifications", "Scheduled focus blocks", "Skipping breaks", "Multitasking"],
            1,
          ],
        ]),
      },
    ],
    courseQuiz: quiz("q-c4", "Final Course Quiz", "course", [
      [
        "Productivity systems work best when they are:",
        ["Complicated", "Simple and consistent", "Changed every hour", "Ignored"],
        1,
      ],
      [
        "A weekly review helps you:",
        ["Avoid planning", "Adjust priorities and progress", "Delete all tasks", "Skip learning"],
        1,
      ],
    ]),
  },
  {
    id: "c5",
    slug: "leadership-for-new-supervisors",
    title: "Leadership for New Supervisors",
    shortDescription: "Core leadership skills for first-time team leads.",
    description:
      "Learn how to set expectations, give feedback, and support team performance as a new supervisor.",
    category: "Leadership",
    price: 59,
    status: "published",
    thumbnailGradient: "from-[#F26522] to-[#004DA0]",
    studentsCount: 97,
    instructor: "Mr. Vichea Phan",
    level: "intermediate",
    rating: 4.9,
    whatYouWillLearn: [
      "Expectation setting",
      "Feedback skills",
      "Team support",
      "First 90 days",
    ],
    modules: [
      {
        id: "m8",
        title: "Module 1 — Leading People",
        description: "Role transition from individual contributor to supervisor.",
        order: 1,
        lessons: [
          {
            id: "l13",
            title: "From Peer to Leader",
            description: "Common challenges in the first 90 days.",
            type: "video",
            durationMinutes: 15,
            isFreePreview: true,
            mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            order: 1,
          },
          {
            id: "l14",
            title: "Expectation Setting Checklist (PDF)",
            description: "A checklist for clarifying team expectations.",
            type: "pdf",
            durationMinutes: 10,
            isFreePreview: false,
            mediaUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            order: 2,
          },
        ],
        quiz: quiz("q-m8", "Module 1 Quiz", "module", [
          [
            "New supervisors should prioritize:",
            ["Clear expectations", "Ignoring feedback", "Working alone", "Avoiding 1:1s"],
            0,
          ],
        ]),
      },
      {
        id: "m9",
        title: "Module 2 — Feedback Conversations",
        description: "How to give constructive and timely feedback.",
        order: 2,
        lessons: [
          {
            id: "l15",
            title: "Feedback Conversation Demo",
            description: "Watch a model feedback conversation.",
            type: "video",
            durationMinutes: 13,
            isFreePreview: false,
            mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            order: 1,
          },
        ],
        quiz: quiz("q-m9", "Module 2 Quiz", "module", [
          [
            "Effective feedback is usually:",
            ["Vague and delayed", "Specific and timely", "Public criticism", "Only positive"],
            1,
          ],
        ]),
      },
    ],
    courseQuiz: quiz("q-c5", "Final Course Quiz", "course", [
      [
        "A supervisor's main responsibility is to:",
            ["Support team performance", "Do all tasks alone", "Avoid communication", "Hide goals"],
        0,
      ],
      [
        "Good feedback should be:",
        ["Personal attacks", "Behavior-focused and actionable", "Only written once a year", "Shared with everyone always"],
        1,
      ],
    ]),
  },
  {
    id: "c6",
    slug: "customer-service-excellence",
    title: "Customer Service Excellence",
    shortDescription: "Handle requests, complaints, and follow-up with confidence.",
    description:
      "Build customer service skills for front-line and support roles, including listening, problem solving, and recovery after service issues.",
    category: "Service Skills",
    price: 0,
    status: "published",
    thumbnailGradient: "from-[#004DA0] to-[#36A2EB]",
    studentsCount: 312,
    instructor: "Ms. Sreyneat Ou",
    level: "beginner",
    rating: 4.8,
    whatYouWillLearn: [
      "Service mindset",
      "Complaint recovery",
      "Follow-up habits",
      "Clear communication",
    ],
    modules: [
      {
        id: "m10",
        title: "Module 1 — Service Mindset",
        description: "Listening and first-response skills.",
        order: 1,
        lessons: [
          {
            id: "l16",
            title: "First Impression Moments",
            description: "How the first response shapes trust.",
            type: "video",
            durationMinutes: 10,
            isFreePreview: true,
            mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            order: 1,
          },
          {
            id: "l17",
            title: "Service Phrase Bank (PDF)",
            description: "Helpful phrases for common customer situations.",
            type: "pdf",
            durationMinutes: 7,
            isFreePreview: true,
            mediaUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            order: 2,
          },
        ],
        quiz: quiz("q-m10", "Module 1 Quiz", "module", [
          [
            "The first response should mainly show:",
            ["Blame", "Empathy and clarity", "Delay", "Argument"],
            1,
          ],
        ]),
      },
      {
        id: "m11",
        title: "Module 2 — Handling Complaints",
        description: "Recover trust when things go wrong.",
        order: 2,
        lessons: [
          {
            id: "l18",
            title: "Complaint Recovery Steps",
            description: "A practical 4-step recovery process.",
            type: "video",
            durationMinutes: 12,
            isFreePreview: false,
            mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            order: 1,
          },
        ],
        quiz: quiz("q-m11", "Module 2 Quiz", "module", [
          [
            "Service recovery should include:",
            ["Ignoring the issue", "Acknowledgement and solution", "Raising voice", "No follow-up"],
            1,
          ],
        ]),
      },
    ],
    courseQuiz: quiz("q-c6", "Final Course Quiz", "course", [
      [
        "Excellent service usually requires:",
        ["Listening and clear next steps", "Guessing only", "No documentation", "Avoiding customers"],
        0,
      ],
      [
        "After resolving a complaint you should:",
        ["Disappear", "Confirm the outcome and follow up", "Argue again", "Close without notes"],
        1,
      ],
    ]),
  },
  {
    id: "c7",
    slug: "data-basics-for-teams",
    title: "Data Basics for Teams",
    shortDescription: "Read simple charts, track KPIs, and make better decisions.",
    description:
      "An intro course for non-technical staff who need to understand basic data, dashboards, and decision-making with evidence.",
    category: "Data Skills",
    price: 39,
    status: "published",
    thumbnailGradient: "from-[#003A7A] to-[#0A6BCF]",
    studentsCount: 151,
    instructor: "Mr. Borey Hang",
    level: "beginner",
    rating: 4.4,
    whatYouWillLearn: [
      "Read charts",
      "Understand KPIs",
      "Insight to action",
      "Team decisions",
    ],
    modules: [
      {
        id: "m12",
        title: "Module 1 — Data Literacy",
        description: "Types of data and common chart mistakes.",
        order: 1,
        lessons: [
          {
            id: "l19",
            title: "Reading Charts Confidently",
            description: "Bar, line, and simple percentage charts.",
            type: "video",
            durationMinutes: 16,
            isFreePreview: true,
            mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            order: 1,
          },
          {
            id: "l20",
            title: "KPI Glossary (PDF)",
            description: "Common KPI terms explained simply.",
            type: "pdf",
            durationMinutes: 9,
            isFreePreview: false,
            mediaUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            order: 2,
          },
        ],
        quiz: quiz("q-m12", "Module 1 Quiz", "module", [
          [
            "A KPI is mainly used to:",
            ["Track important performance", "Decorate slides", "Replace all meetings", "Hide results"],
            0,
          ],
        ]),
      },
      {
        id: "m13",
        title: "Module 2 — Decisions with Data",
        description: "Turn numbers into practical next actions.",
        order: 2,
        lessons: [
          {
            id: "l21",
            title: "From Insight to Action",
            description: "How teams convert data into decisions.",
            type: "video",
            durationMinutes: 11,
            isFreePreview: false,
            mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            order: 1,
          },
        ],
        quiz: quiz("q-m13", "Module 2 Quiz", "module", [
          [
            "Good data-driven decisions should include:",
            ["Context and next actions", "Charts only", "No discussion", "Ignoring outliers always"],
            0,
          ],
        ]),
      },
    ],
    courseQuiz: quiz("q-c7", "Final Course Quiz", "course", [
      [
        "Data literacy helps teams:",
        ["Make clearer decisions", "Avoid all meetings", "Stop measuring", "Guess more"],
        0,
      ],
      [
        "When a KPI drops, the next step is usually:",
        ["Investigate causes and act", "Delete the KPI", "Ignore it", "Celebrate only"],
        0,
      ],
    ]),
  },
];

const extraCourseBlueprints: Array<{
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  category: string;
  price: number;
  thumbnailGradient: string;
  studentsCount: number;
  instructor: string;
  level: Course["level"];
  rating: number;
}> = [
  {
    id: "c8",
    slug: "resume-writing-essentials",
    title: "Resume Writing Essentials",
    shortDescription: "Write a clear, job-ready resume that highlights your strengths.",
    category: "Career Ready",
    price: 0,
    thumbnailGradient: "from-[#054DA1] to-[#36A2EB]",
    studentsCount: 890,
    instructor: "Ms. Sreyneat Ou",
    level: "beginner",
    rating: 4.7,
  },
  {
    id: "c9",
    slug: "interview-confidence",
    title: "Interview Confidence",
    shortDescription: "Prepare answers, body language, and follow-up for interviews.",
    category: "Career Ready",
    price: 29,
    thumbnailGradient: "from-[#F26522] to-[#054DA1]",
    studentsCount: 742,
    instructor: "Ms. Kanha Meas",
    level: "beginner",
    rating: 4.6,
  },
  {
    id: "c10",
    slug: "time-management-habits",
    title: "Time Management Habits",
    shortDescription: "Plan your week, protect focus, and finish work on time.",
    category: "Skills",
    price: 0,
    thumbnailGradient: "from-[#003A7A] to-[#0A6BCF]",
    studentsCount: 1104,
    instructor: "Ms. Dara Lim",
    level: "beginner",
    rating: 4.8,
  },
  {
    id: "c11",
    slug: "financial-literacy-basics",
    title: "Financial Literacy Basics",
    shortDescription: "Budget, save, and make everyday money decisions with confidence.",
    category: "Skills",
    price: 19,
    thumbnailGradient: "from-[#0A6BCF] to-[#F26522]",
    studentsCount: 968,
    instructor: "Mr. Vichea Phan",
    level: "beginner",
    rating: 4.5,
  },
  {
    id: "c12",
    slug: "public-speaking-foundations",
    title: "Public Speaking Foundations",
    shortDescription: "Speak clearly in meetings, classes, and presentations.",
    category: "Leadership",
    price: 39,
    thumbnailGradient: "from-[#054DA1] to-[#F26522]",
    studentsCount: 621,
    instructor: "Dr. Sothea Chan",
    level: "intermediate",
    rating: 4.7,
  },
  {
    id: "c13",
    slug: "teamwork-and-collaboration",
    title: "Teamwork and Collaboration",
    shortDescription: "Work better with others and handle team conflict professionally.",
    category: "Leadership",
    price: 0,
    thumbnailGradient: "from-[#36A2EB] to-[#003A7A]",
    studentsCount: 834,
    instructor: "Mr. Rithy Sok",
    level: "beginner",
    rating: 4.4,
  },
  {
    id: "c14",
    slug: "emotional-leadership",
    title: "Emotional Leadership",
    shortDescription: "Lead with empathy, stay calm under pressure, and support your team.",
    category: "Leadership",
    price: 49,
    thumbnailGradient: "from-[#043d80] to-[#36A2EB]",
    studentsCount: 512,
    instructor: "Ms. Kanha Meas",
    level: "intermediate",
    rating: 4.6,
  },
  {
    id: "c15",
    slug: "digital-literacy-for-work",
    title: "Digital Literacy for Work",
    shortDescription: "Use email, files, and workplace tools with more confidence.",
    category: "Career Ready",
    price: 0,
    thumbnailGradient: "from-[#F26522] to-[#0A6BCF]",
    studentsCount: 1270,
    instructor: "Ms. Dara Lim",
    level: "beginner",
    rating: 4.5,
  },
  {
    id: "c16",
    slug: "self-confidence-at-work",
    title: "Self Confidence at Work",
    shortDescription: "Speak up, take ownership, and present yourself professionally.",
    category: "Skills",
    price: 19,
    thumbnailGradient: "from-[#054DA1] to-[#003A7A]",
    studentsCount: 703,
    instructor: "Mr. Borey Hang",
    level: "beginner",
    rating: 4.7,
  },
];

const baseCount = mockCourses.length;
extraCourseBlueprints.forEach((item, index) => {
  const template = mockCourses[index % baseCount];
  mockCourses.push({
    ...template,
    ...item,
    description: item.shortDescription,
    whatYouWillLearn: template.whatYouWillLearn,
    modules: template.modules,
    courseQuiz: template.courseQuiz,
    status: "published",
  });
});


export function getCourseDurationLabel(course: Course) {
  const minutes = course.modules.reduce(
    (total, module) =>
      total + module.lessons.reduce((sum, lesson) => sum + lesson.durationMinutes, 0),
    0,
  );
  const hours = Math.max(1, Math.round(minutes / 60));
  return `${hours}h`;
}

export function getLevelLabel(level: Course["level"]) {
  if (level === "beginner") return "Beginner";
  if (level === "intermediate") return "Intermediate";
  return "Advanced";
}

export function getPublishedCourses() {
  return mockCourses.filter((course) => course.status === "published");
}

export function getCourseBySlug(slug: string) {
  return mockCourses.find((course) => course.slug === slug) ?? null;
}

export function countLessons(course: Course) {
  return course.modules.reduce((total, module) => total + module.lessons.length, 0);
}

export function countQuizzes(course: Course) {
  const moduleQuizzes = course.modules.filter((module) => module.quiz).length;
  return moduleQuizzes + (course.courseQuiz ? 1 : 0);
}
