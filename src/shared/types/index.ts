export type Role = "guest" | "student" | "admin" | "super_admin";

export type UserPaymentStatus = "paid" | "unpaid";
export type PaymentDuration = "1_year";

export interface ManagedUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: Exclude<Role, "guest">;
  status: UserPaymentStatus;
  paymentDuration: PaymentDuration;
  createdAt: string;
}

export type LessonType = "video" | "pdf";

export type QuizLevel = "module" | "course";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface User {
  id: string;
  name: string;
  email: string;
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
