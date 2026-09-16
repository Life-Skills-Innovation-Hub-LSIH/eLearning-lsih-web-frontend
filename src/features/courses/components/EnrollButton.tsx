"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/features/auth";
import { ApiError } from "@/shared/api/client";

type Props = {
  courseId: string;
  slug: string;
  price: number;
};

export function EnrollButton({ courseId, slug, price }: Props) {
  const { user, ready, token, isEnrolled, enroll } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const enrolled = isEnrolled(courseId);

  if (!ready) {
    return <div className="btn btn-secondary w-full opacity-60">Loading…</div>;
  }

  if (!user) {
    return (
      <Link href="/login" className="btn btn-primary w-full">
        Login to enroll
      </Link>
    );
  }

  if (user.role !== "student") {
    return (
      <Link href="/admin/courses" className="btn btn-secondary w-full">
        Manage in admin
      </Link>
    );
  }

  if (enrolled) {
    return (
      <Link href={`/learn/${slug}`} className="btn btn-primary w-full">
        Continue learning
      </Link>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="btn btn-primary w-full"
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
        {loading
          ? "Enrolling…"
          : price === 0
            ? "Enroll for free"
            : "Enroll in course"}
      </button>
      {error ? <p className="text-center text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
