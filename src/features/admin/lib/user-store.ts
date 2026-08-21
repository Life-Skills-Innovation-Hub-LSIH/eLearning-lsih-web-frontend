import type { PaymentDuration, UserPaymentStatus } from "@/shared/types";
import type { User } from "@/shared/types";

export function formatPaymentDuration(duration: PaymentDuration) {
  return duration === "1_month" ? "1 month" : "1 year";
}

export function formatUserStatus(status: UserPaymentStatus) {
  return status === "paid" ? "Paid" : "Unpaid";
}

export function formatRoleLabel(role: User["role"]) {
  if (role === "super_admin") return "Super Admin";
  if (role === "admin") return "Admin";
  return "Student";
}

export function homePathForRole(role: User["role"]) {
  if (role === "student") return "/dashboard";
  return "/admin";
}
