import Link from "next/link";
import { Clock, Star } from "lucide-react";
import type { Course } from "@/shared/types";
import {
  getCourseDurationLabel,
  getLevelLabel,
} from "../data/mock-courses";

type Props = {
  course: Course;
};

function instructorInitials(name: string) {
  return name
    .replace(/^(Ms\.|Mr\.|Mrs\.|Dr\.)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function CourseCard({ course }: Props) {
  const priceLabel = course.price === 0 ? "Free" : `$${course.price}`;
  const learners =
    course.studentsCount >= 1000
      ? `${(course.studentsCount / 1000).toFixed(1)}K`
      : String(course.studentsCount);

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)] transition duration-300 hover:-translate-y-1 hover:border-[var(--brand)]/20 hover:shadow-[var(--shadow-hover)]"
    >
      <div
        className={`relative h-[168px] overflow-hidden bg-gradient-to-br ${course.thumbnailGradient}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.22),transparent_45%)]" />
        <div className="absolute inset-0 bg-black/10 transition duration-300 group-hover:bg-black/5" />
        <span className="absolute left-4 top-4 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--brand)] shadow-sm">
          {course.category}
        </span>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-medium text-white/90">
          <span className="rounded-md bg-black/25 px-2 py-1 backdrop-blur-sm">
            {getLevelLabel(course.level)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-black/25 px-2 py-1 backdrop-blur-sm">
            <Clock className="h-3.5 w-3.5" />
            {getCourseDurationLabel(course)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-display text-[0.95rem] font-semibold leading-snug text-[var(--ink)] transition group-hover:text-[var(--brand)] sm:text-base">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
          {course.shortDescription}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-[var(--line)] pt-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand)]">
              {instructorInitials(course.instructor)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--ink)]">
                {course.instructor}
              </p>
              <p className="text-xs text-[var(--muted)]">Instructor</p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p
              className={`text-sm font-bold ${
                course.price === 0 ? "text-[var(--success)]" : "text-[var(--brand)]"
              }`}
            >
              {priceLabel}
            </p>
            <p className="mt-0.5 inline-flex items-center justify-end gap-1 text-xs text-[var(--muted)]">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {course.rating.toFixed(1)} · {learners}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
