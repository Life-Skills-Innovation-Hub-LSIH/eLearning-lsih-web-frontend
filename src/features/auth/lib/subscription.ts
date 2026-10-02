import type { User } from "@/shared/types";

/** Student can enroll/learn when paid and not expired. Admins always pass. */
export function hasActiveSubscription(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (typeof user.subscriptionActive === "boolean") {
    return user.subscriptionActive;
  }
  if (user.status !== "paid") return false;
  if (user.subscriptionExpiresAt) {
    return new Date(user.subscriptionExpiresAt).getTime() > Date.now();
  }
  return true;
}

export function subscriptionBlockedMessage(user: User | null | undefined): string {
  if (!user || user.role !== "student") {
    return "A paid subscription is required to enroll in courses.";
  }
  if (
    user.status === "paid" &&
    user.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt).getTime() <= Date.now()
  ) {
    return "Your subscription has expired. Contact an admin to renew access.";
  }
  return "A paid subscription is required to enroll. Contact an admin to activate your account.";
}
