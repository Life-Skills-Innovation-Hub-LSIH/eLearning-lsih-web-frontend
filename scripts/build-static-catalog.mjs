import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const subjects = [
  { id: 1, name: "Artificial Intelligence", slug: "artificial-intelligence", code: "SUB-AI" },
  { id: 2, name: "Cybersecurity", slug: "cybersecurity", code: "SUB-CYB" },
  { id: 3, name: "Cloud Computing", slug: "cloud-computing", code: "SUB-CLD" },
  { id: 4, name: "Database Management", slug: "database-management", code: "SUB-DB" },
  { id: 5, name: "Network Engineer", slug: "network-engineer", code: "SUB-NET" },
  {
    id: 6,
    name: "Information Technology Engineering",
    slug: "information-technology-engineering",
    code: "SUB-ITE",
  },
].map((s) => ({
  ...s,
  description: null,
  icon: null,
  status: "published",
  courses_count: 1,
}));

const lecturers = {
  "Mr. One Piece": { id: 1, name: "Mr. One Piece", title: "AI Instructor" },
  Goku: { id: 2, name: "Goku", title: "IT Instructor" },
  "Dr. Sotheavann Chhorn": { id: 3, name: "Dr. Sotheavann Chhorn", title: "Lead Instructor" },
  "Naruto Uzumaki": { id: 4, name: "Naruto Uzumaki", title: "Network Instructor" },
};

const covers = {
  "Artificial Intelligence":
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80",
  "Cybersecurity Essentials":
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
  "Cloud Computing Fundamentals":
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
  "Database Management Basics":
    "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1600&q=80",
  "Network Engineering Intro":
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80",
  "ITE Core Skills":
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80",
};

const stats = {
  "Artificial Intelligence": { rating: 4.8, reviews_count: 86, enrollments_count: 312 },
  "Cybersecurity Essentials": { rating: 4.9, reviews_count: 124, enrollments_count: 418 },
  "Cloud Computing Fundamentals": { rating: 4.7, reviews_count: 73, enrollments_count: 256 },
  "Database Management Basics": { rating: 4.6, reviews_count: 61, enrollments_count: 198 },
  "Network Engineering Intro": { rating: 4.7, reviews_count: 54, enrollments_count: 167 },
  "ITE Core Skills": { rating: 4.8, reviews_count: 92, enrollments_count: 284 },
};

let lessonId = 1;
let quizId = 1;
let questionId = 1;
let optionId = 1;
let moduleId = 1;

function lesson(title, duration, body) {
  const id = lessonId++;
  return {
    id,
    title,
    slug: slugify(title),
    content_type: "text",
    body,
    media_url: null,
    duration_minutes: duration,
    position: 0,
  };
}

function quiz(title, questions, lessonTitle = null) {
  const id = quizId++;
  return {
    id,
    lesson_id: lessonTitle,
    title,
    pass_score: 70,
    questions: questions.map((q) => ({
      id: questionId++,
      question_text: q.text,
      type: q.type ?? "multiple_choice",
      options: q.options.map((opt, i) => ({
        id: optionId++,
        option_text: opt.text,
        position: i + 1,
      })),
    })),
  };
}

function module(title, description, lessons, quizzes) {
  const id = moduleId++;
  const withPos = lessons.map((item, i) => ({ ...item, position: i + 1 }));
  const lessonByTitle = Object.fromEntries(withPos.map((l) => [l.title, l.id]));
  return {
    id,
    title,
    description,
    lessons: withPos,
    quizzes: quizzes.map((q) => ({
      ...q,
      lesson_id: q.lesson_id ? lessonByTitle[q.lesson_id] ?? null : null,
    })),
  };
}

const coursesSeed = [
  {
    title: "Artificial Intelligence",
    subject: "Artificial Intelligence",
    lecturer: "Mr. One Piece",
    level: "beginner",
    short_description: "Foundations of AI concepts, terminology, and practical applications.",
    description:
      "Learn what AI is, how models work at a high level, and how to apply AI thinking in real projects.",
    modules: [
      module(
        "What is AI?",
        "Core ideas behind artificial intelligence.",
        [
          lesson(
            "Introduction to AI",
            12,
            "AI is the field of building systems that perform tasks that typically require human intelligence.",
          ),
          lesson(
            "AI vs Machine Learning",
            15,
            "Machine learning is a subset of AI focused on learning patterns from data.",
          ),
        ],
        [
          quiz(
            "AI Basics Quiz",
            [
              {
                text: "What does AI stand for?",
                options: [
                  { text: "Artificial Intelligence" },
                  { text: "Automated Internet" },
                  { text: "Advanced Interface" },
                ],
              },
              {
                text: "Machine learning is part of AI.",
                type: "true_false",
                options: [{ text: "True" }, { text: "False" }],
              },
            ],
            "Introduction to AI",
          ),
          quiz("Module 1 Checkpoint", [
            {
              text: "Which is an AI application?",
              options: [
                { text: "Image recognition" },
                { text: "A static HTML page" },
                { text: "A paper notebook" },
              ],
            },
          ]),
        ],
      ),
      module(
        "Practical AI",
        "Where AI is used in the real world.",
        [
          lesson(
            "AI in Daily Life",
            10,
            "From recommendations to voice assistants, AI is already part of everyday products.",
          ),
          lesson(
            "Ethics and Responsibility",
            14,
            "Responsible AI considers bias, privacy, transparency, and human oversight.",
          ),
        ],
        [
          quiz(
            "Practical AI Quiz",
            [
              {
                text: "Why does AI ethics matter?",
                options: [
                  { text: "To reduce harmful bias and protect users" },
                  { text: "Only to make models slower" },
                  { text: "It does not matter" },
                ],
              },
            ],
            "Ethics and Responsibility",
          ),
        ],
      ),
    ],
  },
  {
    title: "Cybersecurity Essentials",
    subject: "Cybersecurity",
    lecturer: "Goku",
    level: "beginner",
    short_description: "Protect systems, networks, and data from common threats.",
    description: "A practical intro to cybersecurity concepts, attacks, and defensive basics.",
    modules: [
      module(
        "Security Foundations",
        "CIA triad and threat landscape.",
        [
          lesson(
            "CIA Triad Explained",
            12,
            "Confidentiality, Integrity, and Availability are the core pillars of information security.",
          ),
          lesson(
            "Common Attack Types",
            16,
            "Phishing, malware, ransomware, and social engineering are frequent attack vectors.",
          ),
        ],
        [
          quiz(
            "Security Basics Quiz",
            [
              {
                text: "What does the “C” in CIA triad stand for?",
                options: [
                  { text: "Confidentiality" },
                  { text: "Connectivity" },
                  { text: "Compatibility" },
                ],
              },
            ],
            "CIA Triad Explained",
          ),
          quiz("Module Checkpoint", [
            {
              text: "Phishing is a type of social engineering.",
              type: "true_false",
              options: [{ text: "True" }, { text: "False" }],
            },
          ]),
        ],
      ),
      module(
        "Defensive Practices",
        "How to reduce risk.",
        [
          lesson(
            "Password Hygiene",
            10,
            "Use unique passwords, a password manager, and enable MFA wherever possible.",
          ),
          lesson(
            "Safe Browsing Habits",
            11,
            "Verify URLs, avoid unknown attachments, and keep software updated.",
          ),
        ],
        [
          quiz(
            "Defense Quiz",
            [
              {
                text: "MFA stands for Multi-Factor Authentication.",
                type: "true_false",
                options: [{ text: "True" }, { text: "False" }],
              },
            ],
            "Password Hygiene",
          ),
        ],
      ),
    ],
  },
  {
    title: "Cloud Computing Fundamentals",
    subject: "Cloud Computing",
    lecturer: "Goku",
    level: "beginner",
    short_description: "Understand cloud models, services, and deployment patterns.",
    description: "Learn IaaS, PaaS, SaaS and how cloud platforms support modern applications.",
    modules: [
      module(
        "Cloud Basics",
        "What cloud computing is and why it matters.",
        [
          lesson(
            "What is Cloud Computing?",
            12,
            "Cloud computing delivers compute, storage, and services over the internet on demand.",
          ),
          lesson(
            "IaaS, PaaS, SaaS",
            14,
            "These service models define how much you manage versus what the provider manages.",
          ),
        ],
        [
          quiz(
            "Cloud Models Quiz",
            [
              {
                text: "Gmail is typically an example of SaaS.",
                type: "true_false",
                options: [{ text: "True" }, { text: "False" }],
              },
            ],
            "IaaS, PaaS, SaaS",
          ),
        ],
      ),
      module(
        "Cloud in Practice",
        "Deployment and operations basics.",
        [
          lesson(
            "Regions and Availability",
            11,
            "Cloud regions and availability zones help you design for resilience and latency.",
          ),
          lesson("Cost Awareness", 10, "Monitor usage, right-size resources, and turn off unused services to control cost."),
        ],
        [
          quiz("Cloud Practice Quiz", [
            {
              text: "Why do cloud regions matter?",
              options: [
                { text: "Latency, compliance, and resilience" },
                { text: "Only for changing logo colors" },
                { text: "They do not matter" },
              ],
            },
          ]),
        ],
      ),
    ],
  },
  {
    title: "Database Management Basics",
    subject: "Database Management",
    lecturer: "Dr. Sotheavann Chhorn",
    level: "beginner",
    short_description: "Relational databases, SQL, and data modeling essentials.",
    description: "Learn tables, keys, relationships, and practical SQL for everyday development.",
    modules: [
      module(
        "Data Modeling",
        "Structure data correctly.",
        [
          lesson(
            "Tables and Keys",
            13,
            "Primary keys uniquely identify rows. Foreign keys connect related tables.",
          ),
          lesson(
            "Relationships",
            12,
            "One-to-one, one-to-many, and many-to-many relationships shape schema design.",
          ),
        ],
        [
          quiz(
            "Modeling Quiz",
            [
              {
                text: "A primary key must be unique.",
                type: "true_false",
                options: [{ text: "True" }, { text: "False" }],
              },
            ],
            "Tables and Keys",
          ),
        ],
      ),
      module(
        "SQL Essentials",
        "Query and modify data.",
        [
          lesson(
            "SELECT Queries",
            15,
            "SELECT retrieves rows. Use WHERE, ORDER BY, and LIMIT to refine results.",
          ),
          lesson(
            "INSERT UPDATE DELETE",
            14,
            "These statements create, change, and remove records in a controlled way.",
          ),
        ],
        [
          quiz(
            "SQL Quiz",
            [
              {
                text: "Which statement reads data?",
                options: [{ text: "SELECT" }, { text: "INSERT" }, { text: "DROP" }],
              },
            ],
            "SELECT Queries",
          ),
          quiz("SQL Module Checkpoint", [
            {
              text: "DELETE removes rows from a table.",
              type: "true_false",
              options: [{ text: "True" }, { text: "False" }],
            },
          ]),
        ],
      ),
    ],
  },
  {
    title: "Network Engineering Intro",
    subject: "Network Engineer",
    lecturer: "Naruto Uzumaki",
    level: "beginner",
    short_description: "Networking fundamentals for modern IT roles.",
    description: "IP, DNS, routing basics, and how devices communicate across networks.",
    modules: [
      module(
        "Network Foundations",
        "How networks communicate.",
        [
          lesson(
            "OSI Model Overview",
            14,
            "The OSI model separates networking into layers from physical media to applications.",
          ),
          lesson(
            "IP Addressing Basics",
            15,
            "IPv4 addresses identify hosts. Subnets group devices in the same network range.",
          ),
        ],
        [
          quiz(
            "Networking Quiz",
            [
              {
                text: "DNS translates domain names to IP addresses.",
                type: "true_false",
                options: [{ text: "True" }, { text: "False" }],
              },
            ],
            "IP Addressing Basics",
          ),
        ],
      ),
      module(
        "Connectivity Tools",
        "Diagnose and understand traffic flow.",
        [
          lesson("Ping and Traceroute", 10, "Ping checks reachability. Traceroute shows the path packets take."),
          lesson(
            "Switches vs Routers",
            12,
            "Switches connect devices in a LAN. Routers connect different networks.",
          ),
        ],
        [
          quiz("Tools Quiz", [
            {
              text: "A router connects different networks.",
              type: "true_false",
              options: [{ text: "True" }, { text: "False" }],
            },
          ]),
        ],
      ),
    ],
  },
  {
    title: "ITE Core Skills",
    subject: "Information Technology Engineering",
    lecturer: "Dr. Sotheavann Chhorn",
    level: "intermediate",
    short_description: "Core IT engineering skills across systems, web, and operations.",
    description: "A practical course covering software foundations, APIs, and delivery basics.",
    modules: [
      module(
        "Software Foundations",
        "How modern applications are built.",
        [
          lesson("Frontend vs Backend", 12, "Frontend focuses on UI. Backend handles business logic, data, and APIs."),
          lesson(
            "APIs and JSON",
            13,
            "APIs let systems communicate. JSON is a common data format for web APIs.",
          ),
        ],
        [
          quiz(
            "Foundations Quiz",
            [
              {
                text: "JSON is commonly used in web APIs.",
                type: "true_false",
                options: [{ text: "True" }, { text: "False" }],
              },
            ],
            "APIs and JSON",
          ),
        ],
      ),
      module(
        "Delivery Basics",
        "Ship and maintain software.",
        [
          lesson(
            "Version Control with Git",
            14,
            "Git tracks changes so teams can collaborate and recover previous versions.",
          ),
          lesson(
            "Testing Mindset",
            11,
            "Testing reduces bugs by verifying behavior before users find problems.",
          ),
        ],
        [
          quiz(
            "Delivery Quiz",
            [
              {
                text: "Git helps teams collaborate on code.",
                type: "true_false",
                options: [{ text: "True" }, { text: "False" }],
              },
            ],
            "Version Control with Git",
          ),
          quiz("Course Final Checkpoint", [
            {
              text: "Which is a backend responsibility?",
              options: [
                { text: "Business logic and databases" },
                { text: "Only CSS styling" },
                { text: "Only button colors" },
              ],
            },
          ]),
        ],
      ),
    ],
  },
];

const subjectByName = Object.fromEntries(subjects.map((s) => [s.name, s]));

const courses = coursesSeed.map((item, index) => {
  const subject = subjectByName[item.subject];
  const duration = item.modules.reduce(
    (sum, mod) => sum + mod.lessons.reduce((inner, l) => inner + (l.duration_minutes ?? 0), 0),
    0,
  );
  const lessonsCount = item.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
  const quizzesCount = item.modules.reduce((sum, mod) => sum + mod.quizzes.length, 0);
  return {
    id: index + 1,
    title: item.title,
    slug: slugify(item.title),
    code: `CRS-${String(index + 1).padStart(4, "0")}`,
    short_description: item.short_description,
    description: item.description,
    cover_image: covers[item.title],
    level: item.level,
    price: 0,
    status: "published",
    lecturer: { ...lecturers[item.lecturer], avatar: null },
    subjects: [{ id: subject.id, name: subject.name, slug: subject.slug }],
    modules: item.modules,
    modules_count: item.modules.length,
    lessons_count: lessonsCount,
    quizzes_count: quizzesCount,
    duration_minutes: duration,
    ...stats[item.title],
  };
});

const reviews = [
  {
    id: 1,
    course_id: 2,
    rating: 5,
    comment: "Clear intro to cybersecurity. The password and phishing lessons are practical.",
    created_at: "2026-09-12T08:00:00.000Z",
    user: { id: 101, first_name: "Sreypov", last_name: "Chan", username: "sreypov" },
  },
  {
    id: 2,
    course_id: 2,
    rating: 5,
    comment: "Good pace and simple examples. I finally understand the CIA triad.",
    created_at: "2026-10-02T08:00:00.000Z",
    user: { id: 102, first_name: "Vicheka", last_name: "Lim", username: "vicheka" },
  },
  {
    id: 3,
    course_id: 1,
    rating: 5,
    comment: "Helpful overview of AI without too much math.",
    created_at: "2026-08-21T08:00:00.000Z",
    user: { id: 103, first_name: "Dara", last_name: "Sok", username: "dara" },
  },
];

const out = { subjects, courses, reviews };
const dest = join(dirname(fileURLToPath(import.meta.url)), "../src/data/catalog.json");
writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${courses.length} courses to ${dest}`);
