"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import {
  Button,
  Card,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/admin/shadcn";
import { fetchUsers } from "../api/users-api";
import { fetchStudentProgressAdmin, type EnrollmentRecord } from "@/features/learning/api/enrollment-api";
import { ActionMenu } from "./ActionMenu";
import { AdminPageLayout } from "./AdminPageLayout";
import { StatusBadge } from "./RoleBadge";
import { formatAdminDate } from "../lib/user-store";
import type { ManagedUser } from "@/shared/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/features/admin/shadcn";

function studentDisplayName(user: ManagedUser) {
  return `${user.firstName} ${user.lastName}`.trim() || user.username;
}

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function StudentsManagement() {
  const router = useRouter();
  const { token } = useAuth();
  const [students, setStudents] = useState<ManagedUser[]>([]);
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [progressStudent, setProgressStudent] = useState<ManagedUser | null>(null);
  const [progressEnrollments, setProgressEnrollments] = useState<EnrollmentRecord[]>([]);

  async function openProgress(student: ManagedUser) {
    if (!token) return;
    setProgressStudent(student);
    setProgressOpen(true);
    setProgressLoading(true);
    setProgressError("");
    try {
      const data = await fetchStudentProgressAdmin(token, student.id);
      setProgressEnrollments(
        Array.isArray(data.enrollments)
          ? data.enrollments
          : ((data.enrollments as { data?: EnrollmentRecord[] })?.data ?? []),
      );
    } catch (error) {
      setProgressEnrollments([]);
      setProgressError(error instanceof Error ? error.message : "Failed to load progress.");
    } finally {
      setProgressLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setLoadError("Please log in again to load students.");
      return;
    }

    setLoading(true);
    setLoadError("");
    fetchUsers(token, { role: "student" })
      .then(setStudents)
      .catch((error) => {
        setStudents([]);
        setLoadError(error instanceof Error ? error.message : "Failed to load students.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) => {
      const haystack = [
        student.firstName,
        student.lastName,
        student.username,
        student.email,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [students, search]);

  const stats = useMemo(
    () => ({
      total: students.length,
      paid: students.filter((s) => s.status === "paid").length,
      unpaid: students.filter((s) => s.status === "unpaid").length,
    }),
    [students],
  );

  return (
    <AdminPageLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/80 px-2.5 py-1.5 text-sm font-semibold text-foreground">
            <span className="tabular-nums text-primary">{loading ? "…" : stats.total}</span>
            students
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/80 px-2.5 py-1.5 text-sm font-semibold text-foreground">
            <span className="tabular-nums text-primary">{loading ? "…" : stats.paid}</span>
            paid
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/80 px-2.5 py-1.5 text-sm font-semibold text-foreground">
            <span className="tabular-nums text-primary">{loading ? "…" : stats.unpaid}</span>
            unpaid
          </span>
        </div>
        <Button render={<Link href="/admin/users/create" />}>
          <Plus />
          Create student
        </Button>
      </div>

      <Card className="gap-0 overflow-hidden border-border/80 py-0 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/20 px-5 py-3.5">
          <p className="text-sm font-semibold">
            Directory{" "}
            <span className="font-normal text-muted-foreground">
              {loading ? "…" : `${filteredStudents.length} students`}
            </span>
          </p>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="admin-form-input w-56 bg-background pl-9"
              placeholder="Search students"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="px-4">Student</TableHead>
              <TableHead className="px-4">Payment</TableHead>
              <TableHead className="px-4">Subscription</TableHead>
              <TableHead className="px-4">Joined</TableHead>
              <TableHead className="w-12 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-8">
                  <PageLoader compact label="Loading students…" />
                </TableCell>
              </TableRow>
            ) : loadError ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-16 text-center text-destructive">
                  {loadError}
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                  {search ? (
                    "No students match your search."
                  ) : (
                    <>
                      No students in the database yet.{" "}
                      <Link href="/admin/users/create" className="font-semibold text-primary">
                        Add a student
                      </Link>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => {
                const displayName = studentDisplayName(student);
                return (
                  <TableRow key={student.id}>
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={displayName}
                          firstName={student.firstName}
                          avatarUrl={student.avatar}
                          title={displayName}
                        />
                        <div className="min-w-0">
                          <p className="font-medium">{displayName}</p>
                          <p className="truncate text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <StatusBadge status={student.status} />
                    </TableCell>
                    <TableCell className="px-4 py-4 text-muted-foreground">
                      {student.status === "paid" && student.subscriptionExpiresAt
                        ? `Expires ${formatAdminDate(student.subscriptionExpiresAt)}`
                        : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-muted-foreground">
                      {formatDate(student.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <ActionMenu
                        items={[
                          {
                            label: "View progress",
                            onClick: () => void openProgress(student),
                          },
                          {
                            label: "Edit student",
                            onClick: () => router.push(`/admin/users/${student.id}/edit`),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={progressOpen} onOpenChange={setProgressOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Progress · {progressStudent ? studentDisplayName(progressStudent) : "Student"}
            </DialogTitle>
            <DialogDescription>
              Enrolled courses and completion for this student.
            </DialogDescription>
          </DialogHeader>
          {progressLoading ? (
            <PageLoader compact label="Loading progress…" />
          ) : progressError ? (
            <p className="text-sm text-destructive">{progressError}</p>
          ) : progressEnrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No course enrollments yet.</p>
          ) : (
            <ul className="space-y-3">
              {progressEnrollments.map((item) => (
                <li
                  key={String(item.id)}
                  className="rounded-xl border border-border/70 px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {item.course?.title ?? `Course #${item.course_id}`}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {item.status}
                        {item.progress
                          ? ` · ${item.progress.completed_lessons}/${item.progress.total_lessons} lessons · ${item.progress.passed_quizzes}/${item.progress.total_quizzes} quizzes`
                          : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {item.progress?.percent ?? 0}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${item.progress?.percent ?? 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
}
