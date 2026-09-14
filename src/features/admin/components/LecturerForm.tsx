"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookMarked, UserRound } from "lucide-react";
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
  createLecturerApi,
  fetchLecturer,
  updateLecturerApi,
  type LecturerFormInput,
} from "../api/lecturers-api";
import { fetchSubjects } from "../api/subjects-api";
import { AdminFormField, AdminFormInput, AdminFormSection } from "./AdminFormFields";
import { AdminPageLayout } from "./AdminPageLayout";
import { LecturerAvatarUploadField } from "./LecturerAvatarUploadField";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import type { LecturerStatus, Subject } from "@/shared/types";

type Props = {
  mode: "create" | "edit";
  lecturerId?: string;
};

export function LecturerForm({ mode, lecturerId }: Props) {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [status, setStatus] = useState<LecturerStatus>("active");
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode === "edit";

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const subjectsPromise = fetchSubjects(token);
    const lecturerPromise =
      isEdit && lecturerId ? fetchLecturer(token, lecturerId) : Promise.resolve(null);

    Promise.all([subjectsPromise, lecturerPromise])
      .then(([subjectList, lecturer]) => {
        const selectedIds = lecturer?.subjectIds ?? lecturer?.subjects?.map((s) => s.id) ?? [];
        setSubjects(
          subjectList.filter(
            (item) => item.status === "active" || selectedIds.includes(item.id),
          ),
        );
        if (lecturer) {
          setName(lecturer.name);
          setTitle(lecturer.title ?? "");
          setSlug(lecturer.slug);
          setCode(lecturer.code ?? "");
          setEmail(lecturer.email ?? "");
          setBio(lecturer.bio ?? "");
          setAvatar(lecturer.avatar ?? "");
          setStatus(lecturer.status);
          setSubjectIds(selectedIds);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load form data.");
      })
      .finally(() => setLoading(false));
  }, [isEdit, lecturerId, token]);

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

    const input: LecturerFormInput = {
      name: name.trim(),
      title: title.trim() || null,
      slug: slug.trim() || undefined,
      email: email.trim() || null,
      bio: bio.trim() || null,
      avatar: avatar.trim() || null,
      status,
      subjectIds,
    };

    setSubmitting(true);
    try {
      if (isEdit && lecturerId) {
        await updateLecturerApi(token, lecturerId, input);
        setSuccess("Lecturer updated successfully.");
      } else {
        await createLecturerApi(token, input);
        setSuccess("Lecturer created successfully.");
      }
      setTimeout(() => router.push("/admin/lecturers"), 700);
    } catch (err) {
      if (err instanceof ApiError) {
        const firstError = Object.values(err.body?.errors ?? {})[0]?.[0];
        setError(firstError ?? err.message);
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to save lecturer.");
    } finally {
      setSubmitting(false);
    }
  }

  const formActions = (
    <>
      <Button type="button" variant="outline" onClick={() => router.push("/admin/lecturers")}>
        Cancel
      </Button>
      <Button type="submit" form="lecturer-form" disabled={submitting || loading}>
        {submitting ? "Saving…" : isEdit ? "Save changes" : "Create lecturer"}
      </Button>
    </>
  );

  if (loading) {
    return (
      <div className="admin-page">
        <PageLoader label="Loading lecturer…" />
      </div>
    );
  }

  return (
    <AdminPageLayout
      title={isEdit ? undefined : "Add lecturer"}
      description={isEdit ? undefined : "Create a lecturer profile for subjects and courses."}
      backHref="/admin/lecturers"
      backLabel="Back to lecturers"
      actions={formActions}
    >
      <form id="lecturer-form" onSubmit={onSubmit} className="space-y-6">
        <AdminFormSection
          step={1}
          icon={UserRound}
          title="Lecturer details"
          description="Profile info for this lecturer. Code is assigned automatically."
        >
          <AdminFormField id="name" label="Full name" required>
            <AdminFormInput
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sokha Chan"
              required
            />
          </AdminFormField>

          {token ? (
            <AdminFormField id="avatar" label="Photo" hint="Optional profile photo.">
              <LecturerAvatarUploadField
                token={token}
                avatarUrl={avatar.trim() || null}
                slug={slug}
                onChange={(url) => setAvatar(url ?? "")}
              />
            </AdminFormField>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <AdminFormField id="title" label="Title" hint="Optional job title.">
              <AdminFormInput
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Instructor"
              />
            </AdminFormField>
            <AdminFormField id="email" label="Email">
              <AdminFormInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lecturer@example.com"
              />
            </AdminFormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <AdminFormField
              id="slug"
              label="Slug"
              hint="Optional. Leave blank to auto-generate from the name."
            >
              <AdminFormInput
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. sokha-chan"
              />
            </AdminFormField>
            <AdminFormField
              id="code"
              label="Code"
              hint="Auto-generated as LECTURER-01, LECTURER-02, …"
            >
              <AdminFormInput
                id="code"
                value={isEdit ? code || "—" : "Assigned on save"}
                readOnly
                disabled
              />
            </AdminFormField>
          </div>

          <AdminFormField id="status" label="Status" required>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as LecturerStatus)}
            >
              <SelectTrigger className="admin-form-input w-full max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </AdminFormField>

          <AdminFormField id="bio" label="Bio">
            <textarea
              id="bio"
              className="admin-form-input min-h-28 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio about this lecturer"
            />
          </AdminFormField>
        </AdminFormSection>

        <AdminFormSection
          step={2}
          icon={BookMarked}
          title="Subjects taught"
          description="Select which subjects this lecturer teaches."
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
