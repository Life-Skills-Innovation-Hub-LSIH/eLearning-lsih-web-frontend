"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Plus, Search } from "lucide-react";
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
import { deleteCourseApi, fetchCourses } from "../api/courses-api";
import { ActionMenu } from "./ActionMenu";
import { AdminPageLayout } from "./AdminPageLayout";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import type { ManagedCourse } from "@/shared/types";

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CoursesManagement() {
  const router = useRouter();
  const { token } = useAuth();
  const [courses, setCourses] = useState<ManagedCourse[]>([]);
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadCourses() {
    if (!token) {
      setLoading(false);
      setLoadError("Please log in again to load courses.");
      return;
    }

    setLoading(true);
    setLoadError("");
    try {
      setCourses(await fetchCourses(token));
    } catch (error) {
      setCourses([]);
      setLoadError(error instanceof Error ? error.message : "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter((course) =>
      [
        course.title,
        course.code ?? "",
        course.slug,
        course.lecturer?.name ?? "",
        ...(course.subjects ?? []).map((s) => s.name),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [courses, search]);

  async function onDelete(course: ManagedCourse) {
    if (!token) {
      setActionError("Please log in again to delete a course.");
      return;
    }

    const confirmed = window.confirm(`Delete "${course.title}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(course.id);
    setActionError("");
    try {
      await deleteCourseApi(token, course.id);
      setCourses((prev) => prev.filter((item) => item.id !== course.id));
    } catch (error) {
      if (error instanceof ApiError) {
        setActionError(error.message);
      } else {
        setActionError(error instanceof Error ? error.message : "Failed to delete course.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminPageLayout
      title="Courses"
      description="Create a course first, then add modules, lessons, and quizzes inside it."
      actions={
        <Button render={<Link href="/admin/courses/create" />}>
          <Plus />
          Add course
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="admin-stat-card">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Total courses
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {loading ? "…" : courses.length}
          </p>
        </div>
        <div className="admin-stat-card">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Published
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {loading ? "…" : courses.filter((item) => item.status === "published").length}
          </p>
        </div>
        <div className="admin-stat-card">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Draft</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {loading ? "…" : courses.filter((item) => item.status === "draft").length}
          </p>
        </div>
      </div>

      <Card className="gap-0 overflow-hidden py-0 shadow-sm">
        <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Catalog</h2>
            <p className="text-sm text-muted-foreground">
              {loading ? "…" : `${filteredCourses.length} courses`}
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search courses…"
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
              <TableHead className="px-4">Course</TableHead>
              <TableHead className="px-4">Subjects</TableHead>
              <TableHead className="px-4">Status</TableHead>
              <TableHead className="px-4">Date added</TableHead>
              <TableHead className="px-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-8">
                  <PageLoader compact label="Loading courses…" />
                </TableCell>
              </TableRow>
            ) : filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                  {search.trim() ? (
                    "No courses match your search."
                  ) : (
                    <>
                      No courses yet. Modules and lessons are added after you create a course.{" "}
                      <Link href="/admin/courses/create" className="font-semibold text-primary">
                        Add the first course
                      </Link>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
                        {course.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={course.coverImage} alt="" className="size-full object-cover" />
                        ) : (
                          <BookOpen className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{course.title}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {course.code || course.slug}
                          {course.lecturer ? ` · ${course.lecturer.name}` : ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex max-w-[220px] flex-wrap gap-1.5">
                      {(course.subjects ?? []).length === 0 ? (
                        <span className="text-sm text-muted-foreground">—</span>
                      ) : (
                        (course.subjects ?? []).slice(0, 3).map((subject) => (
                          <Badge key={subject.id} variant="outline" className="font-normal">
                            {subject.name}
                          </Badge>
                        ))
                      )}
                      {(course.subjects ?? []).length > 3 ? (
                        <Badge variant="outline" className="font-normal text-muted-foreground">
                          +{(course.subjects ?? []).length - 3}
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Badge
                      variant="outline"
                      className={
                        course.status === "published"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }
                    >
                      {course.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground">
                    {formatDate(course.createdAt)}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/courses/${course.id}/content`)}
                      >
                        Modules
                      </Button>
                      <ActionMenu
                        items={[
                          {
                            label: "Manage content",
                            onClick: () => router.push(`/admin/courses/${course.id}/content`),
                          },
                          {
                            label: "Edit course",
                            onClick: () => router.push(`/admin/courses/${course.id}/edit`),
                          },
                          {
                            label: "Delete course",
                            destructive: true,
                            disabled: deletingId === course.id,
                            onClick: () => void onDelete(course),
                          },
                        ]}
                      />
                    </div>
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
