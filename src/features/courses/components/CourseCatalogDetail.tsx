"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Award,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  Home,
  Lock,
  SquarePlay,
  Star,
} from "lucide-react";
import { EnrollButton } from "./EnrollButton";
import { CourseReviewsSection } from "./CourseReviewsSection";
import { resolveMediaUrl } from "@/shared/lib/media";
import { useLocale } from "@/shared/i18n/locale-context";
import type { CatalogCourse, CatalogModule } from "@/features/learning/api/enrollment-api";

type Tab = "about" | "outcomes" | "courses" | "testimonials" | "reviews";

const PARTNERS = [
  { src: "/assets/partners/logoMOEYS.png", alt: "Ministry of Education" },
  { src: "/assets/partners/logoRUPP.png", alt: "Royal University of Phnom Penh" },
  { src: "/assets/partners/logoUME.png", alt: "University of Management and Economics" },
  { src: "/assets/partners/logoTechMentor.png", alt: "Tech Mentor" },
  { src: "/assets/partners/logoLSIH.png", alt: "Life Skills Innovation Hub" },
];

const TESTIMONIALS = [
  {
    name: "Sokha M.",
    avatar: "https://i.pravatar.cc/120?img=32",
    quote:
      "ម៉ូឌុល និងសំណួរសាកល្បងច្បាស់លាស់របស់ LSIH ជួយខ្ញុំរៀនជំនាញពិតប្រាកដ ខណៈតុល្យការងារ និងគ្រួសារ។",
  },
  {
    name: "Rithy C.",
    avatar: "https://i.pravatar.cc/120?img=11",
    quote:
      "ផ្លូវរៀនមានរចនាសម្ព័ន្ធជួយស្តារទំនុកចិត្តខ្ញុំឡើងវិញ។ មិនមែនតែរៀនទេ — គឺជឿថាខ្ញុំអាចបញ្ចប់ និងទទួលវិញ្ញាបនបត្រ។",
  },
  {
    name: "Dara L.",
    avatar: "https://i.pravatar.cc/120?img=5",
    quote:
      "ឥឡូវខ្ញុំត្រៀមខ្លួនកាន់តែច្រើនសម្រាប់តួនាទីជំនួយ IT ហើយបានអនុវត្តអ្វីដែលបានរៀនជាមួយក្រុមហើយ។",
  },
  {
    name: "Mey S.",
    avatar: "https://i.pravatar.cc/120?img=47",
    quote:
      "ការរៀនជាមួយ LSIH ពង្រីកជំនាញខ្ញុំតាមមេរៀនជាក់ស្តែង សំណួរសាកល្បង និងវិញ្ញាបនបត្រដែលអាចចែករំលែកជាមួយនិយោជក។",
  },
];

function formatDuration(
  minutes: number | null | undefined,
  t: (key: "course.durationHours" | "course.durationMinutes") => string,
) {
  if (!minutes || minutes <= 0) return null;
  if (minutes < 60) return t("course.durationMinutes").replace("{n}", String(minutes));
  const hours = Math.round((minutes / 60) * 10) / 10;
  return t("course.durationHours").replace("{n}", String(hours));
}

function moduleMinutes(module: CatalogModule) {
  return (module.lessons ?? []).reduce((sum, lesson) => sum + (lesson.duration_minutes ?? 0), 0);
}

function moduleIncludes(module: CatalogModule) {
  const lessons = module.lessons ?? [];
  return {
    videos: lessons.filter((lesson) => lesson.content_type === "video").length,
    readings: lessons.filter(
      (lesson) => lesson.content_type === "text" || lesson.content_type === "file",
    ).length,
    assignments: (module.quizzes ?? []).length,
  };
}

function learningPoints(course: CatalogCourse, modules: CatalogModule[], locale: "km" | "en") {
  const fromText = [course.description, course.short_description]
    .filter(Boolean)
    .join("\n")
    .split(/\n+|(?<=\.)\s+/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter((line) => line.length > 24 && line.length < 220);

  const unique = Array.from(new Set(fromText));
  if (unique.length >= 4) return unique.slice(0, 8);

  const fromModules = modules
    .map((module) => module.description?.trim() || module.title)
    .filter(Boolean) as string[];

  const extras =
    locale === "km"
      ? [
          "រៀនតាមម៉ូឌុល មេរៀន និងសំណួរសាកល្បងដែលមានរចនាសម្ព័ន្ធ។",
          "អនុវត្តជំនាញជាក់ស្តែងដែលអាចប្រើក្នុងការសិក្សា និងការងារ។",
          "ទទួលវិញ្ញាបនបត្រអេឡិចត្រូនិកពេលបញ្ចប់វគ្គ។",
          "រៀនតាមល្បឿនផ្ទាល់ខ្លួន នៅពេលណាក៏បាន។",
        ]
      : [
          "Follow a structured path of modules, lessons, and quizzes.",
          "Practice job-ready skills you can apply at school and work.",
          "Earn a shareable certificate when you complete the course.",
          "Learn at your own pace, on your own schedule.",
        ];

  return Array.from(new Set([...unique, ...fromModules, ...extras])).slice(0, 8);
}

function toolPills(modules: CatalogModule[], locale: "km" | "en") {
  const types = new Set((modules.flatMap((module) => module.lessons ?? [])).map((l) => l.content_type));
  const labels: string[] = [];
  if (types.has("video")) labels.push(locale === "km" ? "វីដេអូមេរៀន" : "Video lessons");
  if (types.has("file")) labels.push(locale === "km" ? "ឯកសារ PDF" : "PDF materials");
  if (types.has("text")) labels.push(locale === "km" ? "មេរៀនអត្ថបទ" : "Reading lessons");
  if (modules.some((module) => (module.quizzes ?? []).length > 0)) {
    labels.push(locale === "km" ? "សំណួរសាកល្បង" : "Quizzes");
  }
  labels.push(locale === "km" ? "វិញ្ញាបនបត្រ" : "Certificate");
  return labels;
}

function levelCopy(level: string | null | undefined, locale: "km" | "en") {
  if (level === "beginner") return locale === "km" ? "ថ្នាក់ដំបូង" : "Beginner level";
  if (level === "intermediate") return locale === "km" ? "ថ្នាក់មធ្យម" : "Intermediate level";
  if (level === "advanced") return locale === "km" ? "ថ្នាក់ខ្ពស់" : "Advanced level";
  return locale === "km" ? "គ្រប់កម្រិត" : "All levels";
}

const SECTION_IDS: Tab[] = ["about", "outcomes", "courses", "testimonials", "reviews"];

export function CourseCatalogDetail({ course }: { course: CatalogCourse }) {
  const { t, locale } = useLocale();
  const [tab, setTab] = useState<Tab>("about");
  const [openModules, setOpenModules] = useState<Set<string>>(() => {
    const first = course.modules?.[0];
    return new Set(first ? [String(first.id)] : []);
  });
  const [contentOpen, setContentOpen] = useState<Set<string>>(() => new Set());
  const [introOpen, setIntroOpen] = useState(false);
  const [compactNav, setCompactNav] = useState(false);
  const [pendingSection, setPendingSection] = useState<Tab | null>(null);

  const modules = course.modules ?? [];
  const lessonCount = modules.reduce((sum, module) => sum + (module.lessons?.length ?? 0), 0);
  const subjects = course.subjects ?? [];
  const cover = resolveMediaUrl(course.cover_image);
  const lecturerAvatar = resolveMediaUrl(course.lecturer?.avatar);
  const totalMinutes =
    course.duration_minutes && course.duration_minutes > 0
      ? course.duration_minutes
      : modules.reduce((sum, module) => sum + moduleMinutes(module), 0);
  const durationLabel = formatDuration(totalMinutes, t);
  const outcomes = useMemo(() => learningPoints(course, modules, locale), [course, modules, locale]);
  const descriptionText = (course.description || course.short_description || "").trim();
  const benefitPoints = outcomes.filter((item) => !descriptionText.includes(item));
  const tools = useMemo(() => toolPills(modules, locale), [modules, locale]);
  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "about", label: t("course.tabAbout") },
    { id: "outcomes", label: t("course.tabOutcomes") },
    { id: "courses", label: t("course.tabCourses") },
    { id: "testimonials", label: t("course.tabTestimonials") },
    { id: "reviews", label: t("course.tabReviews") },
  ];
  const careerPoints =
    locale === "km"
      ? [
          "ទទួលការបណ្តុះបណ្តាលជាក់ស្តែងពី LSIH",
          "បង្ហាញជំនាញតាមម៉ូឌុល មេរៀន និងសំណួរសាកល្បង",
          "ទទួលវិញ្ញាបនបត្រដែលអាចចែករំលែកបាន",
        ]
      : [
          "Receive practical training from LSIH",
          "Demonstrate your skills through modules, lessons, and quizzes",
          "Earn a shareable certificate when you finish",
        ];

  useEffect(() => {
    const hero = document.getElementById("course-hero");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCompactNav(!entry.isIntersecting),
      { threshold: 0.12, rootMargin: "-72px 0px 0px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const ratios = new Map<Tab, number>();
    const observers = SECTION_IDS.map((id) => {
      const el = document.getElementById(`course-${id}`);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          ratios.set(id, entry.intersectionRatio);
          let next: Tab = "about";
          let best = 0;
          ratios.forEach((ratio, key) => {
            if (ratio > best) {
              best = ratio;
              next = key;
            }
          });
          if (best > 0) setTab(next);
        },
        { rootMargin: "-28% 0px -58% 0px", threshold: [0, 0.12, 0.25, 0.4, 0.6, 0.85] },
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach((observer) => observer?.disconnect());
  }, []);

  function navOffset() {
    const headerH = document.querySelector("header")?.getBoundingClientRect().height ?? 64;
    const navH = document.querySelector("[data-course-nav]")?.getBoundingClientRect().height ?? 120;
    return headerH + navH + 24;
  }

  function goTo(id: Tab) {
    setTab(id);
    setCompactNav(true);
    setPendingSection(id);
  }

  useEffect(() => {
    if (!pendingSection) return;
    const el = document.getElementById(`course-${pendingSection}`);
    setPendingSection(null);
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top - navOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [pendingSection]);

  return (
    <main className="bg-white">
      <section
        id="course-hero"
        className="relative isolate flex min-h-[34rem] flex-col overflow-hidden bg-[#eef4fa] lg:min-h-[38rem]"
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-white" />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[50%] lg:block" aria-hidden>
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt=""
              className="h-full w-full object-cover object-[86%_center] opacity-55 [mask-image:linear-gradient(to_right,transparent,black_38%,black)]"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(ellipse_at_70%_40%,#b9d4f4_0%,transparent_58%),radial-gradient(ellipse_at_90%_80%,#9ec0ea_0%,transparent_50%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#eef4fa] via-[#eef4fa]/55 to-transparent" />
        </div>

        <nav
          aria-label="Breadcrumb"
          className="container-page relative z-20 flex items-center gap-2 overflow-x-auto whitespace-nowrap pt-6 pb-2 text-[0.8125rem] text-[#5b6b7c]"
        >
          <Link href="/" className="inline-flex shrink-0 items-center transition hover:text-[var(--brand)]" aria-label="Home">
            <Home className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#9aa8b6]" />
          <Link href="/courses" className="shrink-0 transition hover:text-[var(--brand)] hover:underline">
            {t("course.courses")}
          </Link>
          {subjects[0] ? (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#9aa8b6]" />
              <Link
                href={`/courses?subject_id=${encodeURIComponent(String(subjects[0].id))}`}
                className="shrink-0 transition hover:text-[var(--brand)] hover:underline"
              >
                {subjects[0].name}
              </Link>
            </>
          ) : null}
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#9aa8b6]" />
          <span className="shrink-0 text-[#3d4a5c]">{course.title}</span>
        </nav>

        <div className="container-page relative z-10 flex flex-1 items-center pb-14">
          <div className="max-w-xl space-y-5 lg:max-w-[34rem]">
            <h1 className="font-display text-[2.5rem] font-bold leading-[1.08] tracking-tight text-[var(--ink)] sm:text-[3.15rem]">
              {course.title}
            </h1>
            <div className="space-y-2 text-[0.98rem] leading-relaxed text-[#1f2a37]">
              <p>{course.short_description || course.description || t("course.noDescription")}</p>
              {course.description && course.short_description ? <p>{course.description}</p> : null}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-sm text-[#1f2a37]">
              <div className="flex flex-wrap items-center gap-2">
                {lecturerAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={lecturerAvatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-semibold text-white">
                    {(course.lecturer?.name ?? "L").slice(0, 1)}
                  </span>
                )}
                <span>
                  {t("course.instructors")}{" "}
                  <span className="font-semibold underline decoration-[var(--ink)]/50 underline-offset-2">
                    {course.lecturer?.name ?? t("course.instructorTba")}
                  </span>
                </span>
              </div>
              {durationLabel ? (
                <span className="inline-flex items-center gap-1.5 text-[#1f2a37]">
                  <Clock className="h-4 w-4 text-[var(--brand)]" strokeWidth={2} />
                  {t("course.approxDuration").replace("{n}", durationLabel)}
                </span>
              ) : null}
            </div>

            <div className="pt-2">
              <EnrollButton
                courseId={String(course.id)}
                slug={course.slug}
                title={course.title}
                price={course.price ?? 0}
                variant="hero"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container-page relative z-20 -mt-14">
        <div className="grid overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_2px_4px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)] sm:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.7fr_0.7fr_0.9fr]">
          <StatCell
            variant="featured"
            icon={
              <span className="flex items-center text-[#e2b13c]">
                <Award className="h-11 w-11 fill-[#f3d27a] text-[#e2b13c]" strokeWidth={1.4} />
                <Award className="h-11 w-11 -ml-2.5 fill-[#f3d27a] text-[#e2b13c]" strokeWidth={1.4} />
              </span>
            }
            title={t("course.moduleSeries").replace("{n}", String(modules.length))}
            hint={t("course.moduleSeriesHint")}
          />
          <StatCell variant="metric" title={durationLabel ?? "—"} hint={t("course.totalTime")} />
          <StatCell
            variant="metric"
            title={(course.enrollments_count ?? 0).toLocaleString()}
            hint={t("course.statEnrolled")}
          />
          <StatCell
            variant="metric"
            title={
              <span className="inline-flex items-center gap-1.5">
                {course.rating != null ? course.rating.toFixed(1) : "—"}
                <Star className="h-5 w-5 fill-[#1a1f2e] text-[#1a1f2e]" />
              </span>
            }
            hint={
              course.reviews_count
                ? t("course.statReviews").replace("{n}", String(course.reviews_count))
                : t("reviews.noRatings")
            }
          />
          <StatCell
            variant="label"
            title={
              <span className="inline-flex items-center gap-1.5">
                {levelCopy(course.level, locale)}
                <CircleHelp className="h-4 w-4 text-[#8b97a6]" strokeWidth={2} />
              </span>
            }
            hint={t("course.levelHint")}
            last
          />
        </div>
      </div>

      <div data-course-nav className="sticky top-16 z-30 mt-10 border-b border-[var(--line)] bg-white/95 backdrop-blur-sm">
        {compactNav ? (
          <div className="container-page flex items-center justify-between gap-4 py-3">
            <p className="truncate text-sm font-semibold text-[var(--ink)] sm:text-base">{course.title}</p>
            <EnrollButton
              courseId={String(course.id)}
              slug={course.slug}
              title={course.title}
              price={course.price ?? 0}
              variant="bar"
            />
          </div>
        ) : null}
        <div className="container-page flex gap-1 overflow-x-auto">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(item.id)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                tab === item.id
                  ? "border-[var(--brand)] text-[var(--brand)]"
                  : "border-transparent text-[#5b6b7c] hover:text-[var(--ink)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container-page space-y-16 py-10 sm:space-y-20 sm:py-14">
        <section id="course-about" className="scroll-mt-[12rem]">
          <AboutPanel
            outcomes={outcomes}
            skills={subjects.map((s) => s.name)}
            tools={tools}
            modules={modules.length}
            durationLabel={durationLabel}
            levelLabel={levelCopy(course.level, locale)}
            t={t}
          />
        </section>

        <section id="course-outcomes" className="scroll-mt-[12rem]">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(280px,420px)]">
            <div>
              <h2 className="mb-5 text-2xl font-semibold text-[var(--ink)]">{t("course.partnersTitle")}</h2>
              <ul className="space-y-3">
                {careerPoints.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-[var(--ink)]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ink)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {cover ? (
              <div className="relative overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt="" className="aspect-[16/10] w-full object-cover" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/40" />
              </div>
            ) : null}
          </div>
        </section>

        <section id="course-courses" className="scroll-mt-[12rem]">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div>
              <h2 className="text-[1.35rem] font-semibold text-[#1b1f24]">
                {t("course.thereAreModules").replace("{n}", String(modules.length))}
              </h2>
              <div className="mt-4 max-w-3xl space-y-3 text-[0.95rem] leading-7 text-[#3c4043]">
                {descriptionText ? (
                  <p className={introOpen ? "" : "line-clamp-3"}>
                    <span className="font-semibold text-[#1b1f24]">{t("course.descriptionLabel")} </span>
                    {descriptionText}
                  </p>
                ) : null}
                {benefitPoints.length > 0 ? (
                  <p className={introOpen ? "" : "line-clamp-2"}>
                    <span className="font-semibold text-[#1b1f24]">{t("course.benefitsLabel")} </span>
                    {introOpen ? benefitPoints.join(" ") : benefitPoints[0]}
                  </p>
                ) : null}
              </div>
              {descriptionText.length > 160 || benefitPoints.length > 1 ? (
                <button
                  type="button"
                  className="mt-2 text-sm font-semibold text-[var(--brand)]"
                  onClick={() => setIntroOpen((open) => !open)}
                >
                  {introOpen ? t("course.showLess") : t("course.showMore")}
                </button>
              ) : null}

              {modules.length === 0 ? (
                <p className="mt-8 rounded-xl border border-[var(--line)] p-6 text-[var(--muted)]">
                  {t("course.noModules")}
                </p>
              ) : (
                <div className="mt-8 space-y-1">
                  {modules.map((module, index) => {
                    const key = String(module.id);
                    const open = openModules.has(key);
                    const minutes = moduleMinutes(module);
                    const duration = formatDuration(minutes, t);
                    const includes = moduleIncludes(module);
                    const included: Array<{ icon: typeof SquarePlay; label: string }> = [];
                    if (includes.videos > 0) {
                      included.push({
                        icon: SquarePlay,
                        label: t(includes.videos === 1 ? "course.videoCount" : "course.videosCount").replace(
                          "{n}",
                          String(includes.videos),
                        ),
                      });
                    }
                    if (includes.readings > 0) {
                      included.push({
                        icon: FileText,
                        label: t(includes.readings === 1 ? "course.readingCount" : "course.readingsCount").replace(
                          "{n}",
                          String(includes.readings),
                        ),
                      });
                    }
                    if (includes.assignments > 0) {
                      included.push({
                        icon: ClipboardList,
                        label: t(
                          includes.assignments === 1 ? "course.assignmentCount" : "course.assignmentsCount",
                        ).replace("{n}", String(includes.assignments)),
                      });
                    }
                    const showingContent = contentOpen.has(key);
                    return (
                      <article
                        key={key}
                        className={open ? "rounded-lg border border-[#e6e8ec] bg-white px-5 py-5 sm:px-6" : "px-5 py-4"}
                      >
                        <button
                          type="button"
                          className="flex w-full items-start justify-between gap-4 text-left"
                          aria-expanded={open}
                          onClick={() =>
                            setOpenModules((current) => {
                              const next = new Set(current);
                              if (next.has(key)) next.delete(key);
                              else next.add(key);
                              return next;
                            })
                          }
                        >
                          <span className="text-[1.05rem] font-semibold text-[#1b1f24]">{module.title}</span>
                          <span className="inline-flex shrink-0 items-center gap-1 pt-0.5 text-sm font-semibold text-[var(--brand)]">
                            {open ? <span>{t("course.courseDetails")}</span> : null}
                            <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
                          </span>
                        </button>
                        <p className="mt-1 text-sm text-[#5f6368]">
                          {t("course.moduleLabel").replace("{n}", String(index + 1))}
                          {duration ? ` · ${t("course.toComplete").replace("{n}", duration)}` : ""}
                        </p>
                        {open ? (
                          <div className="mt-4 max-w-3xl">
                            {module.description ? (
                              <p className="text-sm leading-relaxed text-[#3c4043]">{module.description}</p>
                            ) : null}
                            {included.length > 0 ? (
                              <div className={module.description ? "mt-5" : ""}>
                                <p className="text-sm font-semibold text-[#1b1f24]">{t("course.whatsIncluded")}</p>
                                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                                  {included.map((item) => (
                                    <li key={item.label} className="inline-flex items-center gap-2 text-sm text-[#3c4043]">
                                      <item.icon className="h-4 w-4 text-[#5f6368]" strokeWidth={1.75} />
                                      {item.label}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                            <button
                              type="button"
                              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)]"
                              aria-expanded={showingContent}
                              onClick={() =>
                                setContentOpen((current) => {
                                  const next = new Set(current);
                                  if (next.has(key)) next.delete(key);
                                  else next.add(key);
                                  return next;
                                })
                              }
                            >
                              {showingContent ? t("course.hideModuleContent") : t("course.showModuleContent")}
                              <ChevronDown className={`h-4 w-4 transition ${showingContent ? "rotate-180" : ""}`} />
                            </button>
                            {showingContent ? (
                              <ModuleDetails module={module} price={course.price ?? 0} t={t} />
                            ) : null}
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eef4fb] text-[var(--brand)]">
                    <Award className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-[var(--ink)]">{t("course.earnCert")}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">{t("course.earnCertHint")}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eef4fb] text-[var(--brand)]">
                    <GraduationCap className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-[var(--ink)]">{t("course.shareableCert")}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">{t("course.shareableCertHint")}</p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="h-fit rounded-xl border border-[#e6e8ec] p-5 lg:sticky lg:top-44">
              <h3 className="text-base font-semibold text-[#1b1f24]">
                {locale === "km" ? "គ្រូបង្រៀន" : "Instructor"}
              </h3>
              {course.rating != null ? (
                <p className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-[#5f6368]">
                  <span>{t("course.instructorRatings")}</span>
                  <span className="font-semibold text-[#1b1f24]">{course.rating.toFixed(1)}</span>
                  <Star className="h-4 w-4 fill-[#1b1f24] text-[#1b1f24]" />
                  {course.reviews_count ? (
                    <span>({course.reviews_count.toLocaleString()})</span>
                  ) : null}
                </p>
              ) : null}
              <div className="mt-4 flex items-start gap-3">
                {lecturerAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={lecturerAvatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1b1f24] text-sm font-semibold text-white">
                    {(course.lecturer?.name ?? "L").slice(0, 1)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--brand)]">
                    {course.lecturer?.name ?? t("course.instructorTba")}
                  </p>
                  {course.lecturer?.title ? (
                    <p className="text-sm text-[#5f6368]">{course.lecturer.title}</p>
                  ) : null}
                  <p className="mt-1 text-sm text-[#5f6368]">
                    {t("course.learningModules").replace("{n}", String(modules.length))}
                    {course.enrollments_count
                      ? ` · ${t("course.learnersCount").replace("{n}", course.enrollments_count.toLocaleString())}`
                      : lessonCount
                        ? ` · ${t("course.lessonsCount").replace("{n}", String(lessonCount))}`
                        : ""}
                  </p>
                </div>
              </div>
              <div className="mt-5 border-t border-[#e6e8ec] pt-5">
                <h3 className="text-base font-semibold text-[#1b1f24]">{t("course.offeredBy")}</h3>
                <div className="mt-3 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/partners/logoLSIH.png" alt="" className="h-10 w-10 object-contain" />
                  <p className="text-sm font-semibold text-[var(--brand)]">Life Skills Innovation Hub</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section id="course-testimonials" className="scroll-mt-[12rem]">
          <h2 className="font-display text-2xl font-semibold text-[var(--ink)]">{t("course.whyChoose")}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((item) => (
              <article key={item.name} className="rounded-xl border border-[var(--line)] bg-white p-5">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <p className="font-semibold text-[var(--ink)]">{item.name}</p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">“{item.quote}”</p>
              </article>
            ))}
          </div>
        </section>

        <section id="course-reviews" className="scroll-mt-[12rem]">
          <CourseReviewsSection
            embedded
            courseSlug={course.slug}
            courseId={course.id}
            rating={course.rating}
            reviewsCount={course.reviews_count}
          />
        </section>
      </div>
    </main>
  );
}

function ModuleDetails({
  module,
  price,
  t,
}: {
  module: CatalogModule;
  price: number;
  t: ReturnType<typeof useLocale>["t"];
}) {
  const lessons = module.lessons ?? [];
  const quizzes = module.quizzes ?? [];
  const openLessons = lessons.filter((lesson) => !lesson.locked);
  const lockedLessons = lessons.filter((lesson) => lesson.locked);
  const openQuizzes = quizzes.filter((quiz) => !quiz.locked);
  const lockedQuizzes = quizzes.filter((quiz) => quiz.locked);

  return (
    <div className="mt-4 space-y-4 border-t border-[#e3e8ef] pt-4">
      {openLessons.length > 0 || openQuizzes.length > 0 ? (
        <div>
          <ul className="space-y-2.5">
            {openLessons.map((lesson) => (
              <li key={String(lesson.id)} className="flex items-start gap-3 text-sm leading-relaxed text-[var(--ink)]">
                <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.4} />
                <span>{lesson.title}</span>
              </li>
            ))}
            {openQuizzes.map((quiz) => (
              <li key={String(quiz.id)} className="flex items-start gap-3 text-sm leading-relaxed text-[var(--ink)]">
                <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.4} />
                <span>{t("course.quizLabel").replace("{title}", quiz.title)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {price > 0 && (lockedLessons.length > 0 || lockedQuizzes.length > 0) ? (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-[var(--ink)]">
            Unlock with ${price.toFixed(2)} for 1 month
          </h3>
          <ul className="space-y-3">
            {lockedLessons.map((lesson) => (
              <li key={String(lesson.id)} className="flex items-start gap-3 text-sm leading-relaxed text-[#6b7785]">
                <Lock className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.2} />
                <span>{lesson.title}</span>
              </li>
            ))}
            {lockedQuizzes.map((quiz) => (
              <li key={String(quiz.id)} className="flex items-start gap-3 text-sm leading-relaxed text-[#6b7785]">
                <Lock className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.2} />
                <span>{t("course.quizLabel").replace("{title}", quiz.title)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function StatCell({
  icon,
  title,
  hint,
  last,
  variant = "metric",
}: {
  icon?: ReactNode;
  title: ReactNode;
  hint: string;
  last?: boolean;
  variant?: "featured" | "metric" | "label";
}) {
  const titleClass =
    variant === "metric"
      ? "text-[1.65rem] font-bold leading-none tracking-tight text-[var(--ink)]"
      : "text-[1.05rem] font-bold leading-snug text-[var(--ink)]";

  if (variant === "featured") {
    return (
      <div className={`flex items-center gap-4 px-7 py-6 ${last ? "" : "lg:border-r lg:border-[#eceff3]"}`}>
        {icon ? <div className="shrink-0">{icon}</div> : null}
        <div className="min-w-0">
          <div className={titleClass}>{title}</div>
        </div>
        <p className="hidden min-w-0 flex-1 text-sm leading-snug text-[#6b7785] sm:block">{hint}</p>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 px-5 py-7 ${last ? "" : "lg:border-r lg:border-[#eceff3]"}`}>
      {icon ? <div className="shrink-0">{icon}</div> : null}
      <div className="min-w-0">
        <div className={titleClass}>{title}</div>
        <p className="mt-1.5 text-sm leading-snug text-[#6b7785]">{hint}</p>
      </div>
    </div>
  );
}

function AboutPanel({
  outcomes,
  skills,
  tools,
  modules,
  durationLabel,
  levelLabel,
  t,
}: {
  outcomes: string[];
  skills: string[];
  tools: string[];
  modules: number;
  durationLabel: string | null;
  levelLabel: string;
  t: ReturnType<typeof useLocale>["t"];
}) {
  const [showAllSkills, setShowAllSkills] = useState(false);
  const visibleSkills = showAllSkills ? skills : skills.slice(0, 8);

  return (
    <div className="max-w-5xl space-y-10">
      <div>
        <h2 className="mb-5 text-xl font-semibold text-[var(--ink)]">{t("course.whatYouLearn")}</h2>
        <ul className="grid gap-x-12 gap-y-4 sm:grid-cols-2">
          {outcomes.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-[var(--ink)]">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" strokeWidth={2.4} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {skills.length > 0 ? (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-[var(--ink)]">{t("course.skillsGain")}</h2>
          <div className="flex flex-wrap gap-2">
            {visibleSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-[#eef1f6] px-3.5 py-1.5 text-sm text-[#3d4a5c]"
              >
                {skill}
              </span>
            ))}
            {skills.length > 8 ? (
              <button
                type="button"
                className="text-sm font-semibold text-[var(--brand)]"
                onClick={() => setShowAllSkills((v) => !v)}
              >
                {showAllSkills ? "—" : t("course.showAll")}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="mb-4 text-xl font-semibold text-[var(--ink)]">{t("course.toolsLearn")}</h2>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <span key={tool} className="rounded-full bg-[#eef1f6] px-3.5 py-1.5 text-sm text-[#3d4a5c]">
              {tool}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-5 text-xl font-semibold text-[var(--ink)]">{t("course.detailsKnow")}</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <DetailItem
            icon={<BookOpen className="h-6 w-6" />}
            title={t("course.moduleSeries").replace("{n}", String(modules))}
            hint={t("course.moduleSeriesHint")}
          />
          <DetailItem
            icon={<BadgeCheck className="h-6 w-6" />}
            title={t("course.shareableCert")}
            hint={t("course.shareableCertHint")}
          />
          <DetailItem
            icon={<Award className="h-6 w-6" />}
            title={levelLabel}
            hint={t("course.levelHint")}
          />
          <DetailItem
            icon={<Clock className="h-6 w-6" />}
            title={durationLabel ? t("course.approxDuration").replace("{n}", durationLabel) : t("course.flexible")}
            hint={t("course.flexibleHint")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 rounded-xl border border-[var(--line)] px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="max-w-md text-xl font-semibold leading-snug text-[var(--ink)]">
          {t("course.partnersTitle")}
        </h3>
        <div className="flex flex-wrap items-center gap-6">
          {PARTNERS.map((partner) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={partner.src}
              src={partner.src}
              alt={partner.alt}
              className="h-9 w-auto object-contain opacity-80"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  title,
  hint,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="text-[var(--brand)]">{icon}</span>
      <div>
        <p className="font-semibold text-[var(--ink)]">{title}</p>
        <p className="mt-0.5 text-sm text-[var(--muted)]">{hint}</p>
      </div>
    </div>
  );
}
