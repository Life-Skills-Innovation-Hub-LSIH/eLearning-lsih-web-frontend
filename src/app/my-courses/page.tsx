"use client";

import { useState } from "react";
import Link from "next/link";
import { RequireAuth, useAuth } from "@/features/auth";
import { ProgressBar } from "@/shared/components/ui/ProgressBar";
import {
  downloadCourseCertificatePdf,
  fetchCertificateStatus,
} from "@/features/learning/api/enrollment-api";

export default function MyCoursesPage() {
  return (
    <RequireAuth roles={["student"]}>
      <Content />
    </RequireAuth>
  );
}

function Content() {
  const { token, enrollmentRecords, ready } = useAuth();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState("");

  async function onDownloadCertificate(
    courseId: string | number,
    courseSlug: string | undefined,
    courseTitle: string | undefined,
  ) {
    if (!token) return;
    const key = String(courseId);
    setDownloadingId(key);
    setDownloadError("");
    try {
      const target = courseSlug || courseId;
      const status = await fetchCertificateStatus(token, target);
      if (!status.eligible) {
        throw new Error(
          "Complete all lessons and pass every quiz to unlock your certificate.",
        );
      }
      await downloadCourseCertificatePdf(token, target, courseTitle);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Failed to download certificate.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <main className="container-page py-12">
      <h1 className="font-display text-4xl text-[var(--ink)]">My Courses</h1>
      <p className="mt-2 text-[var(--muted)]">Courses you have enrolled in.</p>

      {downloadError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {downloadError}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {!ready ? (
          <div className="surface p-6 text-[var(--muted)] md:col-span-2">Loading…</div>
        ) : (
          <>
            {enrollmentRecords.map((item) => {
              const courseId = item.course?.id ?? item.course_id;
              const title = item.course?.title ?? `Course #${item.course_id}`;
              const percent = item.progress?.percent ?? 0;
              const canDownload = item.certificate_eligible === true || item.status === "completed";

              return (
                <div key={String(item.id)} className="surface p-5">
                  <Link
                    href={`/learn/${item.course?.slug ?? item.course_id}`}
                    className="block"
                  >
                    <h2 className="font-display text-2xl">{title}</h2>
                    <p className="mt-1 text-sm text-[var(--muted)] capitalize">{item.status}</p>
                    <div className="mt-4">
                      <ProgressBar value={percent} label="Progress" />
                    </div>
                  </Link>

                  {canDownload ? (
                    <button
                      type="button"
                      className="mt-4 inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                      disabled={downloadingId === String(courseId)}
                      onClick={() =>
                        void onDownloadCertificate(
                          courseId,
                          item.course?.slug,
                          item.course?.title,
                        )
                      }
                    >
                      {downloadingId === String(courseId)
                        ? "Preparing PDF…"
                        : "Download certificate (PDF)"}
                    </button>
                  ) : (
                    <p className="mt-4 text-xs text-[var(--muted)]">
                      Certificate unlocks after you finish all lessons and pass every quiz
                      (usually 70%+).
                    </p>
                  )}
                </div>
              );
            })}
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
