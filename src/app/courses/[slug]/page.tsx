"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock, Users } from "lucide-react";
import { EnrollButton } from "@/features/courses";
import { PageLoader } from "@/shared/components/ui/PageLoader";
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
        <p className="text-red-600">{error || "Course not found."}</p>
        <Link href="/courses" className="text-[var(--brand)]">
          Back to courses
        </Link>
      </main>
    );
  }

  const modules = course.modules ?? [];
  const lessonCount = modules.reduce((sum, module) => sum + (module.lessons?.length ?? 0), 0);
  const quizCount = modules.reduce((sum, module) => sum + (module.quizzes?.length ?? 0), 0);

  return (
    <main className="bg-gray-50">
      <section className="bg-[#054DA1]/5">
        <div className="container-page grid gap-8 py-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4 text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-brand)]">
              {(course.subjects ?? []).map((s) => s.name).join(" · ") || "Course"}
            </p>
            <h1 className="text-3xl font-semibold text-[var(--brand)] md:text-4xl">
              {course.title}
            </h1>
            <p className="text-[var(--muted)]">
              {course.short_description || course.description || "No description yet."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--muted)] lg:justify-start">
              <span className="inline-flex items-center gap-1 capitalize">
                <Users className="h-4 w-4" />
                {course.level || "All levels"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {modules.length} modules
              </span>
            </div>
            <p className="text-sm text-[var(--muted)]">
              Instructor: {course.lecturer?.name ?? "TBA"}
            </p>
          </div>

          <div className="surface mx-auto w-full max-w-md space-y-4 p-6">
            <div className="h-40 overflow-hidden rounded-2xl bg-[var(--brand)]">
              {course.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={course.cover_image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Price</p>
              <p className="text-3xl font-bold text-[var(--ink)]">
                {!course.price ? "Free" : `$${course.price}`}
              </p>
            </div>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>{modules.length} modules</li>
              <li>{lessonCount} lessons</li>
              <li>{quizCount} quizzes</li>
            </ul>
            <EnrollButton
              courseId={String(course.id)}
              slug={course.slug}
              price={course.price ?? 0}
            />
          </div>
        </div>
      </section>

      <section className="container-page space-y-4 py-8">
        <h2 className="font-display text-2xl text-[var(--ink)]">Curriculum</h2>
        {modules.length === 0 ? (
          <p className="text-[var(--muted)]">No published modules yet.</p>
        ) : (
          modules.map((module) => (
            <section key={String(module.id)} className="surface p-5">
              <h3 className="font-display text-xl text-[var(--ink)]">{module.title}</h3>
              {module.description ? (
                <p className="mt-1 text-sm text-[var(--muted)]">{module.description}</p>
              ) : null}
              <ul className="mt-3 space-y-2">
                {(module.lessons ?? []).map((lesson) => (
                  <li
                    key={String(lesson.id)}
                    className="rounded-xl bg-[var(--background)] px-3 py-2.5 text-sm"
                  >
                    <p className="font-medium text-[var(--ink)]">{lesson.title}</p>
                    <p className="text-[var(--muted)] capitalize">
                      {lesson.content_type === "file" ? "PDF" : lesson.content_type}
                      {lesson.duration_minutes ? ` · ${lesson.duration_minutes} min` : ""}
                    </p>
                  </li>
                ))}
                {(module.quizzes ?? []).map((quiz) => (
                  <li
                    key={String(quiz.id)}
                    className="rounded-xl border border-dashed border-[var(--brand)]/30 px-3 py-2.5 text-sm"
                  >
                    <p className="font-medium text-[var(--brand)]">Quiz — {quiz.title}</p>
                    <p className="text-[var(--muted)]">Pass {quiz.pass_score}%</p>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </section>
    </main>
  );
}
