"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import {
  fetchCatalogCourses,
  type CatalogCourse,
} from "@/features/learning/api/enrollment-api";

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchCatalogCourses()
      .then(setCourses)
      .catch((err) => {
        setCourses([]);
        setError(err instanceof Error ? err.message : "Failed to load courses.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((course) => {
      const haystack = [
        course.title,
        course.short_description ?? "",
        course.lecturer?.name ?? "",
        ...(course.subjects ?? []).map((s) => s.name),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [courses, query]);

  return (
    <main>
      <section className="border-b border-[var(--line)] bg-white">
        <div className="container-page space-y-6 py-12 sm:py-14">
          <div className="max-w-2xl space-y-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
              Explore courses
            </h1>
            <p className="text-[var(--muted)] leading-relaxed">
              Browse published courses. Enroll to track your lesson and quiz progress.
            </p>
          </div>

          <input
            className="input max-w-md"
            placeholder="Search courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </section>

      <section className="container-page py-10">
        {loading ? (
          <PageLoader label="Loading courses…" />
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-[var(--muted)]">No published courses found.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => (
              <Link
                key={String(course.id)}
                href={`/courses/${course.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)] transition hover:-translate-y-1"
              >
                <div className="relative h-[168px] overflow-hidden bg-[var(--brand)]">
                  {course.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.cover_image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-end p-4 text-white/90">
                      <span className="text-sm font-medium">{course.level ?? "Course"}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 font-display text-base font-semibold text-[var(--ink)] group-hover:text-[var(--brand)]">
                    {course.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                    {course.short_description || "No description"}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--line)] pt-4 text-sm">
                    <span className="truncate text-[var(--ink)]">
                      {course.lecturer?.name ?? "Instructor TBA"}
                    </span>
                    <span className="font-semibold text-[var(--brand)]">
                      {!course.price ? "Free" : `$${course.price}`}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
