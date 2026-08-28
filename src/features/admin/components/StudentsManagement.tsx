"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
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
import { ActionMenu } from "./ActionMenu";
import { AdminPageLayout } from "./AdminPageLayout";
import { StatusBadge } from "./RoleBadge";
import { formatAdminDate } from "../lib/user-store";
import type { ManagedUser } from "@/shared/types";

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
    <AdminPageLayout
      title="Students"
      description="Student accounts from your database. Course progress will appear here when courses are enabled."
      actions={
        <Button render={<Link href="/admin/users/create" />}>
          <Plus />
          Add student
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total students", value: loading ? "—" : stats.total },
          { label: "Paid", value: loading ? "—" : stats.paid },
          { label: "Unpaid", value: loading ? "—" : stats.unpaid },
        ].map((stat) => (
          <div key={stat.label} className="admin-stat-card">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{stat.value}</p>
          </div>
        ))}
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
                <TableCell colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                  Loading students…
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
    </AdminPageLayout>
  );
}
