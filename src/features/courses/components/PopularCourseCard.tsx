import Image from "next/image";
import Link from "next/link";
import { getLevelLabel } from "@/shared/lib/course-labels";
import { resolveMediaUrl } from "@/shared/lib/media";

export type CatalogCourseCardModel = {
  id: string | number;
  slug: string;
  title: string;
  level?: string | null;
  cover_image?: string | null;
  lecturer?: { id?: number | string; name: string } | null;
  subjects?: Array<{ id: number | string; name: string; slug?: string }>;
  modules_count?: number;
};

type Props = {
  course: CatalogCourseCardModel;
  compact?: boolean;
};

export function PopularCourseCard({ course, compact = false }: Props) {
  const cover = resolveMediaUrl(course.cover_image);
  const provider = course.lecturer?.name?.trim() || "Life Skills Innovation Hub";
  const metaParts = [
    getLevelLabel(course.level),
    course.modules_count != null
      ? `${course.modules_count} module${course.modules_count === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean);

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)]/80 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.08)] transition-all duration-300 ease-out will-change-transform hover:z-20 hover:-translate-y-2 hover:scale-[1.045] hover:border-transparent hover:shadow-[0_18px_42px_rgba(5,77,161,0.28)]"
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt=""
          className={`w-full object-cover ${compact ? "h-[148px]" : "h-[190px]"}`}
        />
      ) : (
        <div
          className={`flex items-end bg-gradient-to-br from-[#054da1] to-[#0a6bc7] p-4 ${
            compact ? "h-[148px]" : "h-[190px]"
          }`}
        >
          <span className="text-xs font-medium text-white/90">
            {getLevelLabel(course.level)}
          </span>
        </div>
      )}

      <div
        className={`flex min-h-[7.5rem] flex-1 flex-col ${
          compact ? "px-3.5 pb-4 pt-3.5" : "px-4 pb-5 pt-4"
        }`}
      >
        <div className="mb-2.5 flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Life Skills Innovation Hub"
            width={20}
            height={20}
            className="h-5 w-5 rounded-sm object-cover"
          />
          <p className="truncate text-xs text-[var(--muted)]">{provider}</p>
        </div>

        <h3
          className={`line-clamp-2 font-semibold leading-snug text-[var(--ink)] group-hover:text-[var(--brand)] ${
            compact ? "text-[14px]" : "text-[16px]"
          }`}
        >
          {course.title}
        </h3>

        <p className="mt-auto pt-4 text-xs text-[var(--muted)]">{metaParts.join(" · ")}</p>
      </div>
    </Link>
  );
}
