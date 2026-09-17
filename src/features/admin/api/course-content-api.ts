import { apiRequest } from "@/shared/api/client";
import type {
  CoursePublishStatus,
  LessonContentType,
  ManagedLesson,
  ManagedModule,
  ManagedQuiz,
  ManagedQuizQuestion,
  QuizQuestionType,
} from "@/shared/types";

type ApiLesson = {
  id: number | string;
  module_id: number | string;
  title: string;
  slug: string;
  content_type: LessonContentType;
  body?: string | null;
  media_url?: string | null;
  duration_minutes?: number | null;
  position: number;
  status: CoursePublishStatus;
  created_at: string;
  updated_at?: string;
};

type ApiQuizOption = {
  id?: number | string;
  option_text: string;
  is_correct: boolean;
  position: number;
};

type ApiQuizQuestion = {
  id?: number | string;
  question_text: string;
  type: QuizQuestionType;
  position: number;
  options?: ApiQuizOption[];
};

type ApiQuiz = {
  id: number | string;
  module_id: number | string;
  lesson_id?: number | string | null;
  title: string;
  slug: string;
  description?: string | null;
  pass_score: number;
  position: number;
  status: CoursePublishStatus;
  questions_count?: number;
  questions?: ApiQuizQuestion[];
  created_at: string;
  updated_at?: string;
};

type ApiModule = {
  id: number | string;
  course_id: number | string;
  title: string;
  slug: string;
  description?: string | null;
  position: number;
  status: CoursePublishStatus;
  lessons_count?: number;
  quizzes_count?: number;
  lessons?: ApiLesson[];
  quizzes?: ApiQuiz[];
  created_at: string;
  updated_at?: string;
};

export type ModuleFormInput = {
  title: string;
  description?: string | null;
  position?: number;
  status?: CoursePublishStatus;
};

export type LessonFormInput = {
  title: string;
  contentType?: LessonContentType;
  body?: string | null;
  mediaUrl?: string | null;
  durationMinutes?: number | null;
  position?: number;
  status?: CoursePublishStatus;
};

export type QuizFormInput = {
  title: string;
  description?: string | null;
  lessonId?: string | null;
  passScore?: number;
  position?: number;
  status?: CoursePublishStatus;
  questions?: ManagedQuizQuestion[];
};

function mapLesson(lesson: ApiLesson): ManagedLesson {
  return {
    id: String(lesson.id),
    moduleId: String(lesson.module_id),
    title: lesson.title,
    slug: lesson.slug,
    contentType: lesson.content_type,
    body: lesson.body ?? null,
    mediaUrl: lesson.media_url ?? null,
    durationMinutes: lesson.duration_minutes ?? null,
    position: lesson.position,
    status: lesson.status,
    createdAt: lesson.created_at,
    updatedAt: lesson.updated_at,
  };
}

function mapQuiz(quiz: ApiQuiz): ManagedQuiz {
  return {
    id: String(quiz.id),
    moduleId: String(quiz.module_id),
    lessonId: quiz.lesson_id != null ? String(quiz.lesson_id) : null,
    title: quiz.title,
    slug: quiz.slug,
    description: quiz.description ?? null,
    passScore: quiz.pass_score,
    position: quiz.position,
    status: quiz.status,
    questionsCount: quiz.questions_count,
    questions: (quiz.questions ?? []).map((question) => ({
      id: question.id != null ? String(question.id) : undefined,
      questionText: question.question_text,
      type: question.type,
      position: question.position,
      options: (question.options ?? []).map((option) => ({
        id: option.id != null ? String(option.id) : undefined,
        optionText: option.option_text,
        isCorrect: Boolean(option.is_correct),
        position: option.position,
      })),
    })),
    createdAt: quiz.created_at,
    updatedAt: quiz.updated_at,
  };
}

function mapModule(module: ApiModule): ManagedModule {
  return {
    id: String(module.id),
    courseId: String(module.course_id),
    title: module.title,
    slug: module.slug,
    description: module.description ?? null,
    position: module.position,
    status: module.status,
    lessonsCount: module.lessons_count,
    quizzesCount: module.quizzes_count,
    lessons: module.lessons?.map(mapLesson),
    quizzes: module.quizzes?.map(mapQuiz),
    createdAt: module.created_at,
    updatedAt: module.updated_at,
  };
}

function questionsBody(questions?: ManagedQuizQuestion[]) {
  if (!questions) return undefined;
  return questions.map((question, index) => ({
    question_text: question.questionText,
    type: question.type,
    position: question.position || index + 1,
    options: question.options.map((option, optionIndex) => ({
      option_text: option.optionText,
      is_correct: option.isCorrect,
      position: option.position || optionIndex + 1,
    })),
  }));
}

export async function fetchCourseModules(
  token: string,
  courseId: string,
  withContent = true,
): Promise<ManagedModule[]> {
  const query = withContent ? "?with_content=1" : "";
  const response = await apiRequest<{ data: ApiModule[] }>(
    `/admin/courses/${courseId}/modules${query}`,
    { token },
  );
  return (response.data ?? []).map(mapModule);
}

export async function createModuleApi(
  token: string,
  courseId: string,
  input: ModuleFormInput,
): Promise<ManagedModule> {
  const response = await apiRequest<{ data: ApiModule }>(`/admin/courses/${courseId}/modules`, {
    method: "POST",
    token,
    body: {
      title: input.title,
      description: input.description?.trim() || null,
      position: input.position,
      status: input.status ?? "published",
    },
  });
  return mapModule(response.data);
}

export async function updateModuleApi(
  token: string,
  moduleId: string,
  input: ModuleFormInput,
): Promise<ManagedModule> {
  const response = await apiRequest<{ data: ApiModule }>(`/admin/modules/${moduleId}`, {
    method: "PUT",
    token,
    body: {
      title: input.title,
      description: input.description?.trim() || null,
      position: input.position,
      status: input.status ?? "published",
    },
  });
  return mapModule(response.data);
}

export async function deleteModuleApi(token: string, moduleId: string): Promise<void> {
  await apiRequest(`/admin/modules/${moduleId}`, { method: "DELETE", token });
}

export async function createLessonApi(
  token: string,
  moduleId: string,
  input: LessonFormInput,
): Promise<ManagedLesson> {
  const response = await apiRequest<{ data: ApiLesson }>(`/admin/modules/${moduleId}/lessons`, {
    method: "POST",
    token,
    body: {
      title: input.title,
      content_type: input.contentType ?? "text",
      body: input.body?.trim() || null,
      media_url: input.mediaUrl?.trim() || null,
      duration_minutes: input.durationMinutes ?? null,
      position: input.position,
      status: input.status ?? "published",
    },
  });
  return mapLesson(response.data);
}

export async function updateLessonApi(
  token: string,
  lessonId: string,
  input: LessonFormInput,
): Promise<ManagedLesson> {
  const response = await apiRequest<{ data: ApiLesson }>(`/admin/lessons/${lessonId}`, {
    method: "PUT",
    token,
    body: {
      title: input.title,
      content_type: input.contentType ?? "text",
      body: input.body?.trim() || null,
      media_url: input.mediaUrl?.trim() || null,
      duration_minutes: input.durationMinutes ?? null,
      position: input.position,
      status: input.status ?? "published",
    },
  });
  return mapLesson(response.data);
}

export async function deleteLessonApi(token: string, lessonId: string): Promise<void> {
  await apiRequest(`/admin/lessons/${lessonId}`, { method: "DELETE", token });
}

export async function createQuizApi(
  token: string,
  moduleId: string,
  input: QuizFormInput,
): Promise<ManagedQuiz> {
  const response = await apiRequest<{ data: ApiQuiz }>(`/admin/modules/${moduleId}/quizzes`, {
    method: "POST",
    token,
    body: {
      title: input.title,
      description: input.description?.trim() || null,
      lesson_id: input.lessonId ? Number(input.lessonId) : null,
      pass_score: input.passScore ?? 70,
      position: input.position,
      status: input.status ?? "published",
      questions: questionsBody(input.questions),
    },
  });
  return mapQuiz(response.data);
}

export async function updateQuizApi(
  token: string,
  quizId: string,
  input: QuizFormInput,
): Promise<ManagedQuiz> {
  const response = await apiRequest<{ data: ApiQuiz }>(`/admin/quizzes/${quizId}`, {
    method: "PUT",
    token,
    body: {
      title: input.title,
      description: input.description?.trim() || null,
      lesson_id: input.lessonId ? Number(input.lessonId) : null,
      pass_score: input.passScore ?? 70,
      position: input.position,
      status: input.status ?? "published",
      questions: questionsBody(input.questions),
    },
  });
  return mapQuiz(response.data);
}

export async function deleteQuizApi(token: string, quizId: string): Promise<void> {
  await apiRequest(`/admin/quizzes/${quizId}`, { method: "DELETE", token });
}
