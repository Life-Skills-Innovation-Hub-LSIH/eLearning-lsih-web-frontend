"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CourseCard } from "@/features/courses";
import { getPublishedCourses } from "@/features/courses";

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");

  const courses = getPublishedCourses();
  const categories = ["all", ...Array.from(new Set(courses.map((c) => c.category)))];

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      const matchCategory = category === "all" || course.category === category;
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.shortDescription.toLowerCase().includes(q) ||
        course.instructor.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [courses, category, query]);

  return (
    <main>
      <section className="border-b border-[var(--line)] bg-white">
        <div className="container-page space-y-6 py-12 sm:py-14">
          <div className="max-w-2xl space-y-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
              Explore courses
            </h1>
            <p className="text-[var(--muted)] leading-relaxed">
              Browse by category or search. Each course includes modules, lessons, and quizzes.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className="input max-w-md"
              placeholder="Search courses..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="input max-w-xs appearance-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All categories" : item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((item) => {
              const active = category === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-[var(--brand)] text-white"
                      : "bg-[var(--brand-soft)] text-[var(--brand)] hover:bg-[var(--brand)]/15"
                  }`}
                >
                  {item === "all" ? "All" : item}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="container-page py-10 sm:py-12">
        <p className="mb-6 text-sm text-[var(--muted)]">
          {filtered.length} course{filtered.length === 1 ? "" : "s"}
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--line)] bg-white px-6 py-16 text-center text-[var(--muted)]">
            No courses match your search.
          </p>
        ) : null}
      </div>
    </main>
  );
}
