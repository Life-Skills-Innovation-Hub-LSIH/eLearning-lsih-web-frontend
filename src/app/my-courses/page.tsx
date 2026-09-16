"use client";

import Link from "next/link";
import { RequireAuth, useAuth } from "@/features/auth";
import { ProgressBar } from "@/shared/components/ui/ProgressBar";

export default function MyCoursesPage() {
  return (
    <RequireAuth roles={["student"]}>
      <Content />
    </RequireAuth>
  );
}

function Content() {
  const { enrollmentRecords, ready } = useAuth();

  return (
    <main className="container-page py-12">
      <h1 className="font-display text-4xl text-[var(--ink)]">My Courses</h1>
      <p className="mt-2 text-[var(--muted)]">Courses you have enrolled in.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {!ready ? (
          <div className="surface p-6 text-[var(--muted)] md:col-span-2">Loading…</div>
        ) : (
          <>
            {enrollmentRecords.map((item) => (
              <Link
                key={String(item.id)}
                href={`/learn/${item.course?.slug ?? item.course_id}`}
                className="surface block p-5"
              >
                <h2 className="font-display text-2xl">
                  {item.course?.title ?? `Course #${item.course_id}`}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)] capitalize">{item.status}</p>
                <div className="mt-4">
                  <ProgressBar value={item.progress?.percent ?? 0} label="Progress" />
                </div>
              </Link>
            ))}
            {enrollmentRecords.length === 0 ? (
              <div className="surface p-6 text-[var(--muted)] md:col-span-2">
                No courses yet.{" "}
                <Link href="/courses" className="text-[var(--brand)]">
                  Browse catalog
                </Link>
              </div>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
