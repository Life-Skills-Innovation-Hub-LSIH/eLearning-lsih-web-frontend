"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  hasActiveSubscription,
  RequireAuth,
  subscriptionBlockedMessage,
  useAuth,
} from "@/features/auth";
import { QuizPanel } from "@/features/learning";
import { ProgressBar } from "@/shared/components/ui/ProgressBar";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import { ApiError } from "@/shared/api/client";
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

  const items = useMemo(() => {
    return modules.flatMap((module) => [
      ...(module.lessons ?? []).map((lesson) => ({
        key: `lesson-${lesson.id}`,
        label: lesson.title,
        meta: `${lesson.content_type === "file" ? "PDF" : lesson.content_type}${
          lesson.duration_minutes ? ` · ${lesson.duration_minutes}m` : ""
        }`,
        done: completedLessonIds.has(String(lesson.id)),
        select: () =>
          setSelection({ kind: "lesson", lesson, moduleTitle: module.title }),
      })),
      ...(module.quizzes ?? []).map((quiz) => ({
        key: `quiz-${quiz.id}`,
        label: `Quiz: ${quiz.title}`,
        meta: `Pass ${quiz.pass_score}%`,
        done: completedQuizIds.has(String(quiz.id)),
        select: () => setSelection({ kind: "quiz", quiz, moduleTitle: module.title }),
      })),
    ]);
  }, [modules, completedLessonIds, completedQuizIds]);

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
        <div className="surface max-w-xl space-y-4 p-6">
          <h1 className="font-display text-3xl">{courseTitle || "Course"}</h1>
          <p className="text-[var(--muted)]">
            Enroll to access lessons and quizzes.
          </p>
          {canEnroll ? (
            <button
              type="button"
              className="btn btn-primary"
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
            <div className="space-y-2">
              <button type="button" className="btn btn-secondary cursor-not-allowed opacity-70" disabled>
                Subscription required
              </button>
              <p className="text-sm text-[var(--muted)]">{subscriptionBlockedMessage(user)}</p>
            </div>
          )}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Link href="/courses" className="text-[var(--brand)]">
            Back to courses
          </Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container-page py-12">
        <p className="text-red-600">{error}</p>
        <Link href="/courses" className="text-[var(--brand)]">
          Back to courses
        </Link>
      </main>
    );
  }

  return (
    <main className="container-page grid gap-6 py-8 lg:grid-cols-[280px_1fr]">
      <aside className="surface h-fit p-4 lg:sticky lg:top-24">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
          Course player
        </p>
        <h1 className="mt-2 font-display text-xl leading-snug">{courseTitle}</h1>
        <div className="mt-4">
          <ProgressBar value={progress?.percent ?? 0} label="Progress" />
        </div>

        {certEligible ? (
          <button
            type="button"
            className="mt-4 w-full rounded-full bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            disabled={certDownloading}
            onClick={() => void onDownloadCertificate()}
          >
            {certDownloading ? "Preparing PDF…" : "Download certificate (PDF)"}
          </button>
        ) : (
          <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">
            Certificate unlocks when you finish all lessons and pass every quiz (usually 70%+).
          </p>
        )}
        {certError ? <p className="mt-2 text-xs text-red-600">{certError}</p> : null}

        <div className="mt-5 space-y-2">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={item.select}
              className="w-full rounded-xl px-3 py-2.5 text-left text-sm hover:bg-[var(--background)]"
            >
              <p className="font-medium text-[var(--ink)]">
                {item.done ? "✓ " : ""}
                {item.label}
              </p>
              <p className="text-[var(--muted)]">{item.meta}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="surface p-5 md:p-7">
        {!selection ? (
          <p className="text-[var(--muted)]">Select a lesson or quiz.</p>
        ) : selection.kind === "lesson" ? (
          <div className="space-y-5">
            <div>
              <p className="text-sm text-[var(--muted)]">{selection.moduleTitle}</p>
              <h2 className="mt-1 font-display text-3xl text-[var(--ink)]">
                {selection.lesson.title}
              </h2>
            </div>

            {selection.lesson.content_type === "video" && selection.lesson.media_url ? (
              <video
                key={String(selection.lesson.id)}
                controls
                className="aspect-video w-full rounded-2xl bg-black"
                src={selection.lesson.media_url}
              />
            ) : null}

            {selection.lesson.content_type === "file" && selection.lesson.media_url ? (
              <div className="space-y-3">
                <iframe
                  title={selection.lesson.title}
                  src={selection.lesson.media_url}
                  className="h-[70vh] w-full rounded-2xl border border-[var(--line)] bg-white"
                />
                <a
                  href={selection.lesson.media_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                >
                  Open PDF
                </a>
              </div>
            ) : null}

            {selection.lesson.body ? (
              <div className="text-sm text-[var(--ink)] whitespace-pre-wrap">
                {selection.lesson.body}
              </div>
            ) : null}

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
              {completedLessonIds.has(String(selection.lesson.id))
                ? "Lesson completed"
                : lessonSaving
                  ? "Saving…"
                  : "Mark lesson complete"}
            </button>
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
