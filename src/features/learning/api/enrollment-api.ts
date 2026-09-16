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

export type EnrollmentRecord = {
  id: number | string;
  user_id: number | string;
  course_id: number | string;
  status: string;
  enrolled_at?: string | null;
  completed_at?: string | null;
  course?: CatalogCourse;
  progress?: ProgressSummary;
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

export async function fetchCatalogCourses(search?: string): Promise<CatalogCourse[]> {
  const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  const payload = await apiRequest<{ data?: CatalogCourse[] } | CatalogCourse[]>(
    `/catalog/courses${query}`,
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

export async function fetchStudentProgressAdmin(token: string, userId: string) {
  const payload = await apiRequest<{
    data: {
      student: { id: number; name: string; email: string; status: string };
      enrollments: EnrollmentRecord[];
    };
  }>(`/admin/students/${userId}/progress`, { token });
  return payload.data;
}
