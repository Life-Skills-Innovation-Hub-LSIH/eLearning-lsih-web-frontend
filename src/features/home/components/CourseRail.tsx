import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CourseCard } from "@/features/courses";
import type { Course } from "@/shared/types";

type Props = {
  title: string;
  subtitle?: string;
  courses: Course[];
};

export function CourseRail({ title, subtitle, courses }: Props) {
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

      <div className="scrollbar-hide -mx-1 flex gap-5 overflow-x-auto px-1 pb-3 pt-1">
        {courses.map((course) => (
          <div
            key={course.id}
            className="w-[260px] shrink-0 sm:w-[290px] md:w-[310px] lg:w-[320px]"
          >
            <CourseCard course={course} />
          </div>
        ))}
      </div>
    </section>
  );
}
