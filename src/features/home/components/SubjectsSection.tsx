import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BookMarked,
  Brain,
  Cloud,
  Code2,
  Database,
  Laptop,
  Network,
  Shield,
  Sparkles,
} from "lucide-react";
import type { CatalogSubject } from "@/features/learning/api/enrollment-api";
import { resolveMediaUrl } from "@/shared/lib/media";

type Props = {
  subjects: CatalogSubject[];
};

function subjectIcon(name: string): LucideIcon {
  const key = name.toLowerCase();
  if (key.includes("artificial") || key.includes("ai")) return Sparkles;
  if (key.includes("cloud")) return Cloud;
  if (key.includes("cyber") || key.includes("security")) return Shield;
  if (key.includes("database") || key.includes("data")) return Database;
  if (key.includes("network")) return Network;
  if (key.includes("computer") || key.includes("software")) return Code2;
  if (key.includes("information") || key.includes("it ")) return Laptop;
  if (key.includes("brain")) return Brain;
  return BookMarked;
}

export function SubjectsSection({ subjects }: Props) {
  if (subjects.length === 0) return null;

  return (
    <section className="container-page pt-12 sm:pt-14">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-[1.75rem]">
        Explore categories
      </h2>

      <div className="mt-5 flex flex-wrap gap-3">
        {subjects.map((subject) => {
          const iconUrl = resolveMediaUrl(subject.icon);
          const Icon = subjectIcon(subject.name);

          return (
            <Link
              key={String(subject.id)}
              href={`/courses?subject_id=${encodeURIComponent(String(subject.id))}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#eef3f9] px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[#e2eaf4] hover:text-[var(--brand)]"
            >
              {iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={iconUrl}
                  alt=""
                  className="h-4 w-4 shrink-0 rounded-sm object-cover"
                />
              ) : (
                <Icon className="h-4 w-4 shrink-0 text-[var(--ink)]" strokeWidth={1.75} />
              )}
              <span>{subject.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
