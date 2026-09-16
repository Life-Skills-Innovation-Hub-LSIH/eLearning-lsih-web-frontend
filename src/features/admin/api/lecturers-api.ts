import { apiRequest } from "@/shared/api/client";
import { normalizeEmail } from "@/shared/lib/email";
import type { Lecturer, LecturerStatus } from "@/shared/types";

type ApiLecturerSubject = {
  id: number | string;
  name: string;
  code?: string | null;
  slug: string;
};

type ApiLecturer = {
  id: number | string;
  name: string;
  title?: string | null;
  slug: string;
  code?: string | null;
  email?: string | null;
  avatar?: string | null;
  bio?: string | null;
  status: LecturerStatus;
  subject_ids?: Array<number | string>;
  subjects?: ApiLecturerSubject[];
  created_at: string;
  updated_at?: string;
};

export type LecturerFormInput = {
  name: string;
  title?: string | null;
  slug?: string;
  email?: string | null;
  avatar?: string | null;
  bio?: string | null;
  status?: LecturerStatus;
  subjectIds?: string[];
};

function mapLecturer(lecturer: ApiLecturer): Lecturer {
  const subjects = (lecturer.subjects ?? []).map((subject) => ({
    id: String(subject.id),
    name: subject.name,
    code: subject.code ?? null,
    slug: subject.slug,
  }));

  return {
    id: String(lecturer.id),
    name: lecturer.name,
    title: lecturer.title ?? null,
    slug: lecturer.slug,
    code: lecturer.code ?? null,
    email: lecturer.email ?? null,
    avatar: lecturer.avatar ?? null,
    bio: lecturer.bio ?? null,
    status: lecturer.status,
    subjectIds: (lecturer.subject_ids ?? subjects.map((s) => s.id)).map(String),
    subjects,
    createdAt: lecturer.created_at,
    updatedAt: lecturer.updated_at,
  };
}

export async function fetchLecturers(
  token: string,
  filters?: { status?: string; search?: string; subjectId?: string },
): Promise<Lecturer[]> {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== "all") params.set("status", filters.status);
  if (filters?.search?.trim()) params.set("search", filters.search.trim());
  if (filters?.subjectId) params.set("subject_id", filters.subjectId);
  const query = params.toString();

  const response = await apiRequest<{ data: ApiLecturer[] }>(
    `/admin/lecturers${query ? `?${query}` : ""}`,
    { token },
  );
  return (response.data ?? []).map(mapLecturer);
}

export async function fetchLecturer(token: string, id: string): Promise<Lecturer> {
  const response = await apiRequest<{ data: ApiLecturer }>(`/admin/lecturers/${id}`, { token });
  return mapLecturer(response.data);
}

function bodyFromInput(input: LecturerFormInput) {
  return {
    name: input.name,
    title: input.title?.trim() || null,
    email: input.email ? normalizeEmail(input.email) || null : null,
    avatar: input.avatar?.trim() || null,
    bio: input.bio?.trim() || null,
    status: input.status ?? "active",
    subject_ids: (input.subjectIds ?? []).map((id) => Number(id)),
  };
}

export async function createLecturerApi(
  token: string,
  input: LecturerFormInput,
): Promise<Lecturer> {
  const response = await apiRequest<{ data: ApiLecturer }>("/admin/lecturers", {
    method: "POST",
    token,
    body: bodyFromInput(input),
  });
  return mapLecturer(response.data);
}

export async function updateLecturerApi(
  token: string,
  id: string,
  input: LecturerFormInput,
): Promise<Lecturer> {
  const response = await apiRequest<{ data: ApiLecturer }>(`/admin/lecturers/${id}`, {
    method: "PUT",
    token,
    body: bodyFromInput(input),
  });
  return mapLecturer(response.data);
}

export async function deleteLecturerApi(token: string, id: string): Promise<void> {
  await apiRequest(`/admin/lecturers/${id}`, {
    method: "DELETE",
    token,
  });
}
