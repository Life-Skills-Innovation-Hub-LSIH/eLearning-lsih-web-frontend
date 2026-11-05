"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/features/auth/context/auth-context";
import { loadToken } from "@/features/auth/lib/storage";
import {
  deleteCourseReview,
  fetchCourseReviews,
  submitCourseReview,
  type CourseReview,
} from "@/features/learning/api/enrollment-api";
import { useLocale } from "@/shared/i18n/locale-context";
import { ApiError } from "@/shared/api/client";

type Props = {
  courseSlug: string;
  courseId: string | number;
  rating?: number | null;
  reviewsCount?: number;
  embedded?: boolean;
};

function displayName(review: CourseReview) {
  const first = review.user?.first_name?.trim() ?? "";
  const last = review.user?.last_name?.trim() ?? "";
  const full = `${first} ${last}`.trim();
  return full || review.user?.username || "Student";
}

export function CourseReviewsSection({
  courseSlug,
  courseId,
  rating,
  reviewsCount = 0,
  embedded = false,
}: Props) {
  const { t, locale } = useLocale();
  const { user, isEnrolled } = useAuth();
  const enrolled = isEnrolled(String(courseId));
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingValue, setRatingValue] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const myReview = useMemo(
    () => reviews.find((item) => String(item.user?.id) === String(user?.id)) ?? null,
    [reviews, user?.id],
  );

  useEffect(() => {
    setLoading(true);
    fetchCourseReviews(courseSlug)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [courseSlug]);

  useEffect(() => {
    if (myReview) {
      setRatingValue(myReview.rating);
      setComment(myReview.comment ?? "");
    }
  }, [myReview]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const token = loadToken();
    if (!token || !user) {
      setError(t("reviews.loginRequired"));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const saved = await submitCourseReview(token, courseSlug, {
        rating: ratingValue,
        comment,
      });
      setReviews((prev) => {
        const withoutMine = prev.filter((item) => String(item.user?.id) !== String(user.id));
        return [saved, ...withoutMine];
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(Object.values(err.body?.errors ?? {})[0]?.[0] ?? err.message);
      } else {
        setError(err instanceof Error ? err.message : t("reviews.saveFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!myReview || !user) return;
    const token = loadToken();
    if (!token) return;
    setSubmitting(true);
    setError("");
    try {
      await deleteCourseReview(token, courseSlug, myReview.id);
      setReviews((prev) => prev.filter((item) => String(item.id) !== String(myReview.id)));
      setComment("");
      setRatingValue(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("reviews.saveFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  const avgLabel =
    rating != null
      ? locale === "km"
        ? `${rating.toFixed(1)} / 5 · ${reviewsCount || reviews.length} វាយតម្លៃ`
        : `${rating.toFixed(1)} / 5 · ${reviewsCount || reviews.length} reviews`
      : t("reviews.noRatings");

  return (
    <section className={embedded ? "space-y-6" : "container-page space-y-6 py-10 sm:py-14"}>
      <div>
        <h2 className="font-display text-2xl font-semibold text-[var(--ink)]">
          {t("reviews.title")}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{avgLabel}</p>
      </div>

      {user && enrolled ? (
        <form onSubmit={onSubmit} className="surface space-y-4 p-5 sm:p-6">
          <p className="text-sm font-semibold text-[var(--ink)]">
            {myReview ? t("reviews.updateYours") : t("reviews.writeYours")}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRatingValue(value)}
                className="rounded-md p-1 transition hover:bg-[var(--brand-soft)]"
                aria-label={`${value} stars`}
              >
                <Star
                  className={`h-5 w-5 ${
                    value <= ratingValue
                      ? "fill-[var(--accent-brand)] text-[var(--accent-brand)]"
                      : "text-[var(--line)]"
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            className="input min-h-[96px] border-transparent bg-[#f3f6fb] font-normal"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("reviews.commentPlaceholder")}
            maxLength={2000}
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? t("reviews.saving") : t("reviews.submit")}
            </button>
            {myReview ? (
              <button
                type="button"
                onClick={() => void onDelete()}
                className="btn btn-secondary"
                disabled={submitting}
              >
                {t("reviews.delete")}
              </button>
            ) : null}
          </div>
        </form>
      ) : user ? (
        <p className="text-sm text-[var(--muted)]">{t("reviews.enrollFirst")}</p>
      ) : (
        <p className="text-sm text-[var(--muted)]">{t("reviews.loginRequired")}</p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">…</p>
      ) : reviews.length === 0 ? (
        <div className="surface p-6 text-sm text-[var(--muted)]">{t("reviews.empty")}</div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={String(review.id)} className="surface space-y-2 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-[var(--ink)]">{displayName(review)}</p>
                <span className="inline-flex items-center gap-1 text-sm text-[var(--muted)]">
                  <Star className="h-3.5 w-3.5 fill-[var(--accent-brand)] text-[var(--accent-brand)]" />
                  {review.rating}.0
                </span>
              </div>
              {review.comment ? (
                <p className="text-sm leading-relaxed text-[var(--muted)]">{review.comment}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
