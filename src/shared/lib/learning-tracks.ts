export type LearningTrackId =
  | "grade12"
  | "life-skills"
  | "leadership"
  | "job-ready";

export type ExploreCategory = {
  track: LearningTrackId;
  titleKm: string;
  titleEn: string;
  items: Array<{ labelKm: string; labelEn: string; q: string }>;
};

/** Keywords used to match courses/subjects to a learning track (client-side). */
export const TRACK_KEYWORDS: Record<LearningTrackId, string[]> = {
  grade12: [
    "grade 12",
    "bac",
    "បាក់ឌុប",
    "exam",
    "ប្រឡង",
    "national exam",
    "university",
    "scholarship",
    "admissions",
    "អាហារូបករណ៍",
  ],
  "life-skills": [
    "life skill",
    "បំណិន",
    "ជំនាញ",
    "financial",
    "ហិរញ្ញ",
    "budget",
    "critical",
    "digital citizenship",
    "well-being",
    "ស្ត្រេស",
    "អារម្មណ៍",
  ],
  leadership: [
    "leadership",
    "ដឹកនាំ",
    "public speaking",
    "និយាយ",
    "team",
    "ក្រុម",
    "project",
    "គម្រោង",
    "strategic",
  ],
  "job-ready": [
    "job",
    "career",
    "ការងារ",
    "resume",
    "cv",
    "ប្រវត្តិរូប",
    "interview",
    "សម្ភាសន៍",
    "workplace",
    "linkedin",
    "email",
  ],
};

export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  {
    track: "grade12",
    titleKm: "ការត្រៀមខ្លួនសម្រាប់ថ្នាក់ទី១២",
    titleEn: "Grade 12 Readiness",
    items: [
      {
        labelKm: "ការត្រៀមប្រឡងថ្នាក់ជាតិ",
        labelEn: "National Exam Prep",
        q: "exam",
      },
      {
        labelKm: "ការជ្រើសរើសជំនាញសាកលវិទ្យាល័យ",
        labelEn: "University Major Selection",
        q: "university",
      },
      {
        labelKm: "ការត្រៀមដាក់អាហារូបករណ៍ និងចុះឈ្មោះរៀន",
        labelEn: "Scholarship & Admissions Prep",
        q: "scholarship",
      },
      {
        labelKm: "ការបត់បែនក្នុងជីវិតនិស្សិត",
        labelEn: "Higher Education Transition",
        q: "transition",
      },
    ],
  },
  {
    track: "life-skills",
    titleKm: "បំណិនជីវិត",
    titleEn: "Life Skills",
    items: [
      {
        labelKm: "ចំណេះដឹងហិរញ្ញវត្ថុ",
        labelEn: "Financial Literacy",
        q: "financial",
      },
      {
        labelKm: "ការគិតបែបស៊ីជម្រៅ និងការដោះស្រាយបញ្ហា",
        labelEn: "Critical Thinking",
        q: "critical",
      },
      {
        labelKm: "ចំណេះដឹងឌីជីថល",
        labelEn: "Digital Citizenship",
        q: "digital",
      },
      {
        labelKm: "សុខុមាលភាព និងភាពធន់នៃផ្លូវចិត្ត",
        labelEn: "Personal Well-being",
        q: "well-being",
      },
    ],
  },
  {
    track: "leadership",
    titleKm: "ភាពជាអ្នកដឹកនាំ",
    titleEn: "Leadership",
    items: [
      {
        labelKm: "ការប្រាស្រ័យទាក់ទង និងការនិយាយជាសាធារណៈ",
        labelEn: "Public Speaking",
        q: "public speaking",
      },
      {
        labelKm: "សាមគ្គីភាព និងការសហការ",
        labelEn: "Team Dynamics",
        q: "team",
      },
      {
        labelKm: "មូលដ្ឋានគ្រឹះនៃការគ្រប់គ្រងគម្រោង",
        labelEn: "Project Management",
        q: "project",
      },
      {
        labelKm: "ការគិតបែបយុទ្ធសាស្ត្រ និងនវានុវត្តន៍",
        labelEn: "Strategic Thinking",
        q: "strategic",
      },
    ],
  },
  {
    track: "job-ready",
    titleKm: "ការត្រៀមខ្លួនចូលធ្វើការ",
    titleEn: "Job Ready",
    items: [
      {
        labelKm: "ការកសាងម៉ាកសញ្ញាផ្ទាល់ខ្លួន",
        labelEn: "Professional Branding",
        q: "resume",
      },
      {
        labelKm: "ជំនាញសម្ភាសន៍ការងារ",
        labelEn: "Interview Mastery",
        q: "interview",
      },
      {
        labelKm: "ឧបករណ៍ការងារឌីជីថល",
        labelEn: "Workplace Productivity Tools",
        q: "office",
      },
      {
        labelKm: "ក្រមសីលធម៌ការងារ",
        labelEn: "Workplace Etiquette",
        q: "workplace",
      },
    ],
  },
];

export function trackHref(track: LearningTrackId, q?: string) {
  const params = new URLSearchParams({ track });
  if (q?.trim()) params.set("q", q.trim());
  return `/courses?${params.toString()}`;
}

export function courseMatchesTrack(
  course: {
    title?: string | null;
    short_description?: string | null;
    description?: string | null;
    subjects?: Array<{ name?: string | null; slug?: string | null }>;
  },
  track: LearningTrackId,
) {
  const keywords = TRACK_KEYWORDS[track];
  const haystack = [
    course.title,
    course.short_description,
    course.description,
    ...(course.subjects ?? []).flatMap((s) => [s.name, s.slug]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

export function getTrackLabel(track: LearningTrackId, locale: "km" | "en") {
  const cat = EXPLORE_CATEGORIES.find((c) => c.track === track);
  if (!cat) return track;
  return locale === "km" ? cat.titleKm : cat.titleEn;
}
