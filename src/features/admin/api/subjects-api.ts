import { apiRequest } from "@/shared/api/client";
import type { Subject, SubjectStatus } from "@/shared/types";

type ApiSubject = {
  id: number | string;
  name: string;
  slug: string;
  code?: string | null;
  description?: string | null;
  icon?: string | null;
  status: SubjectStatus;
  courses_count?: number;
  lecturers_count?: number;
  created_at: string;
  updated_at?: string;
};

export type SubjectFormInput = {
  name: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  status?: SubjectStatus;
};

function mapSubject(subject: ApiSubject): Subject {
  return {
    id: String(subject.id),
    name: subject.name,
    slug: subject.slug,
    code: subject.code ?? null,
    description: subject.description ?? null,
    icon: subject.icon ?? null,
    status: subject.status,
    coursesCount: subject.courses_count ?? 0,
    lecturersCount: subject.lecturers_count ?? 0,
    createdAt: subject.created_at,
    updatedAt: subject.updated_at,
  };
}

export async function fetchSubjects(
  token: string,
  filters?: { status?: string; search?: string },
): Promise<Subject[]> {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== "all") params.set("status", filters.status);
  if (filters?.search?.trim()) params.set("search", filters.search.trim());
  const query = params.toString();

  const response = await apiRequest<{ data: ApiSubject[] }>(
    `/admin/subjects${query ? `?${query}` : ""}`,
    { token },
  );
  return (response.data ?? []).map(mapSubject);
}

export async function fetchSubject(token: string, id: string): Promise<Subject> {
  const response = await apiRequest<{ data: ApiSubject }>(`/admin/subjects/${id}`, { token });
  return mapSubject(response.data);
}

export async function createSubjectApi(
  token: string,
  input: SubjectFormInput,
): Promise<Subject> {
  const response = await apiRequest<{ data: ApiSubject }>("/admin/subjects", {
    method: "POST",
    token,
    body: {
      name: input.name,
      description: input.description?.trim() || null,
      icon: input.icon?.trim() || null,
      status: input.status ?? "active",
    },
  });
  return mapSubject(response.data);
}

export async function updateSubjectApi(
  token: string,
  id: string,
  input: SubjectFormInput,
): Promise<Subject> {
  const response = await apiRequest<{ data: ApiSubject }>(`/admin/subjects/${id}`, {
    method: "PUT",
    token,
    body: {
      name: input.name,
      description: input.description?.trim() || null,
      icon: input.icon?.trim() || null,
      status: input.status ?? "active",
    },
  });
  return mapSubject(response.data);
}

export async function deleteSubjectApi(token: string, id: string): Promise<void> {
  await apiRequest(`/admin/subjects/${id}`, {
    method: "DELETE",
    token,
  });
}
