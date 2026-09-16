export type Role = "guest" | "student" | "admin";

export type UserPaymentStatus = "paid" | "unpaid";
export type PaymentDuration = "1_year";

export interface ManagedUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar?: string | null;
  role: Exclude<Role, "guest">;
  status: UserPaymentStatus;
  paymentDuration?: PaymentDuration | null;
  subscriptionStartsAt?: string | null;
  subscriptionExpiresAt?: string | null;
  subscriptionActiveDays?: number | null;
  createdAt: string;
}

export type LessonType = "video" | "pdf";

export type LessonContentType = "video" | "text" | "file";

export type QuizLevel = "module" | "course";

export type QuizQuestionType = "multiple_choice" | "true_false";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type CoursePublishStatus = "draft" | "published";

export interface ManagedCourse {
  id: string;
  title: string;
  slug: string;
  code: string | null;
  shortDescription: string | null;
  description: string | null;
  coverImage?: string | null;
  level: CourseLevel | null;
  price: number;
  status: CoursePublishStatus;
  lecturerId: string | null;
  lecturer?: {
    id: string;
    name: string;
    code: string | null;
    slug: string;
  } | null;
  subjectIds?: string[];
  subjects?: Array<{
    id: string;
    name: string;
    code: string | null;
    slug: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

export interface ManagedLesson {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  contentType: LessonContentType;
  body: string | null;
  mediaUrl: string | null;
  durationMinutes: number | null;
  position: number;
  status: CoursePublishStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface ManagedQuizOption {
  id?: string;
  optionText: string;
  isCorrect: boolean;
  position: number;
}

export interface ManagedQuizQuestion {
  id?: string;
  questionText: string;
  type: QuizQuestionType;
  position: number;
  options: ManagedQuizOption[];
}

export interface ManagedQuiz {
  id: string;
  moduleId: string;
  lessonId: string | null;
  title: string;
  slug: string;
  description: string | null;
  passScore: number;
  position: number;
  status: CoursePublishStatus;
  questionsCount?: number;
  questions?: ManagedQuizQuestion[];
  createdAt: string;
  updatedAt?: string;
}

export interface ManagedModule {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  description: string | null;
  position: number;
  status: CoursePublishStatus;
  lessonsCount?: number;
  quizzesCount?: number;
  lessons?: ManagedLesson[];
  quizzes?: ManagedQuiz[];
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  avatar?: string | null;
  role: Exclude<Role, "guest">;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  durationMinutes: number;
  isFreePreview: boolean;
  /** Mock media path / URL */
  mediaUrl: string;
  order: number;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  level: QuizLevel;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  quiz: Quiz | null;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  price: number;
  status: "draft" | "published";
  thumbnailGradient: string;
  modules: Module[];
  courseQuiz: Quiz | null;
  studentsCount: number;
  /** Display fields adapted from template */
  instructor: string;
  level: CourseLevel;
  rating: number;
  whatYouWillLearn: string[];
}

export interface EnrollmentProgress {
  courseId: string;
  completedLessonIds: string[];
  completedQuizIds: string[];
  percent: number;
}

export type SubjectStatus = "active" | "inactive";

export interface Subject {
  id: string;
  name: string;
  slug: string;
  code: string | null;
  description: string | null;
  icon?: string | null;
  status: SubjectStatus;
  coursesCount?: number;
  lecturersCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export type LecturerStatus = "active" | "inactive";

export interface Lecturer {
  id: string;
  name: string;
  title: string | null;
  slug: string;
  code: string | null;
  email: string | null;
  avatar?: string | null;
  bio: string | null;
  status: LecturerStatus;
  subjectIds?: string[];
  subjects?: Array<{
    id: string;
    name: string;
    code: string | null;
    slug: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}
