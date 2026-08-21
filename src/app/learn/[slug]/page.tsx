"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RequireAuth } from "@/features/auth";
import { QuizPanel } from "@/features/learning";
import { ProgressBar } from "@/shared/components/ui/ProgressBar";
import { useAuth } from "@/features/auth";
import { getCourseBySlug } from "@/features/courses";
import type { Lesson, Quiz } from "@/shared/types";

type Selection =
  | { kind: "lesson"; lesson: Lesson; moduleTitle: string }
  | { kind: "quiz"; quiz: Quiz; moduleTitle?: string };

export default function LearnPage() {
  return (
    <RequireAuth roles={["student"]}>
      <LearnContent />
    </RequireAuth>
  );
}

function LearnContent() {
  const params = useParams<{ slug: string }>();
  const course = getCourseBySlug(params.slug);
  const { isEnrolled, getProgress, markLessonComplete, markQuizComplete, enroll } = useAuth();

  const firstLesson = course?.modules[0]?.lessons[0] ?? null;
  const [selection, setSelection] = useState<Selection | null>(
    firstLesson
      ? { kind: "lesson", lesson: firstLesson, moduleTitle: course?.modules[0].title ?? "" }
      : null,
  );

  const progress = course ? getProgress(course.id) : null;
  const enrolled = course ? isEnrolled(course.id) : false;

  const items = useMemo(() => {
    if (!course) return [];
    return course.modules.flatMap((module) => [
      ...module.lessons.map((lesson) => ({
        key: lesson.id,
        label: lesson.title,
        meta: `${lesson.type.toUpperCase()} · ${lesson.durationMinutes}m`,
        select: () =>
          setSelection({ kind: "lesson", lesson, moduleTitle: module.title }),
        done: progress?.completedLessonIds.includes(lesson.id) ?? false,
      })),
      ...(module.quiz
        ? [
            {
              key: module.quiz.id,
              label: `Quiz: ${module.quiz.title}`,
              meta: "End of module",
              select: () =>
                setSelection({
                  kind: "quiz",
                  quiz: module.quiz!,
                  moduleTitle: module.title,
                }),
              done: progress?.completedQuizIds.includes(module.quiz.id) ?? false,
            },
          ]
        : []),
    ]);
  }, [course, progress]);

  if (!course || course.status !== "published") {
    return (
      <main className="container-page py-12">
        <p>Course not found.</p>
        <Link href="/courses" className="text-[var(--brand)]">
          Back to courses
        </Link>
      </main>
    );
  }

  if (!enrolled) {
    return (
      <main className="container-page py-12">
        <div className="surface max-w-xl space-y-4 p-6">
          <h1 className="font-display text-3xl">{course.title}</h1>
          <p className="text-[var(--muted)]">Enroll to access lessons and quizzes.</p>
          <button type="button" className="btn btn-primary" onClick={() => enroll(course.id)}>
            Enroll now (demo)
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container-page grid gap-6 py-8 lg:grid-cols-[280px_1fr]">
      <aside className="surface h-fit p-4 lg:sticky lg:top-24">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
          Course player
        </p>
        <h1 className="mt-2 font-display text-xl leading-snug">{course.title}</h1>
        <div className="mt-4">
          <ProgressBar value={progress?.percent ?? 0} label="Progress" />
        </div>

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

          {course.courseQuiz ? (
            <button
              type="button"
              onClick={() =>
                setSelection({ kind: "quiz", quiz: course.courseQuiz! })
              }
              className="w-full rounded-xl border border-dashed border-[var(--accent)]/40 px-3 py-2.5 text-left text-sm"
            >
              <p className="font-medium text-[var(--ink)]">
                {(progress?.completedQuizIds.includes(course.courseQuiz.id)
                  ? "✓ "
                  : "") + `Final: ${course.courseQuiz.title}`}
              </p>
              <p className="text-[var(--muted)]">End of course quiz</p>
            </button>
          ) : null}
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
              <p className="mt-2 text-[var(--muted)]">{selection.lesson.description}</p>
            </div>

            {selection.lesson.type === "video" ? (
              <video
                key={selection.lesson.id}
                controls
                className="aspect-video w-full rounded-2xl bg-black"
                src={selection.lesson.mediaUrl}
              />
            ) : (
              <div className="space-y-3">
                <iframe
                  title={selection.lesson.title}
                  src={selection.lesson.mediaUrl}
                  className="h-[70vh] w-full rounded-2xl border border-[var(--line)] bg-white"
                />
                <a
                  href={selection.lesson.mediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                >
                  Open PDF
                </a>
              </div>
            )}

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => markLessonComplete(course.id, selection.lesson.id)}
            >
              Mark lesson complete
            </button>
          </div>
        ) : (
          <QuizPanel
            quiz={selection.quiz}
            completed={progress?.completedQuizIds.includes(selection.quiz.id) ?? false}
            onPassed={() => markQuizComplete(course.id, selection.quiz.id)}
          />
        )}
      </section>
    </main>
  );
}
