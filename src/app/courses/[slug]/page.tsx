"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  Home,
  PlayCircle,
  UserRound,
} from "lucide-react";
import { EnrollButton } from "@/features/courses";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import { getLevelLabel } from "@/shared/lib/course-labels";
import { resolveMediaUrl } from "@/shared/lib/media";
import {
  fetchCatalogCourse,
  type CatalogCourse,
} from "@/features/learning/api/enrollment-api";

export default function CourseDetailsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [course, setCourse] = useState<CatalogCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError("");
    fetchCatalogCourse(slug)
      .then(setCourse)
      .catch((err) => {
        setCourse(null);
        setError(err instanceof Error ? err.message : "Course not found.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="container-page py-12">
        <PageLoader label="Loading course…" />
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="container-page py-12">
        <div className="surface max-w-lg space-y-4 p-8">
          <h1 className="font-display text-2xl text-[var(--ink)]">Course not found</h1>
          <p className="text-[var(--muted)]">{error || "This course is unavailable."}</p>
          <Link href="/courses" className="btn btn-primary">
            Back to catalog
          </Link>
        </div>
      </main>
    );
  }

  const modules = course.modules ?? [];
  const lessonCount = modules.reduce((sum, module) => sum + (module.lessons?.length ?? 0), 0);
  const quizCount = modules.reduce((sum, module) => sum + (module.quizzes?.length ?? 0), 0);
  const subjects = course.subjects ?? [];
  const cover = resolveMediaUrl(course.cover_image);

  return (
    <main className="bg-white">
      <section className="border-b border-[var(--line)] bg-white">
        <div className="container-page pt-5 pb-10 lg:pb-14 lg:pt-6">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center gap-1.5 text-[0.8125rem] leading-none text-[#5b6b7c]"
          >
            <Link
              href="/"
              className="inline-flex items-center text-[#5b6b7c] transition hover:text-[var(--brand)]"
              aria-label="Home"
            >
              <Home className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#9aa8b6]" strokeWidth={2} />
            <Link
              href="/courses"
              className="transition hover:text-[var(--brand)] hover:underline"
            >
              Courses
            </Link>
            {subjects[0] ? (
              <>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#9aa8b6]" strokeWidth={2} />
                <Link
                  href={`/courses?subject_id=${encodeURIComponent(String(subjects[0].id))}`}
                  className="transition hover:text-[var(--brand)] hover:underline"
                >
                  {subjects[0].name}
                </Link>
              </>
            ) : null}
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#9aa8b6]" strokeWidth={2} />
            <span className="max-w-[min(100%,28rem)] truncate text-[#5b6b7c]">
              {course.title}
            </span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--ink)] md:text-4xl">
              {course.title}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-[var(--muted)]">
              {course.short_description || course.description || "No description yet."}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
              <span className="inline-flex items-center gap-1.5 capitalize">
                <UserRound className="h-4 w-4 text-[var(--brand)]" />
                {course.lecturer?.name ?? "Instructor TBA"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-[var(--brand)]" />
                {getLevelLabel(course.level)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[var(--brand)]" />
                {modules.length} modules · {lessonCount} lessons
              </span>
            </div>

            {course.description && course.short_description ? (
              <div className="prose-sm max-w-2xl whitespace-pre-wrap text-[var(--ink)]/85">
                {course.description}
              </div>
            ) : null}
          </div>

          <aside className="surface sticky top-24 mx-auto w-full max-w-md space-y-5 p-6 lg:mx-0">
            <div className="h-44 overflow-hidden rounded-2xl bg-[var(--brand)]">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/80">
                  <BookOpen className="h-12 w-12" />
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-[var(--muted)]">Access with subscription</p>
              <p className="mt-1 text-3xl font-bold text-[var(--ink)]">
                {!course.price ? "Included" : `$${course.price}`}
              </p>
            </div>

            <ul className="space-y-2.5 text-sm text-[var(--muted)]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                {modules.length} learning modules
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                {lessonCount} video / PDF lessons
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                {quizCount} quizzes to pass
              </li>
              <li className="flex items-center gap-2">
                <Award className="h-4 w-4 text-[var(--accent-brand)]" />
                Certificate when you finish
              </li>
            </ul>

            <EnrollButton
              courseId={String(course.id)}
              slug={course.slug}
              price={course.price ?? 0}
            />

            <p className="text-center text-xs text-[var(--muted)]">
              Need access? Contact admin after you register.
            </p>
          </aside>
          </div>
        </div>
      </section>

      <section className="container-page space-y-6 py-10 sm:py-14">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--ink)]">Curriculum</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Follow modules in order. Complete lessons, then pass each quiz.
          </p>
        </div>

        {modules.length === 0 ? (
          <div className="surface p-8 text-[var(--muted)]">No published modules yet.</div>
        ) : (
          <div className="space-y-4">
            {modules.map((module, index) => (
              <section key={String(module.id)} className="surface overflow-hidden p-0">
                <div className="border-b border-[var(--line)] bg-[var(--brand-soft)]/50 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                    Module {index + 1}
                  </p>
                  <h3 className="mt-1 font-display text-xl text-[var(--ink)]">{module.title}</h3>
                  {module.description ? (
                    <p className="mt-1 text-sm text-[var(--muted)]">{module.description}</p>
                  ) : null}
                </div>
                <ul className="divide-y divide-[var(--line)]">
                  {(module.lessons ?? []).map((lesson) => (
                    <li
                      key={String(lesson.id)}
                      className="flex items-start gap-3 px-5 py-3.5 text-sm"
                    >
                      {lesson.content_type === "video" ? (
                        <PlayCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                      ) : lesson.content_type === "file" ? (
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                      ) : (
                        <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                      )}
                      <div>
                        <p className="font-medium text-[var(--ink)]">{lesson.title}</p>
                        <p className="text-[var(--muted)] capitalize">
                          {lesson.content_type === "file" ? "PDF" : lesson.content_type}
                          {lesson.duration_minutes ? ` · ${lesson.duration_minutes} min` : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                  {(module.quizzes ?? []).map((quiz) => (
                    <li
                      key={String(quiz.id)}
                      className="flex items-start gap-3 bg-[var(--brand-soft)]/30 px-5 py-3.5 text-sm"
                    >
                      <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-brand)]" />
                      <div>
                        <p className="font-medium text-[var(--ink)]">Quiz — {quiz.title}</p>
                        <p className="text-[var(--muted)]">Pass score {quiz.pass_score}%</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
