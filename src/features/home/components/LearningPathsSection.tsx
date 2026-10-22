"use client";

import Link from "next/link";
import { Award, Briefcase, Flag, GraduationCap, type LucideIcon } from "lucide-react";
import { useLocale } from "@/shared/i18n/locale-context";
import { trackHref, type LearningTrackId } from "@/shared/lib/learning-tracks";

const paths: Array<{
  track: LearningTrackId;
  icon: LucideIcon;
  titleKm: string;
  titleEn: string;
  accent: string;
}> = [
  {
    track: "grade12",
    icon: GraduationCap,
    titleKm: "ប្រឡងបាក់ឌុប",
    titleEn: "Grade 12 Readiness",
    accent: "from-[#dbe7fb] to-[#c5d8f5]",
  },
  {
    track: "life-skills",
    icon: Award,
    titleKm: "ជំនាញជីវិត",
    titleEn: "Life Skills",
    accent: "from-[#e8e0f7] to-[#d4c8ef]",
  },
  {
    track: "leadership",
    icon: Flag,
    titleKm: "ភាពជាអ្នកដឹកនាំ",
    titleEn: "Leadership",
    accent: "from-[#dde9fb] to-[#c9daf3]",
  },
  {
    track: "job-ready",
    icon: Briefcase,
    titleKm: "ត្រៀមសម្រាប់ការងារ",
    titleEn: "Job Ready",
    accent: "from-[#e6e0f5] to-[#d2c6ec]",
  },
];

export function LearningPathsSection() {
  const { locale, t } = useLocale();

  return (
    <section className="container-page py-12 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-[1.75rem]">
            {t("paths.title")}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">{t("paths.subtitle")}</p>
        </div>
        <Link href="/courses" className="text-sm font-semibold text-[var(--brand)] hover:underline">
          {t("paths.viewAll")}
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {paths.map((path) => {
          const Icon = path.icon;
          return (
            <Link
              key={path.track}
              href={trackHref(path.track)}
              className="group relative flex min-h-[112px] items-center overflow-hidden rounded-2xl border border-[#e4e9f0] bg-[#f5f7fb] px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-300 ease-out hover:-translate-y-1 hover:border-[#d0d8e4] hover:bg-white hover:shadow-[0_14px_36px_rgba(15,23,42,0.14)]"
            >
              <h3 className="relative z-10 max-w-[58%] text-lg font-bold leading-snug tracking-tight text-[#1a1f2e] sm:text-[1.15rem]">
                {locale === "km" ? path.titleKm : path.titleEn}
              </h3>

              <div
                aria-hidden
                className={`absolute -right-2 top-1/2 h-[88px] w-[88px] -translate-y-1/2 rotate-12 rounded-2xl bg-gradient-to-br ${path.accent} opacity-90 transition duration-300 group-hover:scale-105`}
              />
              <div
                aria-hidden
                className="absolute right-4 top-1/2 flex size-14 -translate-y-1/2 items-center justify-center text-[var(--brand)] transition duration-300 group-hover:scale-110"
              >
                <Icon className="size-10 stroke-[1.5]" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
