"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/lib/auth/auth-context";
import { mockCourses } from "@/lib/data/mock-courses";

export default function MyCoursesPage() {
  return (
    <RequireAuth roles={["student"]}>
      <Content />
    </RequireAuth>
  );
}

function Content() {
  const { enrollments, getProgress } = useAuth();
  const courses = mockCourses.filter((course) => enrollments.includes(course.id));

  return (
    <main className="container-page py-12">
      <h1 className="font-display text-4xl text-[var(--ink)]">My Courses</h1>
      <p className="mt-2 text-[var(--muted)]">Courses you have enrolled in (demo local storage).</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <Link key={course.id} href={`/learn/${course.slug}`} className="surface block p-5">
            <h2 className="font-display text-2xl">{course.title}</h2>
            <div className="mt-4">
              <ProgressBar value={getProgress(course.id)?.percent ?? 0} label="Progress" />
            </div>
          </Link>
        ))}
        {courses.length === 0 ? (
          <div className="surface p-6 text-[var(--muted)] md:col-span-2">
            No courses yet. <Link href="/courses" className="text-[var(--brand)]">Browse catalog</Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
