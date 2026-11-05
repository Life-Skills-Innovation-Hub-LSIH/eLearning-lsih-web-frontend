"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  hasActiveSubscription,
  subscriptionBlockedMessage,
  useAuth,
} from "@/features/auth";
import { ApiError } from "@/shared/api/client";
import { useLocale } from "@/shared/i18n/locale-context";

type Props = {
  courseId: string;
  slug: string;
  price: number;
  variant?: "default" | "hero" | "bar";
};

export function EnrollButton({ courseId, slug, price, variant = "default" }: Props) {
  const { user, ready, token, isEnrolled, enroll } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const enrolled = isEnrolled(courseId);
  const canEnroll = hasActiveSubscription(user);
  const hero = variant === "hero";
  const bar = variant === "bar";
  const buttonClass = hero
    ? "btn btn-primary inline-flex min-h-[56px] min-w-[220px] flex-col items-center justify-center px-10 py-3 text-center !text-white"
    : bar
      ? "btn btn-primary inline-flex h-11 min-w-[180px] items-center justify-center px-6 !text-white"
      : "btn btn-primary w-full !text-white";

  if (!ready) {
    return <div className={`${buttonClass} opacity-60`}>…</div>;
  }

  if (!user) {
    return (
      <Link href="/register" className={buttonClass}>
        {t("course.enrollFree")}
        {hero ? (
          <span className="mt-0.5 text-xs font-normal text-white/90">{t("course.enrollSub")}</span>
        ) : null}
      </Link>
    );
  }

  if (user.role !== "student") {
    return (
      <Link href="/admin/courses" className={bar || hero ? `${buttonClass} bg-[var(--brand-strong)]` : "btn btn-secondary w-full"}>
        Manage in admin
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

  if (!canEnroll) {
    return (
      <div className="space-y-2">
        <button type="button" className={`${buttonClass} cursor-not-allowed opacity-70`} disabled>
          Subscription required
        </button>
        {variant === "default" ? (
          <p className="text-center text-xs text-[var(--muted)]">
            {subscriptionBlockedMessage(user)}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        className={buttonClass}
        disabled={loading || !token}
        onClick={() => {
          setLoading(true);
          setError("");
          void enroll(courseId)
            .then(() => router.push(`/learn/${slug}`))
            .catch((err) => {
              setError(
                err instanceof ApiError
                  ? err.message
                  : err instanceof Error
                    ? err.message
                    : "Failed to enroll.",
              );
            })
            .finally(() => setLoading(false));
        }}
      >
        {loading ? "Enrolling…" : price === 0 ? t("course.enrollFree") : "Enroll in course"}
        {hero && !loading ? (
          <span className="mt-0.5 text-xs font-normal text-white/90">{t("course.enrollSub")}</span>
        ) : null}
      </button>
      {error ? <p className="text-center text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
