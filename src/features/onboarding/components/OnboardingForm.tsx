"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Briefcase,
  Check,
  Compass,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { updateProfileWithApi } from "@/features/auth/api/auth-api";
import { useAuth } from "@/features/auth/context/auth-context";
import { loadToken } from "@/features/auth/lib/storage";
import { useLocale } from "@/shared/i18n/locale-context";
import type { OnboardingTrack } from "@/shared/types";
import { trackHref, type LearningTrackId } from "@/shared/lib/learning-tracks";
import {
  getOnboardingChoice,
  hasCompletedOnboarding,
  markOnboardingComplete,
} from "../lib/onboarding-storage";

const options: Array<{
  track: LearningTrackId;
  icon: LucideIcon;
  labelKey:
    | "onboarding.grade12"
    | "onboarding.leadership"
    | "onboarding.job"
    | "onboarding.life";
}> = [
  { track: "grade12", icon: GraduationCap, labelKey: "onboarding.grade12" },
  { track: "leadership", icon: Compass, labelKey: "onboarding.leadership" },
  { track: "job-ready", icon: Briefcase, labelKey: "onboarding.job" },
  { track: "life-skills", icon: Sparkles, labelKey: "onboarding.life" },
];

function redirectForCompletedChoice(choice: string | null | undefined) {
  if (choice && choice !== "skipped") {
    return trackHref(choice as LearningTrackId);
  }
  return "/courses";
}

function isCompleted(choice: string | null | undefined) {
  return Boolean(choice);
}

export function OnboardingForm() {
  const router = useRouter();
  const { user, ready, refreshUser } = useAuth();
  const { t, locale, toggleLocale } = useLocale();
  const [selected, setSelected] = useState<LearningTrackId | null>(null);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const serverChoice = user.onboardingTrack ?? null;
    const localChoice = getOnboardingChoice(user.id);
    if (isCompleted(serverChoice) || hasCompletedOnboarding(user.id)) {
      if (serverChoice && !localChoice) {
        markOnboardingComplete(user.id, serverChoice as LearningTrackId | "skipped");
      }
      router.replace(redirectForCompletedChoice(serverChoice ?? localChoice));
      return;
    }

    setChecking(false);
  }, [ready, user, router]);

  async function persistChoice(choice: OnboardingTrack) {
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      const token = loadToken();
      if (token) {
        await updateProfileWithApi(token, { onboardingTrack: choice });
        await refreshUser();
      }
      markOnboardingComplete(user.id, choice);
      router.push(redirectForCompletedChoice(choice));
    } catch (err) {
      markOnboardingComplete(user.id, choice);
      setError(err instanceof Error ? err.message : "Could not save preference.");
      router.push(redirectForCompletedChoice(choice));
    } finally {
      setSaving(false);
    }
  }

  function continueNext() {
    if (!selected || saving) return;
    void persistChoice(selected);
  }

  function skip() {
    if (saving) return;
    void persistChoice("skipped");
  }

  if (!ready || checking) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[linear-gradient(180deg,#e8f1fb_0%,#ffffff_45%,#ffffff_100%)]">
        <p className="text-sm text-[var(--muted)]">…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-svh flex-col bg-[linear-gradient(180deg,#e8f1fb_0%,#ffffff_45%,#ffffff_100%)]">
      <div className="container-page flex flex-1 flex-col py-10 sm:py-14">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/assets/logo-full.png"
              alt="LSIH"
              width={140}
              height={40}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <button
            type="button"
            onClick={toggleLocale}
            className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--brand)]/30 hover:bg-[var(--brand-soft)]"
          >
            {locale === "km" ? "EN" : "ខ្មែរ"}
          </button>
        </div>

        <div className="mx-auto w-full max-w-2xl flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
            {t("onboarding.eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
            {t("onboarding.title")}
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--muted)]">
            {t("onboarding.subtitle")}
          </p>

          <div className="mt-8 space-y-3">
            {options.map((option) => {
              const Icon = option.icon;
              const active = selected === option.track;
              return (
                <button
                  key={option.track}
                  type="button"
                  onClick={() => setSelected(option.track)}
                  disabled={saving}
                  className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition sm:px-5 ${
                    active
                      ? "border-[var(--brand)] bg-[var(--brand-soft)] shadow-[0_8px_24px_rgba(5,77,161,0.12)]"
                      : "border-[var(--line)] bg-white hover:border-[var(--brand)]/35 hover:bg-[var(--brand-soft)]/40"
                  }`}
                >
                  <span
                    className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl ${
                      active
                        ? "bg-[var(--brand)] text-white"
                        : "bg-[var(--brand-soft)] text-[var(--brand)]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1 text-base font-semibold text-[var(--ink)]">
                    {t(option.labelKey)}
                  </span>
                  <span
                    className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full border ${
                      active
                        ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                        : "border-[var(--line)] bg-white text-transparent"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                </button>
              );
            })}
          </div>

          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={continueNext}
              disabled={!selected || saving}
              className="btn btn-primary !rounded-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "…" : t("onboarding.continue")}
            </button>
            <button
              type="button"
              onClick={skip}
              disabled={saving}
              className="text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--brand)] disabled:opacity-50"
            >
              {t("onboarding.skip")}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
