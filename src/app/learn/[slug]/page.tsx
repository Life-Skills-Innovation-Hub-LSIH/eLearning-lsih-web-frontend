"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  FileText,
  HelpCircle,
  Lock,
  MousePointerClick,
  PlayCircle,
} from "lucide-react";
import {
  hasActiveSubscription,
  RequireAuth,
  subscriptionBlockedMessage,
  useAuth,
} from "@/features/auth";
import { QuizPanel } from "@/features/learning";
import { LessonMediaPlayer } from "@/shared/components/ui/LessonMediaPlayer";
import { ProgressBar } from "@/shared/components/ui/ProgressBar";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import { ApiError } from "@/shared/api/client";
import { cn } from "@/lib/utils";
import {
  downloadCourseCertificatePdf,
  fetchCatalogCourse,
  fetchCertificateStatus,
  fetchLearnCourse,
  type CatalogLesson,
  type CatalogModule,
  type CatalogQuiz,
  type ProgressSummary,
} from "@/features/learning/api/enrollment-api";

type Selection =
  | { kind: "lesson"; lesson: CatalogLesson; moduleTitle: string }
  | { kind: "quiz"; quiz: CatalogQuiz; moduleTitle: string };

function selectionKey(selection: Selection | null): string | null {
  if (!selection) return null;
  if (selection.kind === "lesson") return `lesson-${selection.lesson.id}`;
  return `quiz-${selection.quiz.id}`;
}

export default function LearnPage() {
  return (
    <RequireAuth roles={["student"]}>
      <LearnContent />
    </RequireAuth>
  );
}

function LearnContent() {
  const params = useParams<{ slug: string }>();
  const {
    user,
    token,
    enroll,
    applyProgressSummary,
    markLessonComplete,
    markQuizComplete,
  } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsEnroll, setNeedsEnroll] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [modules, setModules] = useState<CatalogModule[]>([]);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [lessonSaving, setLessonSaving] = useState(false);
  const [certEligible, setCertEligible] = useState(false);
  const [certDownloading, setCertDownloading] = useState(false);
  const [certError, setCertError] = useState("");

  const activeKey = selectionKey(selection);

  async function refreshCertificate(slugOrId: string) {
    if (!token) {
      setCertEligible(false);
      return;
    }
    try {
      const status = await fetchCertificateStatus(token, slugOrId);
      setCertEligible(status.eligible);
    } catch {
      setCertEligible(false);
    }
  }

  async function load() {
    if (!token || !params.slug) {
      setLoading(false);
      setError("Please log in again.");
      return;
    }

    setLoading(true);
    setError("");
    setNeedsEnroll(false);
    try {
      const data = await fetchLearnCourse(token, params.slug);
      setCourseTitle(data.course.title);
      setCourseId(String(data.course.id));
      setModules(data.modules ?? []);
      setProgress(data.progress);
      applyProgressSummary(String(data.course.id), data.progress);
      setCertEligible(Boolean(data.enrollment?.certificate_eligible));
      void refreshCertificate(params.slug);

      const firstModule = data.modules?.[0];
      const firstLesson = firstModule?.lessons?.[0];
      if (firstLesson && firstModule) {
        setSelection({
          kind: "lesson",
          lesson: firstLesson,
          moduleTitle: firstModule.title,
        });
      } else {
        setSelection(null);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setNeedsEnroll(true);
        try {
          const catalog = await fetchCatalogCourse(params.slug);
          setCourseTitle(catalog.title);
          setCourseId(String(catalog.id));
        } catch {
          // ignore
        }
      } else {
        setError(err instanceof Error ? err.message : "Failed to load course.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, params.slug]);

  const completedLessonIds = useMemo(
    () => new Set((progress?.completed_lesson_ids ?? []).map(String)),
    [progress],
  );
  const completedQuizIds = useMemo(
    () => new Set((progress?.completed_quiz_ids ?? []).map(String)),
    [progress],
  );

  async function onDownloadCertificate() {
    if (!token || !params.slug) return;
    setCertDownloading(true);
    setCertError("");
    try {
      const status = await fetchCertificateStatus(token, params.slug);
      if (!status.eligible) {
        setCertEligible(false);
        throw new Error(
          "Complete all lessons and pass every quiz to unlock your certificate.",
        );
      }
      setCertEligible(true);
      await downloadCourseCertificatePdf(token, params.slug, courseTitle);
    } catch (err) {
      setCertError(err instanceof Error ? err.message : "Failed to download certificate.");
    } finally {
      setCertDownloading(false);
    }
  }

  if (loading) {
    return (
      <main className="container-page py-12">
        <PageLoader label="Loading course…" />
      </main>
    );
  }

  if (needsEnroll) {
    const canEnroll = hasActiveSubscription(user);
    return (
      <main className="container-page py-12">
        <div className="surface mx-auto max-w-xl space-y-6 p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <BookOpen className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
                Enrollment
              </p>
              <h1 className="font-display text-3xl leading-tight text-[var(--ink)]">
                {courseTitle || "Course"}
              </h1>
              <p className="text-[var(--muted)]">
                Enroll to unlock lessons, quizzes, and progress tracking for this course.
              </p>
            </div>
          </div>

          {canEnroll ? (
            <button
              type="button"
              className="btn btn-primary w-full sm:w-auto"
              disabled={enrolling || !courseId}
              onClick={() => {
                setEnrolling(true);
                setError("");
                void enroll(courseId)
                  .then(() => load())
                  .catch((err) =>
                    setError(err instanceof Error ? err.message : "Failed to enroll."),
                  )
                  .finally(() => setEnrolling(false));
              }}
            >
              {enrolling ? "Enrolling…" : "Enroll now"}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <p className="flex items-start gap-2 font-medium">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  Subscription required
                </p>
                <p className="mt-2 text-amber-900/90">{subscriptionBlockedMessage(user)}</p>
              </div>
              <button type="button" className="btn btn-secondary cursor-not-allowed opacity-70" disabled>
                Enroll when subscription is active
              </button>
            </div>
          )}

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 border-t border-[var(--line)] pt-5">
            <Link href={`/courses/${params.slug}`} className="btn btn-secondary">
              Course overview
            </Link>
            <Link href="/courses" className="text-sm font-semibold text-[var(--brand)] hover:underline">
              Back to catalog
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container-page py-12">
        <div className="surface mx-auto max-w-lg space-y-4 p-8">
          <h1 className="font-display text-2xl text-[var(--ink)]">Could not open course</h1>
          <p className="text-[var(--muted)]">{error}</p>
          <Link href="/courses" className="btn btn-primary">
            Back to courses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container-page grid gap-6 py-8 lg:grid-cols-[300px_1fr] lg:items-start">
      <aside className="surface flex h-fit max-h-[calc(100vh-7rem)] flex-col overflow-hidden lg:sticky lg:top-24">
        <div className="shrink-0 border-b border-[var(--line)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
            Course player
          </p>
          <h1 className="mt-2 font-display text-xl leading-snug text-[var(--ink)]">{courseTitle}</h1>
          <div className="mt-4">
            <ProgressBar value={progress?.percent ?? 0} label="Progress" />
          </div>

          {certEligible ? (
            <button
              type="button"
              className="btn btn-primary mt-4 w-full"
              disabled={certDownloading}
              onClick={() => void onDownloadCertificate()}
            >
              <Award className="h-4 w-4" aria-hidden />
              {certDownloading ? "Preparing PDF…" : "Download certificate"}
            </button>
          ) : (
            <p className="mt-4 rounded-xl bg-[var(--brand-soft)]/50 px-3 py-2.5 text-xs leading-relaxed text-[var(--muted)]">
              Finish all lessons and pass every quiz to unlock your certificate (usually 70%+).
            </p>
          )}
          {certError ? <p className="mt-2 text-xs text-red-600">{certError}</p> : null}
        </div>

        <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4" aria-label="Course contents">
          {modules.map((module) => {
            const lessons = module.lessons ?? [];
            const quizzes = module.quizzes ?? [];
            if (lessons.length === 0 && quizzes.length === 0) return null;

            return (
              <div key={String(module.id)}>
                <p className="mb-2 px-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  {module.title}
                </p>
                <ul className="space-y-1">
                  {lessons.map((lesson) => {
                    const key = `lesson-${lesson.id}`;
                    const active = activeKey === key;
                    const done = completedLessonIds.has(String(lesson.id));
                    const meta = `${lesson.content_type === "file" ? "PDF" : lesson.content_type}${
                      lesson.duration_minutes ? ` · ${lesson.duration_minutes}m` : ""
                    }`;

                    return (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() =>
                            setSelection({
                              kind: "lesson",
                              lesson,
                              moduleTitle: module.title,
                            })
                          }
                          className={cn(
                            "flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition",
                            active
                              ? "border-[var(--brand)]/40 bg-[var(--brand-soft)] shadow-sm ring-1 ring-[var(--brand)]/15"
                              : "border-transparent hover:border-[var(--line)] hover:bg-[var(--background)]",
                          )}
                          aria-current={active ? "true" : undefined}
                        >
                          <span className="mt-0.5 shrink-0 text-[var(--brand)]">
                            {done ? (
                              <CheckCircle2 className="h-4 w-4" aria-label="Completed" />
                            ) : lesson.content_type === "video" ? (
                              <PlayCircle className="h-4 w-4" aria-hidden />
                            ) : lesson.content_type === "file" ? (
                              <FileText className="h-4 w-4" aria-hidden />
                            ) : (
                              <BookOpen className="h-4 w-4" aria-hidden />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "block font-medium leading-snug",
                                active ? "text-[var(--brand-strong)]" : "text-[var(--ink)]",
                              )}
                            >
                              {lesson.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-[var(--muted)]">{meta}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                  {quizzes.map((quiz) => {
                    const key = `quiz-${quiz.id}`;
                    const active = activeKey === key;
                    const done = completedQuizIds.has(String(quiz.id));

                    return (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() =>
                            setSelection({ kind: "quiz", quiz, moduleTitle: module.title })
                          }
                          className={cn(
                            "flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition",
                            active
                              ? "border-[var(--brand)]/40 bg-[var(--brand-soft)] shadow-sm ring-1 ring-[var(--brand)]/15"
                              : "border-transparent hover:border-[var(--line)] hover:bg-[var(--background)]",
                          )}
                          aria-current={active ? "true" : undefined}
                        >
                          <span className="mt-0.5 shrink-0 text-[var(--brand)]">
                            {done ? (
                              <CheckCircle2 className="h-4 w-4" aria-label="Passed" />
                            ) : (
                              <HelpCircle className="h-4 w-4" aria-hidden />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "block font-medium leading-snug",
                                active ? "text-[var(--brand-strong)]" : "text-[var(--ink)]",
                              )}
                            >
                              Quiz: {quiz.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-[var(--muted)]">
                              Pass {quiz.pass_score}%
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>

      <section className="surface min-h-[420px] p-5 md:p-8">
        {!selection ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 px-4 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <MousePointerClick className="h-7 w-7" aria-hidden />
            </div>
            <div className="max-w-sm space-y-2">
              <h2 className="font-display text-xl text-[var(--ink)]">Choose a lesson or quiz</h2>
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                Pick an item from the course outline on the left to start learning.
              </p>
            </div>
          </div>
        ) : selection.kind === "lesson" ? (
          <div className="space-y-6">
            <header className="space-y-3 border-b border-[var(--line)] pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand)]">
                {selection.moduleTitle}
              </p>
              <div className="flex flex-wrap items-start gap-3">
                <h2 className="font-display text-3xl leading-tight text-[var(--ink)]">
                  {selection.lesson.title}
                </h2>
                <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold capitalize text-[var(--brand)]">
                  {selection.lesson.content_type === "file"
                    ? "PDF"
                    : selection.lesson.content_type}
                </span>
              </div>
            </header>

            {selection.lesson.content_type === "video" ||
            selection.lesson.content_type === "file" ? (
              <LessonMediaPlayer
                contentType={selection.lesson.content_type}
                mediaUrl={selection.lesson.media_url}
                title={selection.lesson.title}
              />
            ) : null}

            {selection.lesson.body ? (
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--background)]/60 px-5 py-4 text-base leading-relaxed text-[var(--ink)] whitespace-pre-wrap">
                {selection.lesson.body}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-5">
              <button
                type="button"
                className="btn btn-primary"
                disabled={
                  completedLessonIds.has(String(selection.lesson.id)) || lessonSaving
                }
                onClick={() => {
                  setLessonSaving(true);
                  void markLessonComplete(courseId, String(selection.lesson.id))
                    .then((next) => {
                      if (next) setProgress(next);
                      if (params.slug) void refreshCertificate(params.slug);
                    })
                    .finally(() => setLessonSaving(false));
                }}
              >
                {completedLessonIds.has(String(selection.lesson.id)) ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    Lesson completed
                  </>
                ) : lessonSaving ? (
                  "Saving…"
                ) : (
                  "Mark lesson complete"
                )}
              </button>
              {!completedLessonIds.has(String(selection.lesson.id)) ? (
                <p className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <Circle className="h-3 w-3" aria-hidden />
                  Mark complete when you finish this lesson
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <QuizPanel
            quiz={selection.quiz}
            completed={completedQuizIds.has(String(selection.quiz.id))}
            onSubmit={async (answers) => {
              const result = await markQuizComplete(
                courseId,
                String(selection.quiz.id),
                answers,
              );
              setProgress(result.progress);
              if (params.slug) void refreshCertificate(params.slug);
              return result;
            }}
          />
        )}
      </section>
    </main>
  );
}
