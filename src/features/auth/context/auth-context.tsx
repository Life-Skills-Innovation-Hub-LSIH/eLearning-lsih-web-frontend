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
  loadToken,
  saveToken,
  saveUser,
} from "../lib/storage";
import {
  completeLessonApi,
  enrollInCourseApi,
  fetchMyEnrollments,
  mapProgressSummary,
  submitQuizAttemptApi,
  type EnrollmentRecord,
  type ProgressSummary,
} from "@/features/learning/api/enrollment-api";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  ready: boolean;
  enrollments: string[];
  enrollmentRecords: EnrollmentRecord[];
  progress: EnrollmentProgress[];
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: true; redirectTo: string } | { ok: false; message: string }>;
  applySession: (result: {
    token: string;
    expires_at: string;
    user: Parameters<typeof mapAuthUser>[0];
  }) => string;
  refreshUser: () => Promise<void>;
  refreshEnrollments: () => Promise<void>;
  logout: () => void;
  enroll: (courseId: string) => Promise<EnrollmentRecord>;
  isEnrolled: (courseId: string) => boolean;
  getProgress: (courseId: string) => EnrollmentProgress | null;
  markLessonComplete: (courseId: string, lessonId: string) => Promise<ProgressSummary | null>;
  markQuizComplete: (
    courseId: string,
    quizId: string,
    answers: Record<string, number | number[]>,
  ) => Promise<{
    score_percent: number;
    passed: boolean;
    pass_score: number;
    progress: ProgressSummary;
  }>;
  applyProgressSummary: (courseId: string, summary: ProgressSummary) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function recordsToState(records: EnrollmentRecord[]) {
  const enrollments = records.map((item) => String(item.course_id));
  const progress = records.map((item) =>
    mapProgressSummary(String(item.course_id), item.progress),
  );
  return { enrollments, progress };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [enrollmentRecords, setEnrollmentRecords] = useState<EnrollmentRecord[]>([]);
  const [enrollments, setEnrollments] = useState<string[]>([]);
  const [progress, setProgress] = useState<EnrollmentProgress[]>([]);

  const applyEnrollmentRecords = useCallback((records: EnrollmentRecord[]) => {
    setEnrollmentRecords(records);
    const next = recordsToState(records);
    setEnrollments(next.enrollments);
    setProgress(next.progress);
  }, []);

  const refreshEnrollments = useCallback(async () => {
    const savedToken = token ?? loadToken();
    if (!savedToken) {
      applyEnrollmentRecords([]);
      return;
    }
    const records = await fetchMyEnrollments(savedToken);
    applyEnrollmentRecords(records);
  }, [applyEnrollmentRecords, token]);

  useEffect(() => {
    async function restoreSession() {
      const savedToken = loadToken();
      if (!savedToken) {
        saveUser(null);
        setUser(null);
        setToken(null);
        applyEnrollmentRecords([]);
        setReady(true);
        return;
      }

      try {
        const nextUser = await fetchCurrentUser(savedToken);
        setToken(savedToken);
        setUser(nextUser);
        saveUser(nextUser);
        if (nextUser.role === "student") {
          const records = await fetchMyEnrollments(savedToken);
          applyEnrollmentRecords(records);
        } else {
          applyEnrollmentRecords([]);
        }
      } catch {
        saveToken(null);
        saveUser(null);
        setToken(null);
        setUser(null);
        applyEnrollmentRecords([]);
      }

      setReady(true);
    }

    void restoreSession();
  }, [applyEnrollmentRecords]);

  const applySession = useCallback(
    (result: {
      token: string;
      expires_at: string;
      user: Parameters<typeof mapAuthUser>[0];
    }) => {
      const nextUser = mapAuthUser(result.user);
      setUser(nextUser);
      setToken(result.token);
      saveUser(nextUser);
      saveToken(result.token, result.expires_at);
      if (nextUser.role === "student") {
        void fetchMyEnrollments(result.token)
          .then(applyEnrollmentRecords)
          .catch(() => applyEnrollmentRecords([]));
      } else {
        applyEnrollmentRecords([]);
      }
      return homePathForRole(nextUser.role);
    },
    [applyEnrollmentRecords],
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
    applyEnrollmentRecords([]);
  }, [applyEnrollmentRecords, token]);

  const applyProgressSummary = useCallback((courseId: string, summary: ProgressSummary) => {
    setProgress((prev) => {
      const mapped = mapProgressSummary(courseId, summary);
      return [...prev.filter((item) => item.courseId !== courseId), mapped];
    });
    setEnrollmentRecords((prev) =>
      prev.map((item) =>
        String(item.course_id) === courseId ? { ...item, progress: summary } : item,
      ),
    );
  }, []);

  const enroll = useCallback(
    async (courseId: string) => {
      const savedToken = token ?? loadToken();
      if (!savedToken) {
        throw new Error("Please log in to enroll.");
      }

      const record = await enrollInCourseApi(savedToken, courseId);
      setEnrollmentRecords((prev) => {
        const without = prev.filter((item) => String(item.course_id) !== String(courseId));
        return [record, ...without];
      });
      setEnrollments((prev) =>
        prev.includes(String(courseId)) ? prev : [...prev, String(courseId)],
      );
      applyProgressSummary(
        String(courseId),
        record.progress ?? {
          percent: 0,
          total_lessons: 0,
          total_quizzes: 0,
          completed_lessons: 0,
          passed_quizzes: 0,
          completed_lesson_ids: [],
          completed_quiz_ids: [],
        },
      );
      return record;
    },
    [applyProgressSummary, token],
  );

  const isEnrolled = useCallback(
    (courseId: string) => enrollments.includes(String(courseId)),
    [enrollments],
  );

  const getProgress = useCallback(
    (courseId: string) =>
      progress.find((item) => item.courseId === String(courseId)) ?? null,
    [progress],
  );

  const markLessonComplete = useCallback(
    async (courseId: string, lessonId: string) => {
      const savedToken = token ?? loadToken();
      if (!savedToken) return null;
      const result = await completeLessonApi(savedToken, lessonId);
      applyProgressSummary(String(courseId), result.progress);
      return result.progress;
    },
    [applyProgressSummary, token],
  );

  const markQuizComplete = useCallback(
    async (
      courseId: string,
      quizId: string,
      answers: Record<string, number | number[]>,
    ) => {
      const savedToken = token ?? loadToken();
      if (!savedToken) {
        throw new Error("Please log in again.");
      }
      const result = await submitQuizAttemptApi(savedToken, quizId, answers);
      applyProgressSummary(String(courseId), result.progress);
      return result;
    },
    [applyProgressSummary, token],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      ready,
      enrollments,
      enrollmentRecords,
      progress,
      login,
      applySession,
      refreshUser,
      refreshEnrollments,
      logout,
      enroll,
      isEnrolled,
      getProgress,
      markLessonComplete,
      markQuizComplete,
      applyProgressSummary,
    }),
    [
      user,
      token,
      ready,
      enrollments,
      enrollmentRecords,
      progress,
      login,
      applySession,
      refreshUser,
      refreshEnrollments,
      logout,
      enroll,
      isEnrolled,
      getProgress,
      markLessonComplete,
      markQuizComplete,
      applyProgressSummary,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
