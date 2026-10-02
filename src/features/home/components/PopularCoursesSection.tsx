"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  PopularCourseCard,
  type CatalogCourseCardModel,
} from "@/features/courses/components/PopularCourseCard";

type Props = {
  title: string;
  subtitle?: string;
  courses: CatalogCourseCardModel[];
};

const INITIAL_COUNT = 4;
const EXPAND_COUNT = 8;

export function PopularCoursesSection({ title, subtitle, courses }: Props) {
  const [expanded, setExpanded] = useState(false);
  const visibleCourses = expanded
    ? courses.slice(0, INITIAL_COUNT + EXPAND_COUNT)
    : courses.slice(0, INITIAL_COUNT);
  const canExpand = courses.length > INITIAL_COUNT && !expanded;

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-[1.75rem]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1.5 text-sm text-[var(--muted)] sm:text-[0.95rem]">{subtitle}</p>
          ) : null}
        </div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)] transition hover:gap-2.5"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No published courses yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 overflow-visible sm:grid-cols-2 lg:grid-cols-4">
          {visibleCourses.map((course) => (
            <PopularCourseCard key={String(course.id)} course={course} />
          ))}
        </div>
      )}

      {canExpand ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="rounded-full border-2 border-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-[var(--brand)] transition hover:bg-[var(--brand-soft)]"
        >
          Show 8 more
        </button>
      ) : null}
    </section>
  );
}
