"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Award, BookOpen, CalendarDays, Mail, Pencil, UserRound } from "lucide-react";
import { useAuth } from "@/features/auth";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/admin/shadcn";
import {
  fetchStudentProgressAdmin,
  type AdminStudentDetail,
  type EnrollmentRecord,
} from "@/features/learning/api/enrollment-api";
import { AdminPageLayout } from "./AdminPageLayout";
import { StatusBadge } from "./RoleBadge";
import {
  formatAdminDate,
  formatPaymentDuration,
  formatUserStatus,
} from "../lib/user-store";
import type { PaymentDuration, UserPaymentStatus } from "@/shared/types";

type Props = {
  studentId: string;
};

function displayName(student: AdminStudentDetail["student"]) {
  const full = `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim();
  return full || student.username || student.email || "Student";
}

function enrollmentStatusLabel(status: string) {
  if (status === "completed") return "Completed";
  if (status === "active") return "In progress";
  return status;
}

function enrollmentStatusClass(status: string) {
  if (status === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (status === "active") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }
  return "border-border bg-muted text-muted-foreground";
}

function ProgressBar({ percent }: { percent: number }) {
  const value = Math.max(0, Math.min(100, percent));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 min-w-[72px] flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums">{value}%</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-3 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function StudentDetail({ studentId }: Props) {
  const { token } = useAuth();
  const [data, setData] = useState<AdminStudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Please log in again to view this student.");
      return;
    }

    setLoading(true);
    setError("");
    fetchStudentProgressAdmin(token, studentId)
      .then(setData)
      .catch((err) => {
        setData(null);
        setError(err instanceof Error ? err.message : "Failed to load student details.");
      })
      .finally(() => setLoading(false));
  }, [token, studentId]);

  const name = useMemo(() => (data ? displayName(data.student) : "Student"), [data]);

  if (loading) {
    return (
      <AdminPageLayout backHref="/admin/students" backLabel="Back to students">
        <PageLoader label="Loading student…" />
      </AdminPageLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminPageLayout backHref="/admin/students" backLabel="Back to students">
        <Card className="py-0">
          <CardContent className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-destructive">{error || "Student not found."}</p>
            <Button className="mt-4" variant="outline" render={<Link href="/admin/students" />}>
              Return to students
            </Button>
          </CardContent>
        </Card>
      </AdminPageLayout>
    );
  }

  const { student, enrollments, certificates, summary } = data;
  const paymentStatus = (student.status === "paid" ? "paid" : "unpaid") as UserPaymentStatus;
  const subscriptionLabel =
    paymentStatus === "paid" && student.subscription_expires_at
      ? `Expires ${formatAdminDate(student.subscription_expires_at)}`
      : paymentStatus === "paid"
        ? "Active"
        : "Not started";

  return (
    <AdminPageLayout
      backHref="/admin/students"
      backLabel="Back to students"
      actions={
        <Button variant="outline" render={<Link href={`/admin/users/${student.id}/edit`} />}>
          <Pencil />
          Edit student
        </Button>
      }
    >
      <Card className="gap-0 overflow-hidden py-0 shadow-sm">
        <CardContent className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <UserAvatar
              name={name}
              firstName={student.first_name}
              avatarUrl={student.avatar}
              title={name}
              size="xl"
            />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight">{name}</h1>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                <Mail className="size-3.5 shrink-0" />
                {student.email || "—"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={paymentStatus} />
                <Badge variant="outline" className="font-normal capitalize">
                  {student.role}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/80 px-2.5 py-1.5 text-sm font-semibold">
              <span className="tabular-nums text-primary">{summary.enrolled_courses}</span>
              enrolled
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/80 px-2.5 py-1.5 text-sm font-semibold">
              <span className="tabular-nums text-primary">{summary.completed_courses}</span>
              completed
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/80 px-2.5 py-1.5 text-sm font-semibold">
              <span className="tabular-nums text-primary">{summary.certificates}</span>
              certificates
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/80 px-2.5 py-1.5 text-sm font-semibold">
              <span className="tabular-nums text-primary">{summary.average_progress}%</span>
              avg progress
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Card className="gap-0 overflow-hidden py-0 shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <UserRound className="size-4 text-muted-foreground" />
              Profile
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Account and payment details.</p>
          </div>
          <CardContent className="px-5 py-1">
            <dl>
              <InfoRow label="Username" value={student.username || "—"} />
              <InfoRow label="Email" value={student.email || "—"} />
              <InfoRow label="Payment status" value={formatUserStatus(paymentStatus)} />
              <InfoRow
                label="Subscription"
                value={
                  paymentStatus === "paid" && student.payment_duration
                    ? formatPaymentDuration(student.payment_duration as PaymentDuration)
                    : subscriptionLabel
                }
              />
              <InfoRow
                label="Subscription start"
                value={formatAdminDate(student.subscription_starts_at)}
              />
              <InfoRow
                label="Subscription end"
                value={formatAdminDate(student.subscription_expires_at)}
              />
              <InfoRow
                label="Active days"
                value={
                  student.subscription_active_days != null
                    ? student.subscription_active_days
                    : "—"
                }
              />
              <InfoRow
                label="Joined"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 text-muted-foreground" />
                    {formatAdminDate(student.created_at)}
                  </span>
                }
              />
              <InfoRow label="Last updated" value={formatAdminDate(student.updated_at)} />
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="gap-0 overflow-hidden py-0 shadow-sm">
            <div className="border-b px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <BookOpen className="size-4 text-muted-foreground" />
                Enrolled courses
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Progress across lessons and quizzes.
              </p>
            </div>

            {enrollments.length === 0 ? (
              <CardContent className="px-5 py-10 text-center text-sm text-muted-foreground">
                No course enrollments yet.
              </CardContent>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-5">Course</TableHead>
                    <TableHead className="px-4">Status</TableHead>
                    <TableHead className="px-4">Progress</TableHead>
                    <TableHead className="px-4">Certificate</TableHead>
                    <TableHead className="px-5">Enrolled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((item: EnrollmentRecord) => {
                    const percent = item.progress?.percent ?? 0;
                    const lessons = item.progress
                      ? `${item.progress.completed_lessons}/${item.progress.total_lessons} lessons`
                      : null;
                    const quizzes = item.progress
                      ? `${item.progress.passed_quizzes}/${item.progress.total_quizzes} quizzes`
                      : null;
                    const hasCert = Boolean(item.certificate);
                    const certLabel = hasCert
                      ? "Issued"
                      : item.certificate_eligible
                        ? "Eligible"
                        : "Not yet";

                    return (
                      <TableRow key={String(item.id)}>
                        <TableCell className="px-5 py-3">
                          <p className="font-medium leading-tight">
                            {item.course?.title ?? `Course #${item.course_id}`}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {[lessons, quizzes].filter(Boolean).join(" · ") || "—"}
                          </p>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={`font-normal ${enrollmentStatusClass(item.status)}`}
                          >
                            {enrollmentStatusLabel(item.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="min-w-[140px] px-4 py-3">
                          <ProgressBar percent={percent} />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={
                              hasCert
                                ? "border-emerald-200 bg-emerald-50 font-normal text-emerald-700"
                                : item.certificate_eligible
                                  ? "border-amber-200 bg-amber-50 font-normal text-amber-700"
                                  : "font-normal text-muted-foreground"
                            }
                          >
                            {certLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-muted-foreground">
                          {formatAdminDate(item.enrolled_at)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>

          <Card className="gap-0 overflow-hidden py-0 shadow-sm">
            <div className="border-b px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Award className="size-4 text-muted-foreground" />
                Certificates
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Courses this student has earned a certificate for.
              </p>
            </div>

            {certificates.length === 0 ? (
              <CardContent className="px-5 py-10 text-center text-sm text-muted-foreground">
                No certificates issued yet.
              </CardContent>
            ) : (
              <ul className="divide-y">
                {certificates.map((cert) => (
                  <li
                    key={String(cert.id)}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="font-medium leading-tight">
                        {cert.course?.title ?? `Course #${cert.course_id}`}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {cert.certificate_number}
                        {cert.course?.code ? ` · ${cert.course.code}` : ""}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Issued {formatAdminDate(cert.issued_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </AdminPageLayout>
  );
}
