"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookMarked, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { ApiError } from "@/shared/api/client";
import {
  Badge,
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
import { deleteSubjectApi, fetchSubjects } from "../api/subjects-api";
import { ActionMenu } from "./ActionMenu";
import { AdminPageLayout } from "./AdminPageLayout";
import type { Subject } from "@/shared/types";

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SubjectsManagement() {
  const router = useRouter();
  const { token } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadSubjects() {
    if (!token) {
      setLoading(false);
      setLoadError("Please log in again to load subjects.");
      return;
    }

    setLoading(true);
    setLoadError("");
    try {
      setSubjects(await fetchSubjects(token));
    } catch (error) {
      setSubjects([]);
      setLoadError(error instanceof Error ? error.message : "Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return subjects;
    return subjects.filter((subject) =>
      [subject.name, subject.code ?? "", subject.slug, subject.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [subjects, search]);

  async function onDelete(subject: Subject) {
    if (!token) {
      setActionError("Please log in again to delete a subject.");
      return;
    }

    const confirmed = window.confirm(`Delete "${subject.name}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(subject.id);
    setActionError("");
    try {
      await deleteSubjectApi(token, subject.id);
      setSubjects((prev) => prev.filter((item) => item.id !== subject.id));
    } catch (error) {
      if (error instanceof ApiError) {
        setActionError(error.message);
      } else {
        setActionError(error instanceof Error ? error.message : "Failed to delete subject.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminPageLayout
      title="Subjects"
      description="Manage subject catalog for lecturers and courses."
      actions={
        <Button render={<Link href="/admin/subjects/create" />}>
          <Plus />
          Add subject
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="admin-stat-card">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Total subjects
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {loading ? "—" : subjects.length}
          </p>
        </div>
        <div className="admin-stat-card">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Active
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {loading ? "—" : subjects.filter((item) => item.status === "active").length}
          </p>
        </div>
      </div>

      <Card className="gap-0 overflow-hidden border-border/80 py-0 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/20 px-5 py-3.5">
          <p className="text-sm font-semibold">
            Catalog{" "}
            <span className="font-normal text-muted-foreground">
              {loading ? "…" : `${filteredSubjects.length} subjects`}
            </span>
          </p>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="admin-form-input w-56 bg-background pl-9"
              placeholder="Search subjects"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {actionError ? (
          <div className="border-b bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {actionError}
          </div>
        ) : null}

        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="px-4">Subject</TableHead>
              <TableHead className="px-4">Code</TableHead>
              <TableHead className="px-4">Status</TableHead>
              <TableHead className="px-4">Created</TableHead>
              <TableHead className="w-12 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                  Loading subjects…
                </TableCell>
              </TableRow>
            ) : loadError ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-16 text-center text-destructive">
                  {loadError}
                </TableCell>
              </TableRow>
            ) : filteredSubjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                  {search ? (
                    "No subjects match your search."
                  ) : (
                    <>
                      No subjects yet.{" "}
                      <Link href="/admin/subjects/create" className="font-semibold text-primary">
                        Add the first subject
                      </Link>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredSubjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BookMarked className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{subject.name}</p>
                        <p className="truncate text-sm text-muted-foreground">{subject.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground">
                    {subject.code || "—"}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Badge
                      variant="outline"
                      className={
                        subject.status === "active"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-border bg-muted text-muted-foreground"
                      }
                    >
                      {subject.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground">
                    {formatDate(subject.createdAt)}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <ActionMenu
                      items={[
                        {
                          label: "Edit subject",
                          onClick: () => router.push(`/admin/subjects/${subject.id}/edit`),
                        },
                        {
                          label: "Delete subject",
                          destructive: true,
                          disabled: deletingId === subject.id,
                          onClick: () => void onDelete(subject),
                        },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </AdminPageLayout>
  );
}
