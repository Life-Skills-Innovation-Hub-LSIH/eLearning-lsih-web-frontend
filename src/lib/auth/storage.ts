import type { EnrollmentProgress, User } from "@/types";

const USER_KEY = "lsih_auth_user";
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
