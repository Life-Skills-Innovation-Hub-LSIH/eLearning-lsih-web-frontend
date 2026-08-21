import type { EnrollmentProgress, User } from "@/shared/types";

const USER_KEY = "lsih_auth_user";
const TOKEN_KEY = "lsih_auth_token";
const TOKEN_EXPIRES_KEY = "lsih_auth_token_expires";
const PROGRESS_KEY = "lsih_progress";
const ENROLLMENTS_KEY = "lsih_enrollments";

export function loadUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function saveUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadToken(): string | null {
  if (typeof window === "undefined") return null;
  const expiresAt = localStorage.getItem(TOKEN_EXPIRES_KEY);
  if (expiresAt && Date.parse(expiresAt) <= Date.now()) {
    saveToken(null);
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string | null, expiresAt?: string | null) {
  if (typeof window === "undefined") return;
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
  if (expiresAt) {
    localStorage.setItem(TOKEN_EXPIRES_KEY, expiresAt);
  }
}

export function loadEnrollments(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ENROLLMENTS_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function saveEnrollments(courseIds: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(courseIds));
}

export function loadProgress(): EnrollmentProgress[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "[]") as EnrollmentProgress[];
  } catch {
    return [];
  }
}

export function saveProgress(progress: EnrollmentProgress[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}
