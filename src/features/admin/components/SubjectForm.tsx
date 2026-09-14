"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookMarked } from "lucide-react";
import { useAuth } from "@/features/auth";
import { ApiError } from "@/shared/api/client";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@/features/admin/shadcn";
import {
  createSubjectApi,
  fetchSubject,
  updateSubjectApi,
  type SubjectFormInput,
} from "../api/subjects-api";
import { AdminFormField, AdminFormInput, AdminFormSection } from "./AdminFormFields";
import { AdminPageLayout } from "./AdminPageLayout";
import { SubjectIconUploadField } from "./SubjectIconUploadField";
import type { Subject, SubjectStatus } from "@/shared/types";

type Props = {
  mode: "create" | "edit";
  subjectId?: string;
};

export function SubjectForm({ mode, subjectId }: Props) {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(mode === "edit");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [status, setStatus] = useState<SubjectStatus>("active");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode === "edit";

  useEffect(() => {
    if (!isEdit || !subjectId || !token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchSubject(token, subjectId)
      .then((subject: Subject) => {
        setName(subject.name);
        setSlug(subject.slug);
        setCode(subject.code ?? "");
        setDescription(subject.description ?? "");
        setIcon(subject.icon ?? "");
        setStatus(subject.status);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load subject.");
      })
      .finally(() => setLoading(false));
  }, [isEdit, subjectId, token]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Please log in again to continue.");
      return;
    }

    const input: SubjectFormInput = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || null,
      icon: icon.trim() || null,
      status,
    };

    setSubmitting(true);
    try {
      if (isEdit && subjectId) {
        await updateSubjectApi(token, subjectId, input);
        setSuccess("Subject updated successfully.");
      } else {
        await createSubjectApi(token, input);
        setSuccess("Subject created successfully.");
      }
      setTimeout(() => router.push("/admin/subjects"), 700);
    } catch (err) {
      if (err instanceof ApiError) {
        const firstError = Object.values(err.body?.errors ?? {})[0]?.[0];
        setError(firstError ?? err.message);
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to save subject.");
    } finally {
      setSubmitting(false);
    }
  }

  const formActions = (
    <>
      <Button type="button" variant="outline" onClick={() => router.push("/admin/subjects")}>
        Cancel
      </Button>
      <Button type="submit" form="subject-form" disabled={submitting || loading}>
        {submitting ? "Saving…" : isEdit ? "Save changes" : "Create subject"}
      </Button>
    </>
  );

  if (loading) {
    return (
      <div className="admin-page space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <AdminPageLayout
      title={isEdit ? undefined : "Add subject"}
      description={
        isEdit ? undefined : "Create a subject for lecturers and courses."
      }
      backHref="/admin/subjects"
      backLabel="Back to subjects"
      actions={formActions}
    >
      <form id="subject-form" onSubmit={onSubmit} className="space-y-6">
        <AdminFormSection
          step={1}
          icon={BookMarked}
          title="Subject details"
          description="Name, icon, and status for this subject. Code is assigned automatically."
        >
          <AdminFormField id="name" label="Subject name" required>
            <AdminFormInput
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Infection Control"
              required
            />
          </AdminFormField>

          {token ? (
            <AdminFormField
              id="icon"
              label="Icon"
              hint="Optional. Shown in subject lists and course catalogs."
            >
              <SubjectIconUploadField
                token={token}
                iconUrl={icon.trim() || null}
                slug={slug}
                onChange={(url) => setIcon(url ?? "")}
              />
            </AdminFormField>
          ) : null}

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
                placeholder="e.g. infection-control"
              />
            </AdminFormField>
            <AdminFormField
              id="code"
              label="Code"
              hint="Auto-generated as SUBJECT-01, SUBJECT-02, …"
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
              onValueChange={(value) => setStatus(value as SubjectStatus)}
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

          <AdminFormField id="description" label="Description">
            <textarea
              id="description"
              className="admin-form-input min-h-28 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this subject"
            />
          </AdminFormField>
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
