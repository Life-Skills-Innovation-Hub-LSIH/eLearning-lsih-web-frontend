import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CatalogCourseCardModel } from "@/features/courses/components/PopularCourseCard";
import { getLevelLabel } from "@/shared/lib/course-labels";
import { resolveMediaUrl } from "@/shared/lib/media";

type Props = {
  title: string;
  href?: string;
  courses: CatalogCourseCardModel[];
};

function CourseRowCard({ course }: { course: CatalogCourseCardModel }) {
  const cover = resolveMediaUrl(course.cover_image);
  const provider = course.lecturer?.name?.trim() || "Life Skills Innovation Hub";
  const meta = getLevelLabel(course.level);

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex items-start gap-3 rounded-xl border border-[var(--line)] bg-white p-3 transition hover:border-[var(--brand)]/25 hover:shadow-[0_8px_20px_rgba(5,77,161,0.1)]"
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt=""
          className="h-14 w-14 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#054da1] to-[#0a6bc7] text-[10px] font-semibold text-white">
          LSIH
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <Image
            src="/logo.png"
            alt=""
            width={14}
            height={14}
            className="h-3.5 w-3.5 rounded-sm object-cover"
          />
          <p className="truncate text-[11px] text-[var(--muted)]">{provider}</p>
        </div>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-[var(--ink)] group-hover:text-[var(--brand)]">
          {course.title}
        </h3>
        <p className="mt-1 text-xs text-[var(--muted)]">{meta}</p>
      </div>
    </Link>
  );
}

export function CourseColumnsSection({ title, href = "/courses", courses }: Props) {
  const items = courses.slice(0, 9);
  if (items.length === 0) return null;

  return (
    <section className="container-page section-y">
      <div className="rounded-2xl bg-[#e9f2ff] p-4 sm:p-5 lg:p-6">
        <Link
          href={href}
          className="mb-4 inline-flex items-center gap-1.5 text-base font-semibold text-[var(--ink)] transition hover:text-[var(--brand)] sm:text-lg"
        >
          {title}
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </Link>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((course) => (
            <CourseRowCard key={String(course.id)} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
