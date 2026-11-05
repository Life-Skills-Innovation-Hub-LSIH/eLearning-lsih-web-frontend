"use client";

import Link from "next/link";
import {
  BookOpen,
  CircleHelp,
  GraduationCap,
  KeyRound,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useLocale } from "@/shared/i18n/locale-context";

const sections = [
  { icon: Sparkles, titleKey: "help.s1.title", bodyKey: "help.s1.body" },
  { icon: KeyRound, titleKey: "help.s2.title", bodyKey: "help.s2.body" },
  { icon: BookOpen, titleKey: "help.s3.title", bodyKey: "help.s3.body" },
  { icon: GraduationCap, titleKey: "help.s4.title", bodyKey: "help.s4.body" },
  { icon: ShieldCheck, titleKey: "help.s5.title", bodyKey: "help.s5.body" },
  { icon: MessageCircle, titleKey: "help.s6.title", bodyKey: "help.s6.body" },
] as const;

export function HelpContent() {
  const { t } = useLocale();

  return (
    <main className="bg-white">
      <section className="border-b border-[var(--line)] bg-white">
        <div className="container-page py-12 sm:py-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] px-3 py-1 text-sm font-semibold text-[var(--brand)]">
            <CircleHelp className="h-4 w-4" />
            {t("help.badge")}
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
            {t("help.title")}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
            {t("help.subtitle")}
          </p>
        </div>
      </section>

      <section className="container-page space-y-4 py-10 sm:py-14">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <article
              key={section.titleKey}
              className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--ink)]">{t(section.titleKey)}</h2>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--muted)]">
                    {t(section.bodyKey)}
                  </p>
                </div>
              </div>
            </article>
          );
        })}

        <div className="flex flex-wrap gap-3 pt-4">
          <Link href="/contact" className="btn btn-primary">
            {t("help.contact")}
          </Link>
          <Link href="/courses" className="btn btn-secondary">
            {t("help.viewCourses")}
          </Link>
        </div>
      </section>
    </main>
  );
}
