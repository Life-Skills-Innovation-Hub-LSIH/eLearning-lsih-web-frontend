import Link from "next/link";
import { BookMarked } from "lucide-react";
import type { CatalogSubject } from "@/features/learning/api/enrollment-api";
import { resolveMediaUrl } from "@/shared/lib/media";

type Props = {
  subjects: CatalogSubject[];
};

export function SubjectsSection({ subjects }: Props) {
  if (subjects.length === 0) return null;

  return (
    <section className="container-page py-14 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-[1.75rem]">
            Subjects
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
            Browse by subject — then open courses that match what you want to learn.
          </p>
        </div>
        <Link href="/courses" className="text-sm font-semibold text-[var(--brand)] hover:underline">
          View all courses →
        </Link>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {subjects.map((subject) => {
          const iconUrl = resolveMediaUrl(subject.icon);
          const count = subject.courses_count ?? 0;

          return (
            <Link
              key={String(subject.id)}
              href={`/courses?subject_id=${encodeURIComponent(String(subject.id))}`}
              className="group rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] transition hover:-translate-y-1 hover:border-[var(--brand)]/25 hover:shadow-[var(--shadow-hover)]"
            >
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-[var(--brand)] text-white transition group-hover:bg-[var(--accent-brand)]">
                {iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={iconUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <BookMarked className="h-5 w-5" />
                )}
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-[var(--ink)]">
                {subject.name}
              </h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand)]">
                {count} course{count === 1 ? "" : "s"}
              </p>
              {subject.description?.trim() ? (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
                  {subject.description.trim()}
                </p>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  Explore published courses in this subject.
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
