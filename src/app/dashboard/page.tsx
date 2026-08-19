"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/lib/auth/auth-context";
import { mockCourses } from "@/lib/data/mock-courses";

export default function StudentDashboardPage() {
  return (
    <RequireAuth roles={["student"]}>
      <DashboardContent />
    </RequireAuth>
  );
}

function DashboardContent() {
  const { user, enrollments, getProgress } = useAuth();
  const myCourses = mockCourses.filter((course) => enrollments.includes(course.id));

  return (
    <main className="container-page py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
          Student
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--ink)]">
          Welcome, {user?.name}
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Track your enrolled courses and continue where you left off.
        </p>
      </div>

      <div className="mb-6 flex gap-3">
        <Link href="/my-courses" className="btn btn-secondary">
          My courses
        </Link>
        <Link href="/courses" className="btn btn-primary">
          Browse catalog
        </Link>
      </div>

      {myCourses.length === 0 ? (
        <div className="surface p-8 text-[var(--muted)]">
          No enrollments yet. Open a course and click enroll.
        </div>
      ) : (
        <div className="grid gap-4">
          {myCourses.map((course) => {
            const progress = getProgress(course.id);
            return (
              <div key={course.id} className="surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl text-[var(--ink)]">{course.title}</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {course.modules.length} modules · video + PDF lessons · quizzes
                    </p>
                  </div>
                  <Link href={`/learn/${course.slug}`} className="btn btn-primary !py-2">
                    Continue
                  </Link>
                </div>
                <div className="mt-4">
                  <ProgressBar value={progress?.percent ?? 0} label="Course progress" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
