import type { PaymentDuration, UserPaymentStatus } from "@/shared/types";
import type { User } from "@/shared/types";

export function formatPaymentDuration(_duration: PaymentDuration) {
  return "1 year";
}

export function formatUserStatus(status: UserPaymentStatus) {
  return status === "paid" ? "Paid" : "Unpaid";
}

export function formatRoleLabel(role: User["role"]) {
  if (role === "admin") return "Admin";
  return "Student";
}

export function isStudentRole(role: User["role"]) {
  return role === "student";
}

export function formatAdminDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function previewPaidSubscriptionDates() {
  const startsAt = new Date();
  const expiresAt = new Date(startsAt);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  return {
    startsAt: startsAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    activeDays: 1,
  };
}
