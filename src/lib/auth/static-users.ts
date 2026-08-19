import type { User } from "@/types";

export const STATIC_PASSWORD = "password123";

/** Demo accounts for UI-only auth (replace with Laravel Sanctum later). */
export const staticUsers: Array<User & { password: string }> = [
  {
    id: "u-super",
    name: "Sokha Super Admin",
    email: "superadmin@lsih.demo",
    role: "super_admin",
    password: STATIC_PASSWORD,
  },
  {
    id: "u-admin",
    name: "Dara Admin",
    email: "admin@lsih.demo",
    role: "admin",
    password: STATIC_PASSWORD,
  },
  {
    id: "u-student",
    name: "Vanna Student",
    email: "student@lsih.demo",
    role: "student",
    password: STATIC_PASSWORD,
  },
];

export function authenticate(email: string, password: string): User | null {
  const found = staticUsers.find(
    (user) =>
      user.email.toLowerCase() === email.trim().toLowerCase() &&
      user.password === password,
  );

  if (!found) return null;

  const { password: _password, ...user } = found;
  return user;
}

export function homePathForRole(role: User["role"]) {
  if (role === "student") return "/dashboard";
  return "/admin";
}
