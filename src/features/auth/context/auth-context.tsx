"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { EnrollmentProgress, User } from "@/shared/types";
import { ApiError } from "@/shared/api/client";
import { fetchCurrentUser, loginWithApi, logoutWithApi, mapAuthUser } from "../api/auth-api";
import { homePathForRole } from "../lib/static-users";
import {
  loadEnrollments,
  loadProgress,
  loadToken,
  saveEnrollments,
  saveProgress,
  saveToken,
  saveUser,
} from "../lib/storage";
import { getCourseBySlug, mockCourses } from "@/features/courses";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  ready: boolean;
  enrollments: string[];
  progress: EnrollmentProgress[];
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: true; redirectTo: string } | { ok: false; message: string }>;
  applySession: (result: { token: string; expires_at: string; user: Parameters<typeof mapAuthUser>[0] }) => string;
  refreshUser: () => Promise<void>;
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
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [enrollments, setEnrollments] = useState<string[]>([]);
  const [progress, setProgress] = useState<EnrollmentProgress[]>([]);

  useEffect(() => {
    async function restoreSession() {
      const savedToken = loadToken();
      if (!savedToken) {
        saveUser(null);
        setUser(null);
        setToken(null);
        setEnrollments(loadEnrollments());
        setProgress(loadProgress());
        setReady(true);
        return;
      }

      try {
        const nextUser = await fetchCurrentUser(savedToken);
        setToken(savedToken);
        setUser(nextUser);
        saveUser(nextUser);
      } catch {
        saveToken(null);
        saveUser(null);
        setToken(null);
        setUser(null);
      }

      setEnrollments(loadEnrollments());
      setProgress(loadProgress());
      setReady(true);
    }

    void restoreSession();
  }, []);

  const applySession = useCallback(
    (result: { token: string; expires_at: string; user: Parameters<typeof mapAuthUser>[0] }) => {
      const nextUser = mapAuthUser(result.user);
      setUser(nextUser);
      setToken(result.token);
      saveUser(nextUser);
      saveToken(result.token, result.expires_at);
      return homePathForRole(nextUser.role);
    },
    [],
  );

  const refreshUser = useCallback(async () => {
    const savedToken = loadToken();
    if (!savedToken) {
      return;
    }

    const nextUser = await fetchCurrentUser(savedToken);
    setUser(nextUser);
    saveUser(nextUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await loginWithApi(email, password);
        return { ok: true as const, redirectTo: applySession(result) };
      } catch (error) {
        const message =
          error instanceof ApiError
            ? Object.values(error.body?.errors ?? {})[0]?.[0] ?? error.message
            : "Invalid username or password.";
        return { ok: false as const, message };
      }
    },
    [applySession],
  );

  const logout = useCallback(() => {
    const currentToken = token ?? loadToken();
    if (currentToken) {
      void logoutWithApi(currentToken).catch(() => undefined);
    }
    setUser(null);
    setToken(null);
    saveUser(null);
    saveToken(null);
  }, [token]);

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
      token,
      ready,
      enrollments,
      progress,
      login,
      applySession,
      refreshUser,
      logout,
      enroll,
      isEnrolled,
      getProgress,
      markLessonComplete,
      markQuizComplete,
    }),
    [
      user,
      token,
      ready,
      enrollments,
      progress,
      login,
      applySession,
      refreshUser,
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
    canManage: user?.role === "admin",
    isStudent: user?.role === "student",
  };
}
