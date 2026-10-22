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
    "math",
    "គណិត",
    "khmer",
    "ខ្មែរ",
    "physics",
    "រូប",
    "chemistry",
    "គីមី",
    "biology",
    "ជីវ",
    "history",
    "ប្រវត្តិ",
    "english",
    "អង់គ្លេស",
    "exam",
    "ប្រឡង",
  ],
  "life-skills": [
    "life skill",
    "ជំនាញ",
    "critical",
    "problem",
    "financial",
    "ហិរញ្ញ",
    "budget",
    "time management",
    "ពេលវេលា",
    "conflict",
    "emotion",
    "អារម្មណ៍",
    "confidence",
    "ទំនុកចិត្ត",
    "goal",
  ],
  leadership: [
    "leadership",
    "ដឹកនាំ",
    "public speaking",
    "និយាយសាធារណៈ",
    "teamwork",
    "ក្រុម",
    "project",
    "គម្រោង",
    "empathy",
    "យល់ចិត្ត",
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
    "communication",
    "ទាក់ទង",
    "digital",
    "office",
    "email",
  ],
};

export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  {
    track: "grade12",
    titleKm: "ប្រឡងបាក់ឌុប",
    titleEn: "Grade 12 Exam Readiness",
    items: [
      { labelKm: "មុខវិជ្ជា គណិតវិទ្យា", labelEn: "Mathematics", q: "math" },
      { labelKm: "មុខវិជ្ជា ភាសាខ្មែរ", labelEn: "Khmer Literature", q: "khmer" },
      { labelKm: "មុខវិជ្ជា គីមីវិទ្យា", labelEn: "Chemistry", q: "chemistry" },
      { labelKm: "មុខវិជ្ជា រូបវិទ្យា", labelEn: "Physics", q: "physics" },
      { labelKm: "មុខវិជ្ជា ជីវវិទ្យា", labelEn: "Biology", q: "biology" },
      { labelKm: "មុខវិជ្ជា ប្រវត្តិវិទ្យា", labelEn: "History", q: "history" },
      { labelKm: "មុខវិជ្ជា អង់គ្លេស", labelEn: "English", q: "english" },
    ],
  },
  {
    track: "life-skills",
    titleKm: "ជំនាញជីវិត",
    titleEn: "Life Skills",
    items: [
      {
        labelKm: "ការគិត និងដោះស្រាយបញ្ហា",
        labelEn: "Critical thinking & problem-solving",
        q: "problem-solving",
      },
      {
        labelKm: "ចំណេះដឹងហិរញ្ញវត្ថុ",
        labelEn: "Financial literacy",
        q: "financial",
      },
      {
        labelKm: "ការគ្រប់គ្រងពេលវេលា",
        labelEn: "Time management",
        q: "time management",
      },
      {
        labelKm: "ដំណោះស្រាយជម្លោះ និងបញ្ញាស្មារតីអារម្មណ៍",
        labelEn: "Conflict resolution & EQ",
        q: "emotional",
      },
      {
        labelKm: "ទំនុកចិត្តខ្លួនឯង និងរៀបចំគោលដៅជីវិត",
        labelEn: "Self-confidence & goal setting",
        q: "confidence",
      },
    ],
  },
  {
    track: "leadership",
    titleKm: "ភាពជាអ្នកដឹកនាំ",
    titleEn: "Leadership",
    items: [
      {
        labelKm: "ការនិយាយសាធារណៈ",
        labelEn: "Public speaking",
        q: "public speaking",
      },
      {
        labelKm: "ការងារក្រុម និងគ្រប់គ្រងគម្រោង",
        labelEn: "Teamwork & project management",
        q: "teamwork",
      },
      {
        labelKm: "ភាពជាអ្នកដឹកនាំផ្ទាល់ខ្លួន",
        labelEn: "Personal leadership",
        q: "leadership",
      },
      {
        labelKm: "ដឹកនាំដោយការយល់ចិត្ត និងតម្លៃ",
        labelEn: "Leading with empathy and values",
        q: "empathy",
      },
    ],
  },
  {
    track: "job-ready",
    titleKm: "ត្រៀមសម្រាប់ការងារ",
    titleEn: "Job Readiness",
    items: [
      {
        labelKm: "ការសរសេរប្រវត្តិរូបសង្ខេប",
        labelEn: "Resume & cover letter",
        q: "resume",
      },
      {
        labelKm: "ត្រៀមក្នុងកិច្ចសម្ភាសន៍",
        labelEn: "Interview prep",
        q: "interview",
      },
      {
        labelKm: "កន្លែងប្រាស្រ័យទាក់ទង",
        labelEn: "Workplace communication",
        q: "communication",
      },
      {
        labelKm: "អក្ខរកម្មឌីជីថល (email, MS Office, etc.)",
        labelEn: "Digital literacy",
        q: "digital",
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
