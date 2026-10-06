"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, Search, SlidersHorizontal, X } from "lucide-react";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import { getLevelLabel } from "@/shared/lib/course-labels";
import { resolveMediaUrl } from "@/shared/lib/media";
import {
  fetchCatalogCourses,
  fetchCatalogSubjects,
  type CatalogCourse,
  type CatalogSubject,
} from "@/features/learning/api/enrollment-api";

const LEVEL_FILTERS = [
  { value: "all", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const subjectId = searchParams.get("subject_id") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [level, setLevel] = useState<string>("all");
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [subjects, setSubjects] = useState<CatalogSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeSubject = useMemo(
    () => subjects.find((item) => String(item.id) === subjectId) ?? null,
    [subjects, subjectId],
  );

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    fetchCatalogSubjects()
      .then(setSubjects)
      .catch(() => setSubjects([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchCatalogCourses(query.trim() || undefined, {
      subjectId: subjectId || undefined,
    })
      .then(setCourses)
      .catch((err) => {
        setCourses([]);
        setError(err instanceof Error ? err.message : "Failed to load courses.");
      })
      .finally(() => setLoading(false));
  }, [query, subjectId]);

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      if (level !== "all" && (course.level ?? "") !== level) return false;
      return true;
    });
  }, [courses, level]);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-[linear-gradient(135deg,#04356f_0%,#054da1_55%,#0a6bc7_100%)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 70% at 90% 20%, rgba(255,255,255,0.2), transparent 55%)",
          }}
        />
        <div className="container-page relative space-y-6 py-14 sm:py-16">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">
              Catalog
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {activeSubject ? activeSubject.name : "Explore courses"}
            </h1>
            <p className="text-base leading-relaxed text-white/80">
              {activeSubject?.description?.trim()
                ? activeSubject.description.trim()
                : "Browse published courses with modules, lessons, and quizzes. Enroll when your subscription is active."}
            </p>
          </div>

          <form
            className="flex max-w-xl flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              setQuery(String(form.get("q") ?? ""));
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                name="q"
                className="input border-0 bg-white pl-10 shadow-sm"
                placeholder="Search courses, subjects, instructors…"
                defaultValue={query}
              />
            </div>
            <button type="submit" className="btn btn-accent shrink-0">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-[var(--muted)]">
              {loading
                ? "Loading…"
                : `${filtered.length} course${filtered.length === 1 ? "" : "s"}`}
            </p>
            {activeSubject ? (
              <Link
                href="/courses"
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--ink)] shadow-sm hover:bg-[var(--brand-soft)]/40"
              >
                Subject: {activeSubject.name}
                <X className="h-3.5 w-3.5 text-[var(--muted)]" />
              </Link>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[var(--muted)]" />
            <select
              className="input !w-auto !py-2 text-sm"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              aria-label="Filter by level"
            >
              {LEVEL_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <PageLoader label="Loading courses…" />
        ) : error ? (
          <div className="surface p-8 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="surface flex flex-col items-center gap-3 p-12 text-center">
            <BookOpen className="h-10 w-10 text-[var(--brand)]/40" />
            <p className="font-display text-xl text-[var(--ink)]">No courses found</p>
            <p className="max-w-md text-sm text-[var(--muted)]">
              Try another search or clear the filters. New courses appear here when published.
            </p>
            <Link href="/courses" className="btn btn-secondary mt-2" onClick={() => setQuery("")}>
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => {
              const cover = resolveMediaUrl(course.cover_image);
              return (
                <Link
                  key={String(course.id)}
                  href={`/courses/${course.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)] transition duration-300 hover:-translate-y-1 hover:border-[var(--brand)]/25 hover:shadow-[var(--shadow-hover)]"
                >
                  <div className="relative h-[168px] overflow-hidden bg-[var(--brand)]">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full flex-col justify-between p-4 text-white/90">
                        <BookOpen className="h-8 w-8 opacity-70" />
                        <span className="text-sm font-medium">
                          {getLevelLabel(course.level)}
                        </span>
                      </div>
                    )}
                    {(course.subjects ?? [])[0] ? (
                      <span className="absolute top-3 left-3 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[var(--brand)] shadow-sm">
                        {(course.subjects ?? [])[0]?.name}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="line-clamp-2 font-display text-base font-semibold text-[var(--ink)] transition group-hover:text-[var(--brand)]">
                      {course.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
                      {course.short_description || "Open the course to see the full curriculum."}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--line)] pt-4 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--ink)]">
                          {course.lecturer?.name ?? "Instructor TBA"}
                        </p>
                        <p className="text-xs text-[var(--muted)] capitalize">
                          {getLevelLabel(course.level)}
                          {course.modules_count != null
                            ? ` · ${course.modules_count} modules`
                            : ""}
                        </p>
                      </div>
                      <span className="shrink-0 font-bold text-[var(--brand)]">
                        {!course.price ? "Free" : `$${course.price}`}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
