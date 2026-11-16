import type { User } from "@/shared/types";

/** Paid-course access lasts until subscription_expires_at. Role does not bypass this. */
export function hasActiveSubscription(user: User | null | undefined): boolean {
  if (!user) return false;
  if (typeof user.subscriptionActive === "boolean") {
    return user.subscriptionActive;
  }
  if (user.status !== "paid" || !user.subscriptionExpiresAt) return false;
  return new Date(user.subscriptionExpiresAt).getTime() > Date.now();
}

export function subscriptionBlockedMessage(user: User | null | undefined): string {
  if (
    user?.status === "paid" &&
    user.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt).getTime() <= Date.now()
  ) {
    return "Your 1-month access has ended. Pay the course price to continue.";
  }
  return "Pay the course price for 1 month. A coupon can lower it. Free courses stay open with your account.";
}
