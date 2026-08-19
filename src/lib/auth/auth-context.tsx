"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { EnrollmentProgress, User } from "@/types";
import { authenticate, homePathForRole } from "@/lib/auth/static-users";
import {
  loadEnrollments,
  loadProgress,
  loadUser,
  saveEnrollments,
  saveProgress,
  saveUser,
} from "@/lib/auth/storage";
import { getCourseBySlug, mockCourses } from "@/lib/data/mock-courses";

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  enrollments: string[];
  progress: EnrollmentProgress[];
  login: (email: string, password: string) => { ok: true; redirectTo: string } | { ok: false; message: string };
  logout: () => void;
  enroll: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
  getProgress: (courseId: string) => EnrollmentProgress | null;
  markLessonComplete: (courseId: string, lessonId: string) => void;
  markQuizComplete: (courseId: string, quizId: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function calcPercent(courseId: string, completedLessonIds: string[], completedQuizIds: string[]) {
  const course = mockCourses.find((item) => item.id === courseId);
  if (!course) return 0;

  const lessonIds = course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
  const quizIds = [
    ...course.modules.map((module) => module.quiz?.id).filter(Boolean),
    course.courseQuiz?.id,
  ].filter(Boolean) as string[];

  const total = lessonIds.length + quizIds.length;
  if (total === 0) return 0;

  const done =
    lessonIds.filter((id) => completedLessonIds.includes(id)).length +
    quizIds.filter((id) => completedQuizIds.includes(id)).length;

  return Math.round((done / total) * 100);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [enrollments, setEnrollments] = useState<string[]>([]);
  const [progress, setProgress] = useState<EnrollmentProgress[]>([]);

  useEffect(() => {
    setUser(loadUser());
    setEnrollments(loadEnrollments());
    setProgress(loadProgress());
    setReady(true);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const nextUser = authenticate(email, password);
    if (!nextUser) {
      return { ok: false as const, message: "Invalid email or password." };
    }
    setUser(nextUser);
    saveUser(nextUser);
    return { ok: true as const, redirectTo: homePathForRole(nextUser.role) };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    saveUser(null);
  }, []);

  const enroll = useCallback((courseId: string) => {
    setEnrollments((prev) => {
      if (prev.includes(courseId)) return prev;
      const next = [...prev, courseId];
      saveEnrollments(next);
      return next;
    });
    setProgress((prev) => {
      if (prev.some((item) => item.courseId === courseId)) return prev;
      const next = [
        ...prev,
        {
          courseId,
          completedLessonIds: [],
          completedQuizIds: [],
          percent: 0,
        },
      ];
      saveProgress(next);
      return next;
    });
  }, []);

  const isEnrolled = useCallback(
    (courseId: string) => enrollments.includes(courseId),
    [enrollments],
  );

  const getProgress = useCallback(
    (courseId: string) => progress.find((item) => item.courseId === courseId) ?? null,
    [progress],
  );

  const updateProgress = useCallback(
    (
      courseId: string,
      updater: (current: EnrollmentProgress) => EnrollmentProgress,
    ) => {
      setProgress((prev) => {
        const existing = prev.find((item) => item.courseId === courseId) ?? {
          courseId,
          completedLessonIds: [],
          completedQuizIds: [],
          percent: 0,
        };
        const updated = updater(existing);
        updated.percent = calcPercent(
          courseId,
          updated.completedLessonIds,
          updated.completedQuizIds,
        );
        const next = [
          ...prev.filter((item) => item.courseId !== courseId),
          updated,
        ];
        saveProgress(next);
        return next;
      });
    },
    [],
  );

  const markLessonComplete = useCallback(
    (courseId: string, lessonId: string) => {
      updateProgress(courseId, (current) => ({
        ...current,
        completedLessonIds: current.completedLessonIds.includes(lessonId)
          ? current.completedLessonIds
          : [...current.completedLessonIds, lessonId],
      }));
    },
    [updateProgress],
  );

  const markQuizComplete = useCallback(
    (courseId: string, quizId: string) => {
      updateProgress(courseId, (current) => ({
        ...current,
        completedQuizIds: current.completedQuizIds.includes(quizId)
          ? current.completedQuizIds
          : [...current.completedQuizIds, quizId],
      }));
    },
    [updateProgress],
  );

  const value = useMemo(
    () => ({
      user,
      ready,
      enrollments,
      progress,
      login,
      logout,
      enroll,
      isEnrolled,
      getProgress,
      markLessonComplete,
      markQuizComplete,
    }),
    [
      user,
      ready,
      enrollments,
      progress,
      login,
      logout,
      enroll,
      isEnrolled,
      getProgress,
      markLessonComplete,
      markQuizComplete,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useCourseAccess(slug: string) {
  const { user, isEnrolled, getProgress } = useAuth();
  const course = getCourseBySlug(slug);
  const enrolled = course ? isEnrolled(course.id) : false;
  const progress = course ? getProgress(course.id) : null;

  return {
    course,
    enrolled,
    progress,
    canManage: user?.role === "admin" || user?.role === "super_admin",
    isStudent: user?.role === "student",
  };
}
