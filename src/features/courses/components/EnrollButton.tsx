"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";

type Props = {
  courseId: string;
  slug: string;
  price: number;
};

export function EnrollButton({ courseId, slug, price }: Props) {
  const { user, ready, isEnrolled, enroll } = useAuth();
  const router = useRouter();
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
    <button
      type="button"
      className="btn btn-primary w-full"
      onClick={() => {
        enroll(courseId);
        router.push(`/learn/${slug}`);
      }}
    >
      {price === 0 ? "Enroll for free" : "Purchase & enroll (demo)"}
    </button>
  );
}
