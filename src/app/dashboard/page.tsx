"use client";

import Link from "next/link";
import {
  hasActiveSubscription,
  RequireAuth,
  subscriptionBlockedMessage,
  useAuth,
} from "@/features/auth";
import { StudentNav } from "@/features/learning";
import { ProgressBar } from "@/shared/components/ui/ProgressBar";

export default function StudentDashboardPage() {
  return (
    <RequireAuth roles={["student"]}>
      <DashboardContent />
    </RequireAuth>
  );
}

function DashboardContent() {
  const { user, enrollmentRecords, ready } = useAuth();
  const subscriptionOk = hasActiveSubscription(user);
  const activeCount = enrollmentRecords.filter((item) => item.status === "active").length;
  const completedCount = enrollmentRecords.filter((item) => item.status === "completed").length;

  return (
    <main className="container-page py-10 sm:py-12">
      <StudentNav />

      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
          Student
        </p>
        <h1 className="mt-2 font-display text-3xl text-[var(--ink)] sm:text-4xl">
          Welcome, {user?.name}
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Track your enrolled courses and continue where you left off.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Enrolled
          </p>
          <p className="mt-1 font-display text-2xl text-[var(--ink)]">
            {ready ? enrollmentRecords.length : "…"}
          </p>
        </div>
        <div className="surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            In progress
          </p>
          <p className="mt-1 font-display text-2xl text-[var(--ink)]">
            {ready ? activeCount : "…"}
          </p>
        </div>
        <div className="surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Completed
          </p>
          <p className="mt-1 font-display text-2xl text-[var(--ink)]">
            {ready ? completedCount : "…"}
          </p>
        </div>
      </div>

      {!subscriptionOk ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {subscriptionBlockedMessage(user)}{" "}
          <Link href="/contact" className="font-semibold underline">
            Contact support
          </Link>
        </div>
      ) : user?.subscriptionExpiresAt ? (
        <div className="mb-6 rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--muted)]">
          Subscription active
          {user.subscriptionActiveDays != null
            ? ` · day ${user.subscriptionActiveDays}`
            : null}
          {" · "}expires {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
        </div>
      ) : null}

      {!ready ? (
        <div className="surface p-8 text-[var(--muted)]">Loading…</div>
      ) : enrollmentRecords.length === 0 ? (
        <div className="surface space-y-4 p-8 text-center">
          <p className="font-display text-xl text-[var(--ink)]">No courses yet</p>
          <p className="text-sm text-[var(--muted)]">
            Browse the catalog and enroll in a published course.
          </p>
          <Link href="/courses" className="btn btn-primary">
            Browse catalog
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {enrollmentRecords.map((item) => (
            <div key={String(item.id)} className="surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl text-[var(--ink)]">
                    {item.course?.title ?? `Course #${item.course_id}`}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)] capitalize">
                    {item.status}
                    {item.progress
                      ? ` · ${item.progress.completed_lessons}/${item.progress.total_lessons} lessons · ${item.progress.passed_quizzes}/${item.progress.total_quizzes} quizzes`
                      : null}
                  </p>
                </div>
                <Link
                  href={`/learn/${item.course?.slug ?? item.course_id}`}
                  className="btn btn-primary !py-2"
                >
                  Continue
                </Link>
              </div>
              <div className="mt-4">
                <ProgressBar
                  value={item.progress?.percent ?? 0}
                  label="Course progress"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
