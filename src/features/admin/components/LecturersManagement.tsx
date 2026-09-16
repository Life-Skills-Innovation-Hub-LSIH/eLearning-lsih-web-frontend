"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, UserRound } from "lucide-react";
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
import { deleteLecturerApi, fetchLecturers } from "../api/lecturers-api";
import { ActionMenu } from "./ActionMenu";
import { AdminPageLayout } from "./AdminPageLayout";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import type { Lecturer } from "@/shared/types";

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function LecturersManagement() {
  const router = useRouter();
  const { token } = useAuth();
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadLecturers() {
    if (!token) {
      setLoading(false);
      setLoadError("Please log in again to load lecturers.");
      return;
    }

    setLoading(true);
    setLoadError("");
    try {
      setLecturers(await fetchLecturers(token));
    } catch (error) {
      setLecturers([]);
      setLoadError(error instanceof Error ? error.message : "Failed to load lecturers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLecturers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredLecturers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return lecturers;
    return lecturers.filter((lecturer) =>
      [lecturer.name, lecturer.code ?? "", lecturer.slug, lecturer.email ?? "", lecturer.title ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [lecturers, search]);

  async function onDelete(lecturer: Lecturer) {
    if (!token) {
      setActionError("Please log in again to delete a lecturer.");
      return;
    }

    const confirmed = window.confirm(`Delete "${lecturer.name}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(lecturer.id);
    setActionError("");
    try {
      await deleteLecturerApi(token, lecturer.id);
      setLecturers((prev) => prev.filter((item) => item.id !== lecturer.id));
    } catch (error) {
      if (error instanceof ApiError) {
        setActionError(error.message);
      } else {
        setActionError(error instanceof Error ? error.message : "Failed to delete lecturer.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminPageLayout
      title="Lecturers"
      description="Manage lecturer profiles for subjects and courses."
      actions={
        <Button render={<Link href="/admin/lecturers/create" />}>
          <Plus />
          Add lecturer
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="admin-stat-card">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Total lecturers
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{loading ? "…" : lecturers.length}</p>
        </div>
        <div className="admin-stat-card">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Active
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {loading ? "…" : lecturers.filter((item) => item.status === "active").length}
          </p>
        </div>
      </div>

      <Card className="gap-0 overflow-hidden py-0 shadow-sm">
        <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Directory</h2>
            <p className="text-sm text-muted-foreground">
              {loading ? "…" : `${filteredLecturers.length} lecturers`}
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search lecturers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loadError ? (
          <div className="border-b border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {loadError}
          </div>
        ) : null}
        {actionError ? (
          <div className="border-b border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {actionError}
          </div>
        ) : null}

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4">Lecturer</TableHead>
              <TableHead className="px-4">Subjects</TableHead>
              <TableHead className="px-4">Code</TableHead>
              <TableHead className="px-4">Status</TableHead>
              <TableHead className="px-4">Date added</TableHead>
              <TableHead className="px-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-8">
                  <PageLoader compact label="Loading lecturers…" />
                </TableCell>
              </TableRow>
            ) : filteredLecturers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                  {search.trim() ? (
                    "No lecturers match your search."
                  ) : (
                    <>
                      No lecturers yet.{" "}
                      <Link href="/admin/lecturers/create" className="font-semibold text-primary">
                        Add the first lecturer
                      </Link>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredLecturers.map((lecturer) => (
                <TableRow key={lecturer.id}>
                  <TableCell className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                        {lecturer.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={lecturer.avatar} alt="" className="size-full object-cover" />
                        ) : (
                          <UserRound className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{lecturer.name}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {lecturer.title || lecturer.email || lecturer.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex max-w-[220px] flex-wrap gap-1.5">
                      {(lecturer.subjects ?? []).length === 0 ? (
                        <span className="text-sm text-muted-foreground">—</span>
                      ) : (
                        (lecturer.subjects ?? []).slice(0, 3).map((subject) => (
                          <Badge key={subject.id} variant="outline" className="font-normal">
                            {subject.name}
                          </Badge>
                        ))
                      )}
                      {(lecturer.subjects ?? []).length > 3 ? (
                        <Badge variant="outline" className="font-normal text-muted-foreground">
                          +{(lecturer.subjects ?? []).length - 3}
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground">
                    {lecturer.code || "—"}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Badge
                      variant="outline"
                      className={
                        lecturer.status === "active"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-border bg-muted text-muted-foreground"
                      }
                    >
                      {lecturer.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground">
                    {formatDate(lecturer.createdAt)}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-right">
                    <ActionMenu
                      items={[
                        {
                          label: "Edit lecturer",
                          onClick: () => router.push(`/admin/lecturers/${lecturer.id}/edit`),
                        },
                        {
                          label: "Delete lecturer",
                          destructive: true,
                          disabled: deletingId === lecturer.id,
                          onClick: () => void onDelete(lecturer),
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
