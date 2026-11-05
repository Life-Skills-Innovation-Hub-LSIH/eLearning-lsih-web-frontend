import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { resolveMediaUrl } from "@/shared/lib/media";
import type { CatalogCourse } from "@/features/learning/api/enrollment-api";

type Props = {
  course: CatalogCourse;
  ifYouLikeLabel: string;
  credentialsLabel: string;
};

export function ExploreCourseCard({
  course,
  ifYouLikeLabel,
  credentialsLabel,
}: Props) {
  const cover = resolveMediaUrl(course.cover_image);
  const subjects = course.subjects ?? [];
  const likeText =
    subjects.map((item) => item.name).filter(Boolean).slice(0, 3).join(", ") ||
    course.short_description;
  const lecturer = course.lecturer?.name?.trim();

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#e6e8eb] bg-white transition duration-200 hover:border-transparent hover:shadow-[0_8px_28px_rgba(15,23,42,0.12)]"
    >
      <div className="relative h-[188px] overflow-hidden bg-[#eef2f6]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-full w-full object-cover object-center" />
        ) : (
          <div className="flex h-full w-full items-end bg-[linear-gradient(160deg,#054da1,#0a6bc7)] p-4">
            <BookOpen className="h-8 w-8 text-white/80" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-5 pt-4">
        <h3 className="text-[1.125rem] font-medium leading-snug tracking-tight text-[#1a1a1a]">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#4b5563]">
          {course.short_description || course.description}
        </p>

        {likeText ? (
          <p className="mt-3 text-sm leading-relaxed text-[#1a1a1a]">
            <span className="font-medium">{ifYouLikeLabel}:</span>{" "}
            <span className="font-normal text-[#374151]">{likeText}</span>
          </p>
        ) : null}

        <div className="mt-auto pt-4">
          <p className="text-sm font-medium text-[#1a1a1a]">{credentialsLabel}</p>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-[var(--brand)]">
              <Image
                src="/logo.png"
                alt=""
                width={18}
                height={18}
                className="h-[18px] w-[18px] rounded-sm object-cover"
              />
              <span className="truncate group-hover:underline">
                {lecturer || "Life Skills Innovation Hub"}
              </span>
            </div>
            {subjects[0] ? (
              <div className="flex items-center gap-2 text-sm text-[var(--brand)]">
                <span className="inline-flex size-[18px] items-center justify-center rounded-sm bg-[var(--brand-soft)] text-[10px] font-medium text-[var(--brand)]">
                  {(subjects[0].name ?? "L").slice(0, 1)}
                </span>
                <span className="truncate group-hover:underline">{subjects[0].name}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
