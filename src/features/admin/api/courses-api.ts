import { apiRequest } from "@/shared/api/client";
import type { CourseLevel, CoursePublishStatus, ManagedCourse } from "@/shared/types";

type ApiCourseSubject = {
  id: number | string;
  name: string;
  code?: string | null;
  slug: string;
};

type ApiCourseLecturer = {
  id: number | string;
  name: string;
  code?: string | null;
  slug: string;
};

type ApiCourse = {
  id: number | string;
  title: string;
  slug: string;
  code?: string | null;
  short_description?: string | null;
  description?: string | null;
  cover_image?: string | null;
  level?: CourseLevel | null;
  price?: number | string;
  status: CoursePublishStatus;
  lecturer_id?: number | string | null;
  lecturer?: ApiCourseLecturer | null;
  subject_ids?: Array<number | string>;
  subjects?: ApiCourseSubject[];
  modules_count?: number;
  lessons_count?: number;
  quizzes_count?: number;
  created_at: string;
  updated_at?: string;
};

export type CourseFormInput = {
  title: string;
  slug?: string;
  shortDescription?: string | null;
  description?: string | null;
  coverImage?: string | null;
  level?: CourseLevel | null;
  price?: number;
  status?: CoursePublishStatus;
  lecturerId?: string | null;
  subjectIds?: string[];
};

function mapCourse(course: ApiCourse): ManagedCourse {
  const subjects = (course.subjects ?? []).map((subject) => ({
    id: String(subject.id),
    name: subject.name,
    code: subject.code ?? null,
    slug: subject.slug,
  }));

  return {
    id: String(course.id),
    title: course.title,
    slug: course.slug,
    code: course.code ?? null,
    shortDescription: course.short_description ?? null,
    description: course.description ?? null,
    coverImage: course.cover_image ?? null,
    level: course.level ?? null,
    price: Number(course.price ?? 0),
    status: course.status,
    lecturerId: course.lecturer_id != null ? String(course.lecturer_id) : null,
    lecturer: course.lecturer
      ? {
          id: String(course.lecturer.id),
          name: course.lecturer.name,
          code: course.lecturer.code ?? null,
          slug: course.lecturer.slug,
        }
      : null,
    subjectIds: (course.subject_ids ?? subjects.map((s) => s.id)).map(String),
    subjects,
    modulesCount: course.modules_count ?? 0,
    lessonsCount: course.lessons_count ?? 0,
    quizzesCount: course.quizzes_count ?? 0,
    createdAt: course.created_at,
    updatedAt: course.updated_at,
  };
}

function bodyFromInput(input: CourseFormInput) {
  return {
    title: input.title,
    short_description: input.shortDescription?.trim() || null,
    description: input.description?.trim() || null,
    cover_image: input.coverImage?.trim() || null,
    level: input.level || null,
      status: input.status ?? "published",
    lecturer_id: input.lecturerId ? Number(input.lecturerId) : null,
    subject_ids: (input.subjectIds ?? []).map((id) => Number(id)),
  };
}

export async function fetchCourses(
  token: string,
  filters?: { status?: string; search?: string; subjectId?: string; lecturerId?: string },
): Promise<ManagedCourse[]> {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== "all") params.set("status", filters.status);
  if (filters?.search?.trim()) params.set("search", filters.search.trim());
  if (filters?.subjectId) params.set("subject_id", filters.subjectId);
  if (filters?.lecturerId) params.set("lecturer_id", filters.lecturerId);
  const query = params.toString();

  const response = await apiRequest<{ data: ApiCourse[] }>(
    `/admin/courses${query ? `?${query}` : ""}`,
    { token },
  );
  return (response.data ?? []).map(mapCourse);
}

export async function fetchCourse(token: string, id: string): Promise<ManagedCourse> {
  const response = await apiRequest<{ data: ApiCourse }>(`/admin/courses/${id}`, { token });
  return mapCourse(response.data);
}

export async function createCourseApi(
  token: string,
  input: CourseFormInput,
): Promise<ManagedCourse> {
  const response = await apiRequest<{ data: ApiCourse }>("/admin/courses", {
    method: "POST",
    token,
    body: bodyFromInput(input),
  });
  return mapCourse(response.data);
}

export async function updateCourseApi(
  token: string,
  id: string,
  input: CourseFormInput,
): Promise<ManagedCourse> {
  const response = await apiRequest<{ data: ApiCourse }>(`/admin/courses/${id}`, {
    method: "PUT",
    token,
    body: bodyFromInput(input),
  });
  return mapCourse(response.data);
}

export async function deleteCourseApi(token: string, id: string): Promise<void> {
  await apiRequest(`/admin/courses/${id}`, {
    method: "DELETE",
    token,
  });
}
