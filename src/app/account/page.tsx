"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  changePasswordWithApi,
  hasActiveSubscription,
  RequireAuth,
  subscriptionBlockedMessage,
  useAuth,
} from "@/features/auth";
import { StudentNav } from "@/features/learning";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import { PasswordInput } from "@/shared/components/ui/PasswordInput";
import { ApiError } from "@/shared/api/client";
import { loadToken } from "@/features/auth/lib/storage";

export default function AccountPage() {
  return (
    <RequireAuth roles={["student"]}>
      <AccountContent />
    </RequireAuth>
  );
}

function AccountContent() {
  const { user, logout, refreshUser } = useAuth();
  const subscriptionOk = hasActiveSubscription(user);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onChangePassword(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    const token = loadToken();
    if (!token) {
      setError("Please log in again.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await changePasswordWithApi(token, {
        currentPassword,
        password,
        confirmPassword,
      });
      setMessage(result.message);
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
      logout();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to change password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container-page py-10 sm:py-12">
      <StudentNav />

      <h1 className="font-display text-3xl text-[var(--ink)] sm:text-4xl">Account</h1>
      <p className="mt-2 text-[var(--muted)]">Your profile and subscription status.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="surface p-6">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={user?.name ?? "Student"}
              firstName={user?.firstName}
              avatarUrl={user?.avatar}
              size="lg"
            />
            <div>
              <h2 className="font-display text-2xl text-[var(--ink)]">{user?.name}</h2>
              <p className="text-sm text-[var(--muted)]">@{user?.username}</p>
            </div>
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-3">
              <dt className="text-[var(--muted)]">Email</dt>
              <dd className="font-medium text-[var(--ink)]">{user?.email}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-3">
              <dt className="text-[var(--muted)]">Role</dt>
              <dd className="font-medium capitalize text-[var(--ink)]">{user?.role}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-3">
              <dt className="text-[var(--muted)]">Subscription</dt>
              <dd className="font-medium text-[var(--ink)]">
                {subscriptionOk ? "Active" : "Inactive"}
              </dd>
            </div>
            {user?.subscriptionExpiresAt ? (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">Expires</dt>
                <dd className="font-medium text-[var(--ink)]">
                  {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                </dd>
              </div>
            ) : null}
          </dl>

          {!subscriptionOk ? (
            <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {subscriptionBlockedMessage(user)}{" "}
              <Link href="/contact" className="font-semibold underline">
                Contact us
              </Link>
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/my-courses" className="btn btn-secondary !py-2">
              My courses
            </Link>
            <button type="button" className="btn btn-primary !py-2" onClick={logout}>
              Log out
            </button>
            <button
              type="button"
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--brand)]"
              onClick={() => void refreshUser()}
            >
              Refresh profile
            </button>
          </div>
        </section>

        <section className="surface p-6">
          <h2 className="font-display text-xl text-[var(--ink)]">Change password</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            After changing password you will need to log in again.
          </p>
          <form onSubmit={onChangePassword} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold" htmlFor="current-password">
                Current password
              </label>
              <PasswordInput
                id="current-password"
                className="w-full"
                inputClassName="input border-transparent bg-[#f3f6fb]"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold" htmlFor="new-password">
                New password
              </label>
              <PasswordInput
                id="new-password"
                className="w-full"
                inputClassName="input border-transparent bg-[#f3f6fb]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold" htmlFor="confirm-password">
                Confirm password
              </label>
              <PasswordInput
                id="confirm-password"
                className="w-full"
                inputClassName="input border-transparent bg-[#f3f6fb]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {message ? <p className="text-sm text-[var(--success)]">{message}</p> : null}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : "Update password"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
