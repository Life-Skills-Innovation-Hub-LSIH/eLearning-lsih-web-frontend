import type { User } from "@/shared/types";

export function homePathForRole(role: User["role"]) {
  if (role === "student") return "/dashboard";
  return "/admin";
}
