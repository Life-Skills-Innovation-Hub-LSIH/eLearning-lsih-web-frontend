import Image from "next/image";
import Link from "next/link";
import type { Course } from "@/shared/types";
import { getLevelLabel } from "../data/mock-courses";

type Props = {
  course: Course;
};

export function PopularCourseCard({ course }: Props) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_4px_16px_rgba(15,23,42,0.08)] transition-transform duration-300 ease-in-out hover:z-10 hover:scale-[1.03] hover:shadow-[0_12px_28px_rgba(15,23,42,0.14)]"
    >
      <div className={`h-[132px] bg-gradient-to-br ${course.thumbnailGradient}`} />

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <div className="mb-2.5 flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Life Skills Innovation Hub"
            width={22}
            height={22}
            className="h-[22px] w-[22px] rounded-sm object-cover"
          />
          <p className="truncate text-xs text-[var(--muted)]">Life Skills Innovation Hub</p>
        </div>

        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-[var(--ink)] group-hover:text-[var(--brand)]">
          {course.title}
        </h3>

        <p className="mt-auto pt-3 text-xs text-[var(--muted)]">{getLevelLabel(course.level)}</p>
      </div>
    </Link>
  );
}
