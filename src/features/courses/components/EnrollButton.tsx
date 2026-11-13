"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { hasActiveSubscription, useAuth } from "@/features/auth";
import { subscribeForMonth } from "@/features/learning/api/enrollment-api";
import { ApiError } from "@/shared/api/client";
import { useLocale } from "@/shared/i18n/locale-context";

type Props = {
  courseId: string;
  slug: string;
  price: number;
  variant?: "default" | "hero" | "bar";
};

export function EnrollButton({ courseId, slug, price, variant = "default" }: Props) {
  const { user, ready, token, isEnrolled, enroll, refreshUser } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const enrolled = isEnrolled(courseId);
  const subscribed = hasActiveSubscription(user);
  const isFree = price <= 0;
  const hero = variant === "hero";
  const bar = variant === "bar";
  const buttonClass = hero
    ? "btn btn-primary inline-flex min-h-[56px] min-w-[220px] flex-col items-center justify-center px-10 py-3 text-center !text-white"
    : bar
      ? "btn btn-primary inline-flex h-11 min-w-[180px] items-center justify-center px-6 !text-white"
      : "btn btn-primary w-full !text-white";

  function fail(err: unknown) {
    setError(
      err instanceof ApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Something went wrong.",
    );
  }

  if (!ready) {
    return <div className={`${buttonClass} opacity-60`}>…</div>;
  }

  if (!user || !token) {
    return (
      <Link href="/register" className={buttonClass}>
        {t("course.enrollFree")}
        {hero ? (
          <span className="mt-0.5 text-xs font-normal text-white/90">{t("course.enrollSub")}</span>
        ) : null}
      </Link>
    );
  }

  if (enrolled) {
    return (
      <Link href={`/learn/${slug}`} className={buttonClass}>
        Continue learning
      </Link>
    );
  }

  if (isFree || subscribed) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          className={buttonClass}
          disabled={loading}
          onClick={() => {
            setLoading(true);
            setError("");
            void enroll(courseId)
              .then(() => router.push(`/learn/${slug}`))
              .catch(fail)
              .finally(() => setLoading(false));
          }}
        >
          {loading ? "Enrolling…" : isFree ? t("course.enrollFree") : "Enroll in course"}
          {hero && !loading ? (
            <span className="mt-0.5 text-xs font-normal text-white/90">
              {isFree ? t("course.enrollSub") : "Included with your 1-month access"}
            </span>
          ) : null}
        </button>
        {error ? <p className="text-center text-xs text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={bar ? "shrink-0" : "flex w-fit flex-col items-start gap-2"}>
      <button
        type="button"
        className={buttonClass}
        disabled={loading}
        onClick={() => {
          setLoading(true);
          setError("");
          void subscribeForMonth(token)
            .then(() => refreshUser())
            .then(() => enroll(courseId))
            .then(() => router.push(`/learn/${slug}`))
            .catch(fail)
            .finally(() => setLoading(false));
        }}
      >
        {loading ? "Confirming payment…" : "Pay $1 for 1 month"}
        {hero && !loading ? (
          <span className="mt-0.5 text-xs font-normal text-white/90">
            Unlocks every paid course
          </span>
        ) : null}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
