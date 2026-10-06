"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  PopularCourseCard,
  type CatalogCourseCardModel,
} from "@/features/courses/components/PopularCourseCard";

export type FeaturedCourse = CatalogCourseCardModel & {
  subjects?: Array<{ id: number | string; name: string; slug?: string }>;
  lecturer?: { id?: number | string; name: string } | null;
  modules_count?: number;
};

type Props = {
  courses: FeaturedCourse[];
};

export function FeaturedProgramsBanner({ courses }: Props) {
  const [activeSubjectId, setActiveSubjectId] = useState<string>("all");

  const subjectTabs = useMemo(() => {
    const map = new Map<string, string>();
    for (const course of courses) {
      for (const subject of course.subjects ?? []) {
        map.set(String(subject.id), subject.name);
      }
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .slice(0, 4);
  }, [courses]);

  const filtered = useMemo(() => {
    if (activeSubjectId === "all") return courses;
    return courses.filter((course) =>
      (course.subjects ?? []).some((subject) => String(subject.id) === activeSubjectId),
    );
  }, [courses, activeSubjectId]);

  if (courses.length === 0) return null;

  return (
    <section className="container-page py-10 sm:py-12">
      <div
        className="font-khmer overflow-x-clip rounded-[1.75rem] p-5 sm:p-7 lg:overflow-visible lg:p-8"
        style={{
          background:
            "linear-gradient(105deg, #043d80 0%, #054da1 38%, #2f7fd4 68%, #9ec5ef 100%)",
        }}
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] lg:items-start lg:gap-10">
          <div className="flex flex-col justify-center pt-1 lg:min-h-[280px] lg:pt-2">
            <h2 className="text-2xl font-semibold leading-tight tracking-tight text-white sm:text-[1.75rem]">
              Skills for the work you do — and the career you want
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/85">
              Browse structured courses with modules, lessons, and quizzes. Filter by subject and
              start learning with LSIH.
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--brand)] shadow-sm transition hover:bg-white/95 hover:gap-2.5"
            >
              Explore courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="min-w-0 space-y-4">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setActiveSubjectId("all")}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  activeSubjectId === "all"
                    ? "bg-[var(--ink)] text-white"
                    : "border border-white/70 bg-white text-[var(--ink)] hover:border-white"
                }`}
              >
                All
              </button>
              {subjectTabs.map((tab) => {
                const active = activeSubjectId === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSubjectId(tab.id)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                      active
                        ? "bg-[var(--ink)] text-white"
                        : "border border-white/70 bg-white text-[var(--ink)] hover:border-white"
                    }`}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 ? (
              <p className="rounded-2xl bg-white/15 px-4 py-8 text-center text-sm text-white/90">
                No courses in this subject yet.
              </p>
            ) : (
              <div className="-mx-1 flex gap-4 overflow-x-auto px-1 py-3 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
                {filtered.slice(0, 4).map((course) => (
                  <div
                    key={String(course.id)}
                    className="w-[220px] shrink-0 sm:w-[240px] lg:w-auto"
                  >
                    <PopularCourseCard course={course} compact />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
