"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { hasActiveSubscription, useAuth } from "@/features/auth";
import { BakongCheckoutDialog } from "@/features/learning/components/BakongCheckout";
import { startSubscriptionCheckout, type BakongCheckout } from "@/features/learning/api/enrollment-api";
import { ApiError } from "@/shared/api/client";
import { useLocale } from "@/shared/i18n/locale-context";

type Props = {
  courseId: string;
  slug: string;
  title?: string;
  price: number;
  variant?: "default" | "hero" | "bar";
};

export function EnrollButton({ courseId, slug, title, price, variant = "default" }: Props) {
  const { user, ready, token, isEnrolled, enroll, refreshUser } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkout, setCheckout] = useState<BakongCheckout | null>(null);
  const enrolled = isEnrolled(courseId);
  const subscribed = hasActiveSubscription(user);
  const isFree = price <= 0;
  const hero = variant === "hero";
  const bar = variant === "bar";
  const buttonClass = hero
    ? "btn btn-primary inline-flex min-h-[56px] min-w-[220px] flex-col items-center justify-center px-10 py-3 text-center !text-white"
    : bar
      ? "btn btn-primary inline-flex h-11 w-[13.5rem] shrink-0 items-center justify-center whitespace-nowrap px-5 !text-white"
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

  const payLabel = `Pay $${price.toFixed(2)} for 1 month`;

  return (
    <div className={bar ? "flex w-[13.5rem] shrink-0 flex-col items-stretch gap-1" : "flex w-fit flex-col items-start gap-2"}>
      <button
        type="button"
        className={buttonClass}
        disabled={loading}
        onClick={() => {
          setLoading(true);
          setError("");
          void startSubscriptionCheckout(token, courseId)
            .then((session) => {
              if ((session.status === "paid" || session.paid) && !session.id) {
                return refreshUser()
                  .then(() => enroll(courseId))
                  .then(() => router.push(`/learn/${slug}`));
              }
              setCheckout(session);
            })
            .catch(fail)
            .finally(() => setLoading(false));
        }}
      >
        {loading ? "Opening payment…" : payLabel}
        {hero && !loading ? (
          <span className="mt-0.5 text-xs font-normal text-white/90">
            Unlocks this course for 1 month
          </span>
        ) : null}
      </button>
      {error ? (
        <p className={`text-xs leading-snug text-red-600 ${bar ? "text-right" : ""}`}>{error}</p>
      ) : null}
      {checkout?.id ? (
        <BakongCheckoutDialog
          token={token}
          checkout={checkout}
          summary={{
            title: title || "Course access",
            listPrice: price,
            accessLabel: "1 month",
            included: [
              "Full course access for 1 month",
              "All lessons and quizzes",
              "Certificate included",
              "Scan with ABA or any banking app",
            ],
          }}
          onClose={() => setCheckout(null)}
          onRetry={() => startSubscriptionCheckout(token, courseId).then(setCheckout)}
          onApplyCoupon={(code) => startSubscriptionCheckout(token, courseId, code).then(setCheckout)}
          onPaid={() => {
            setCheckout(null);
            setLoading(true);
            void refreshUser()
              .then(() => enroll(courseId))
              .then(() => router.push(`/learn/${slug}`))
              .catch(fail)
              .finally(() => setLoading(false));
          }}
        />
      ) : null}
    </div>
  );
}
