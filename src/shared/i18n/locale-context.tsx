"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "km" | "en";

type Dictionary = Record<string, { km: string; en: string }>;

const dict: Dictionary = {
  "nav.explore": { km: "ស្វែងរក", en: "Explore" },
  "nav.myCourses": { km: "វគ្គសិក្សារខ្ញុំ", en: "My courses" },
  "nav.login": { km: "ចូលគណនី", en: "Log in" },
  "nav.joinFree": { km: "រៀនឥតគិតថ្លៃ", en: "Start learning free" },
  "nav.logout": { km: "ចាកចេញ", en: "Log out" },
  "nav.help": { km: "ជំនួយ", en: "Help" },
  "nav.viewAllCourses": { km: "មើលវគ្គសិក្សាទាំងអស់ →", en: "View all courses →" },
  "search.placeholder": { km: "តើអ្នកចង់រៀនអ្វី?", en: "What do you want to learn?" },
  "hero.tagline": {
    km: "រៀនសម្រាប់សាលា។ លូតលាស់សម្រាប់ជីវិត។",
    en: "Learn for School. Grow for Life.",
  },
  "hero.subtitle": {
    km: "វគ្គសិក្សាជាក់ស្តែងសម្រាប់ប្រឡងបាក់ឌុប ជំនាញជីវិត ភាពជាអ្នកដឹកនាំ និងត្រៀមការងារ។",
    en: "Practical courses for Grade 12 exams, life skills, leadership, and job readiness.",
  },
  "hero.ctaStart": { km: "ចាប់ផ្តើមរៀនឥតគិតថ្លៃ", en: "Start learning free" },
  "hero.ctaGrade12": { km: "មើលវគ្គបាក់ឌុប", en: "Browse Grade 12 courses" },
  "paths.title": { km: "ផ្លូវសិក្សាពេញនិយម", en: "Popular learning tracks" },
  "paths.subtitle": {
    km: "Grade 12 Readiness · Life Skills · Leadership · Job Ready",
    en: "Grade 12 Readiness · Life Skills · Leadership · Job Ready",
  },
  "paths.viewAll": { km: "មើលវគ្គទាំងអស់ →", en: "View all courses →" },
  "paths.grade12.sub": { km: "ត្រៀមប្រឡង", en: "Bac II prep" },
  "paths.grade12.text": {
    km: "គណិត ខ្មែរ វិទ្យាសាស្ត្រ ប្រវត្តិ និងអង់គ្លេស — មេរៀន និងយុទ្ធសាស្ត្រប្រឡង។",
    en: "Math, Khmer, science, history, and English — lessons, mocks, and exam strategies.",
  },
  "paths.life.sub": { km: "ជំនាញជីវិត", en: "Life skills" },
  "paths.life.text": {
    km: "ការគិតដោះស្រាយបញ្ហា ហិរញ្ញវត្ថុ ពេលវេលា អារម្មណ៍ និងទំនុកចិត្ត។",
    en: "Problem-solving, money skills, time management, EQ, and confidence.",
  },
  "paths.lead.sub": { km: "ភាពជាអ្នកដឹកនាំ", en: "Leadership" },
  "paths.lead.text": {
    km: "និយាយសាធារណៈ ការងារក្រុម គម្រោង និងដឹកនាំដោយតម្លៃ។",
    en: "Public speaking, teamwork, projects, and values-based leadership.",
  },
  "paths.job.sub": { km: "ត្រៀមការងារ", en: "Job ready" },
  "paths.job.text": {
    km: "CV សម្ភាសន៍ ទំនាក់ទំនងកន្លែងធ្វើការ និងអក្ខរកម្មឌីជីថល។",
    en: "CV writing, interviews, workplace communication, and digital literacy.",
  },
  "catalog.title": { km: "រុករកវគ្គសិក្សា", en: "Explore courses" },
  "catalog.track": { km: "ផ្លូវសិក្សា", en: "Learning track" },
  "onboarding.eyebrow": { km: "ស្វាគមន៍មកកាន់ LSIH", en: "Welcome to LSIH" },
  "onboarding.title": { km: "តើអ្នកកំពុងស្វែងរកអ្វី?", en: "What are you looking for?" },
  "onboarding.subtitle": {
    km: "ជ្រើសមួយ ដើម្បីឲ្យយើងណែនាំផ្លូវសិក្សា និងវគ្គសមស្រប។",
    en: "Pick one so we can recommend the right learning track and courses.",
  },
  "onboarding.grade12": {
    km: "ខ្ញុំកំពុងត្រៀមប្រឡងបាក់ឌុប",
    en: "I’m preparing for the Grade 12 exam",
  },
  "onboarding.leadership": {
    km: "ខ្ញុំចង់ពង្រឹងភាពជាអ្នកដឹកនាំ",
    en: "I want to improve my leadership",
  },
  "onboarding.job": {
    km: "ខ្ញុំត្រូវការជំនាញត្រៀមការងារ",
    en: "I need job readiness skills",
  },
  "onboarding.life": {
    km: "ខ្ញុំចង់រៀនជំនាញជីវិត",
    en: "I want to learn life skills",
  },
  "onboarding.continue": { km: "បន្តមើលវគ្គសិក្សា", en: "Continue to courses" },
  "onboarding.skip": { km: "រំលងសម្រាប់ពេលនេះ", en: "Skip for now" },
};

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: keyof typeof dict) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const STORAGE_KEY = "lsih-locale";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("km");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "km" || saved === "en") setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "km" ? "en" : "km");
  }, [locale, setLocale]);

  const t = useCallback(
    (key: keyof typeof dict) => dict[key]?.[locale] ?? String(key),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
