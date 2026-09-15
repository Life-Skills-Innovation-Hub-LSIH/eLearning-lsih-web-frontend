"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, BookMarked } from "lucide-react";
import { useAuth } from "@/features/auth";
import { ApiError } from "@/shared/api/client";
import {
  Button,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/admin/shadcn";
import {
  createCourseApi,
  fetchCourse,
  updateCourseApi,
  type CourseFormInput,
} from "../api/courses-api";
import { fetchLecturers } from "../api/lecturers-api";
import { fetchSubjects } from "../api/subjects-api";
import { AdminFormField, AdminFormInput, AdminFormSection } from "./AdminFormFields";
import { AdminPageLayout } from "./AdminPageLayout";
import { CourseCoverUploadField } from "./CourseCoverUploadField";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import type {
  CourseLevel,
  CoursePublishStatus,
  Lecturer,
  Subject,
} from "@/shared/types";

type Props = {
  mode: "create" | "edit";
  courseId?: string;
};

export function CourseForm({ mode, courseId }: Props) {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [code, setCode] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [level, setLevel] = useState<CourseLevel | "">("");
  const [status, setStatus] = useState<CoursePublishStatus>("draft");
  const [lecturerId, setLecturerId] = useState("");
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode === "edit";

  const levelItems = [
    { value: "__none__", label: "Not set" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];
  const statusItems = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
  ];
  const lecturerItems = [
    { value: "__none__", label: "No lecturer" },
    ...lecturers.map((lecturer) => ({
      value: lecturer.id,
      label: lecturer.code ? `${lecturer.name} (${lecturer.code})` : lecturer.name,
    })),
  ];

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const subjectsPromise = fetchSubjects(token);
    const lecturersPromise = fetchLecturers(token);
    const coursePromise = isEdit && courseId ? fetchCourse(token, courseId) : Promise.resolve(null);

    Promise.all([subjectsPromise, lecturersPromise, coursePromise])
      .then(([subjectList, lecturerList, course]) => {
        const selectedIds = course?.subjectIds ?? course?.subjects?.map((s) => s.id) ?? [];
        setSubjects(
          subjectList.filter(
            (item) => item.status === "active" || selectedIds.includes(item.id),
          ),
        );
        setLecturers(
          lecturerList.filter(
            (item) => item.status === "active" || item.id === course?.lecturerId,
          ),
        );
        if (course) {
          setTitle(course.title);
          setSlug(course.slug);
          setCode(course.code ?? "");
          setShortDescription(course.shortDescription ?? "");
          setDescription(course.description ?? "");
          setCoverImage(course.coverImage ?? "");
          setLevel(course.level ?? "");
          setStatus(course.status);
          setLecturerId(course.lecturerId ?? "");
          setSubjectIds(selectedIds);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load form data.");
      })
      .finally(() => setLoading(false));
  }, [courseId, isEdit, token]);

  function toggleSubject(id: string, checked: boolean) {
    setSubjectIds((prev) => {
      if (checked) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter((item) => item !== id);
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Please log in again to continue.");
      return;
    }

    const input: CourseFormInput = {
      title: title.trim(),
      slug: undefined,
      shortDescription: shortDescription.trim() || null,
      description: description.trim() || null,
      coverImage: coverImage.trim() || null,
      level: level || null,
      status,
      lecturerId: lecturerId || null,
      subjectIds,
    };

    setSubmitting(true);
    try {
      if (isEdit && courseId) {
        await updateCourseApi(token, courseId, input);
        setSuccess("Course updated successfully.");
        setTimeout(() => router.push("/admin/courses"), 700);
      } else {
        const created = await createCourseApi(token, input);
        setSuccess("Course created. Add modules next…");
        setTimeout(() => router.push(`/admin/courses/${created.id}/content`), 700);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        const firstError = Object.values(err.body?.errors ?? {})[0]?.[0];
        setError(firstError ?? err.message);
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to save course.");
    } finally {
      setSubmitting(false);
    }
  }

  const formActions = (
    <>
      <Button type="button" variant="outline" onClick={() => router.push("/admin/courses")}>
        Cancel
      </Button>
      {isEdit && courseId ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/admin/courses/${courseId}/content`)}
        >
          Manage content
        </Button>
      ) : null}
      <Button type="submit" form="course-form" disabled={submitting || loading}>
        {submitting ? "Saving…" : isEdit ? "Save changes" : "Create course"}
      </Button>
    </>
  );

  if (loading) {
    return (
      <div className="admin-page">
        <PageLoader label="Loading course…" />
      </div>
    );
  }

  return (
    <AdminPageLayout
      title={isEdit ? undefined : "Add course"}
      description={isEdit ? undefined : "Create a course and link subjects and lecturer."}
      backHref="/admin/courses"
      backLabel="Back to courses"
      actions={formActions}
    >
      <form id="course-form" onSubmit={onSubmit} className="space-y-6">
        <AdminFormSection
          step={1}
          icon={BookOpen}
          title="Course details"
          description="Basic catalog info. Code is assigned automatically."
        >
          <AdminFormField id="title" label="Course title" required>
            <AdminFormInput
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Infection Control Essentials"
              required
            />
          </AdminFormField>

          {token ? (
            <AdminFormField id="cover" label="Cover image">
              <CourseCoverUploadField
                token={token}
                coverUrl={coverImage.trim() || null}
                slug={slug}
                onChange={(url) => setCoverImage(url ?? "")}
              />
            </AdminFormField>
          ) : null}

          <AdminFormField id="shortDescription" label="Short description">
            <AdminFormInput
              id="shortDescription"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="One-line summary for cards and listings"
            />
          </AdminFormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <AdminFormField id="code" label="Code" hint="Auto-generated as COURSE-01, COURSE-02, …">
              <AdminFormInput
                id="code"
                value={isEdit ? code || "—" : "Assigned on save"}
                readOnly
                disabled
              />
            </AdminFormField>
            {isEdit ? (
              <AdminFormField id="slug" label="Slug" hint="Auto-generated from the title.">
                <AdminFormInput id="slug" value={slug || "—"} readOnly disabled />
              </AdminFormField>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <AdminFormField id="level" label="Level">
              <Select
                value={level || "__none__"}
                onValueChange={(value) => setLevel(value === "__none__" ? "" : (value as CourseLevel))}
                items={levelItems}
              >
                <SelectTrigger className="admin-form-input w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levelItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminFormField>
            <AdminFormField id="status" label="Status" required>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as CoursePublishStatus)}
                items={statusItems}
              >
                <SelectTrigger className="admin-form-input w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminFormField>
          </div>

          <AdminFormField id="lecturer" label="Lecturer">
            <Select
              value={lecturerId || "__none__"}
              onValueChange={(value) => setLecturerId(value === "__none__" ? "" : value)}
              items={lecturerItems}
            >
              <SelectTrigger className="admin-form-input w-full max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {lecturerItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AdminFormField>

          <AdminFormField id="description" label="Description">
            <textarea
              id="description"
              className="admin-form-input min-h-28 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Full course description"
            />
          </AdminFormField>
        </AdminFormSection>

        <AdminFormSection
          step={2}
          icon={BookMarked}
          title="Subjects"
          description="Link this course to one or more subjects."
        >
          {subjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No subjects yet. Create a subject first, then assign it here.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {subjects.map((subject) => {
                const checked = subjectIds.includes(subject.id);
                return (
                  <label
                    key={subject.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2.5 transition hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => toggleSubject(subject.id, value === true)}
                      className="mt-0.5"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{subject.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {subject.code || subject.slug}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </AdminFormSection>

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}
      </form>
    </AdminPageLayout>
  );
}
