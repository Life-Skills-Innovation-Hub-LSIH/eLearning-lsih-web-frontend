import { apiRequest } from "@/shared/api/client";
import type { EnrollmentProgress } from "@/shared/types";

export type CatalogCourse = {
  id: number | string;
  title: string;
  slug: string;
  code?: string;
  short_description?: string | null;
  description?: string | null;
  cover_image?: string | null;
  level?: string | null;
  price?: number;
  status?: string;
  lecturer?: { id: number; name: string; title?: string | null } | null;
  subjects?: Array<{ id: number; name: string; slug: string }>;
  modules?: CatalogModule[];
  modules_count?: number;
};

export type CatalogLesson = {
  id: number | string;
  title: string;
  slug?: string;
  content_type: "video" | "text" | "file";
  body?: string | null;
  media_url?: string | null;
  duration_minutes?: number | null;
  position?: number;
};

export type CatalogQuizOption = {
  id: number | string;
  option_text: string;
  position?: number;
};

export type CatalogQuizQuestion = {
  id: number | string;
  question_text: string;
  type?: string;
  options: CatalogQuizOption[];
};

export type CatalogQuiz = {
  id: number | string;
  lesson_id?: number | string | null;
  title: string;
  pass_score: number;
  questions?: CatalogQuizQuestion[];
};

export type CatalogModule = {
  id: number | string;
  title: string;
  description?: string | null;
  lessons?: CatalogLesson[];
  quizzes?: CatalogQuiz[];
};

export type ProgressSummary = {
  percent: number;
  total_lessons: number;
  total_quizzes: number;
  completed_lessons: number;
  passed_quizzes: number;
  completed_lesson_ids: Array<number | string>;
  completed_quiz_ids: Array<number | string>;
};

export type EnrollmentCertificate = {
  id: number | string;
  certificate_number: string;
  issued_at?: string | null;
};

export type EnrollmentRecord = {
  id: number | string;
  user_id: number | string;
  course_id: number | string;
  status: string;
  enrolled_at?: string | null;
  completed_at?: string | null;
  course?: CatalogCourse;
  progress?: ProgressSummary;
  certificate_eligible?: boolean;
  certificate?: EnrollmentCertificate | null;
};

export type StudentCertificateRecord = {
  id: number | string;
  certificate_number: string;
  issued_at?: string | null;
  course_id: number | string;
  course?: {
    id: number | string;
    title: string;
    slug?: string;
    code?: string | null;
    cover_image?: string | null;
  } | null;
};

export type AdminStudentDetail = {
  student: {
    id: number | string;
    first_name: string;
    last_name: string;
    username: string;
    email?: string | null;
    avatar?: string | null;
    role: string;
    status: string;
    payment_duration?: string | null;
    subscription_starts_at?: string | null;
    subscription_expires_at?: string | null;
    subscription_active_days?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
  enrollments: EnrollmentRecord[];
  certificates: StudentCertificateRecord[];
  summary: {
    enrolled_courses: number;
    active_courses: number;
    completed_courses: number;
    certificates: number;
    average_progress: number;
  };
};

function unwrapList<T>(payload: { data?: T[] } | T[]): T[] {
  return Array.isArray(payload) ? payload : (payload.data ?? []);
}

function unwrapData<T>(payload: { data?: T } | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export function mapProgressSummary(
  courseId: string,
  summary?: ProgressSummary | null,
): EnrollmentProgress {
  return {
    courseId,
    completedLessonIds: (summary?.completed_lesson_ids ?? []).map(String),
    completedQuizIds: (summary?.completed_quiz_ids ?? []).map(String),
    percent: summary?.percent ?? 0,
  };
}

export type CatalogSubject = {
  id: number | string;
  name: string;
  slug: string;
  code?: string | null;
  description?: string | null;
  icon?: string | null;
  status?: string;
  courses_count?: number;
};

export async function fetchCatalogCourses(
  search?: string,
  options?: { subjectId?: string | number },
): Promise<CatalogCourse[]> {
  const params = new URLSearchParams();
  if (search?.trim()) params.set("search", search.trim());
  if (options?.subjectId != null && String(options.subjectId).trim() !== "") {
    params.set("subject_id", String(options.subjectId));
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  const payload = await apiRequest<{ data?: CatalogCourse[] } | CatalogCourse[]>(
    `/catalog/courses${query}`,
  );
  return unwrapList(payload);
}

export async function fetchCatalogSubjects(): Promise<CatalogSubject[]> {
  const payload = await apiRequest<{ data?: CatalogSubject[] } | CatalogSubject[]>(
    "/catalog/subjects",
  );
  return unwrapList(payload);
}

export async function fetchCatalogCourse(slugOrId: string): Promise<CatalogCourse> {
  const payload = await apiRequest<{ data?: CatalogCourse } | CatalogCourse>(
    `/catalog/courses/${encodeURIComponent(slugOrId)}`,
  );
  return unwrapData(payload);
}

export async function fetchMyEnrollments(token: string): Promise<EnrollmentRecord[]> {
  const payload = await apiRequest<{ data?: EnrollmentRecord[] } | EnrollmentRecord[]>(
    "/enrollments",
    { token },
  );
  return unwrapList(payload);
}

export async function enrollInCourseApi(
  token: string,
  courseId: string | number,
): Promise<EnrollmentRecord> {
  const payload = await apiRequest<{ data?: EnrollmentRecord } | EnrollmentRecord>(
    "/enrollments",
    {
      method: "POST",
      token,
      body: { course_id: Number(courseId) },
    },
  );
  return unwrapData(payload);
}

export async function fetchLearnCourse(token: string, slugOrId: string) {
  const payload = await apiRequest<{
    data: {
      course: CatalogCourse;
      modules: CatalogModule[];
      enrollment: EnrollmentRecord;
      progress: ProgressSummary;
    };
  }>(`/courses/${encodeURIComponent(slugOrId)}/learn`, { token });
  return payload.data;
}

export async function completeLessonApi(
  token: string,
  lessonId: string | number,
): Promise<{ progress: ProgressSummary }> {
  const payload = await apiRequest<{
    data: { progress: ProgressSummary };
  }>(`/lessons/${lessonId}/progress`, {
    method: "POST",
    token,
    body: { completed: true },
  });
  return payload.data;
}

export async function submitQuizAttemptApi(
  token: string,
  quizId: string | number,
  answers: Record<string, number | number[]>,
): Promise<{
  score_percent: number;
  passed: boolean;
  pass_score: number;
  progress: ProgressSummary;
}> {
  const payload = await apiRequest<{
    data: {
      score_percent: number;
      passed: boolean;
      pass_score: number;
      progress: ProgressSummary;
    };
  }>(`/quizzes/${quizId}/attempts`, {
    method: "POST",
    token,
    body: { answers },
  });
  return payload.data;
}

export async function fetchAdminEnrollments(
  token: string,
  params?: { userId?: string; courseId?: string },
): Promise<EnrollmentRecord[]> {
  const search = new URLSearchParams();
  if (params?.userId) search.set("user_id", params.userId);
  if (params?.courseId) search.set("course_id", params.courseId);
  const query = search.toString() ? `?${search.toString()}` : "";
  const payload = await apiRequest<{ data?: EnrollmentRecord[] } | EnrollmentRecord[]>(
    `/admin/enrollments${query}`,
    { token },
  );
  return unwrapList(payload);
}

export async function fetchStudentProgressAdmin(
  token: string,
  userId: string,
): Promise<AdminStudentDetail> {
  const payload = await apiRequest<{ data: AdminStudentDetail }>(
    `/admin/students/${userId}/progress`,
    { token },
  );
  return payload.data;
}

export async function fetchCertificateStatus(
  token: string,
  courseIdOrSlug: string | number,
): Promise<{
  eligible: boolean;
  issued: boolean;
  certificate_number?: string | null;
  issued_at?: string | null;
}> {
  const payload = await apiRequest<{
    data: {
      eligible: boolean;
      issued: boolean;
      certificate_number?: string | null;
      issued_at?: string | null;
    };
  }>(`/certificates/course/${encodeURIComponent(String(courseIdOrSlug))}`, { token });
  return payload.data;
}

export async function downloadCourseCertificatePdf(
  token: string,
  courseIdOrSlug: string | number,
  courseTitle?: string,
): Promise<void> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
  const response = await fetch(
    `${API_URL}/certificates/course/${encodeURIComponent(String(courseIdOrSlug))}/pdf`,
    {
      method: "GET",
      headers: {
        Accept: "application/pdf",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `Failed to download certificate (${response.status})`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const slug = (courseTitle || String(courseIdOrSlug))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  anchor.href = url;
  anchor.download = `certificate-${slug || "course"}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
