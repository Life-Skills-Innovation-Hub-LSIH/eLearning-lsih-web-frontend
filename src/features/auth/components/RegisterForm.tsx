"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/shared/api/client";
import { PasswordInput } from "@/shared/components/ui/PasswordInput";
import { hasCompletedOnboarding } from "@/features/onboarding/lib/onboarding-storage";
import { useLocale } from "@/shared/i18n/locale-context";
import { registerWithApi } from "../api/auth-api";
import { AuthSplitLayout } from "./AuthSplitLayout";
import { useAuth } from "../context/auth-context";
import { homePathForRole } from "../lib/static-users";

export function RegisterForm() {
  const { applySession, user, ready } = useAuth();
  const router = useRouter();
  const { t } = useLocale();
  const skipHomeRedirect = useRef(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ready || !user || skipHomeRedirect.current) return;
    router.replace(homePathForRole(user.role));
  }, [ready, user, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setSubmitting(true);
    try {
      const result = await registerWithApi({
        firstName,
        lastName,
        username,
        password,
        confirmPassword,
      });
      skipHomeRedirect.current = true;
      const redirectTo = applySession(result);
      const userId = String(result.user.id);
      const alreadyDone =
        Boolean(result.user.onboarding_track) || hasCompletedOnboarding(userId);
      router.push(alreadyDone ? redirectTo : "/onboarding");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(Object.values(err.body?.errors ?? {})[0]?.[0] ?? err.message);
      } else {
        setError(err instanceof Error ? err.message : "Failed to create account.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (ready && user) {
    return null;
  }

  return (
    <AuthSplitLayout welcomeSubtitle={t("auth.welcomeSubtitle")} welcomeTitle={t("auth.welcomeTitle")}>
      <div className="text-center">
        <h2 className="font-display text-2xl font-semibold text-[var(--brand)]">
          {t("auth.registerTitle")}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{t("auth.registerSubtitle")}</p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm text-[var(--ink)]">
            <span className="font-semibold">{t("auth.firstName")}</span>
            <input
              className="input border-transparent bg-[#f3f6fb] font-normal"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </label>
          <label className="block space-y-2 text-sm text-[var(--ink)]">
            <span className="font-semibold">{t("auth.lastName")}</span>
            <input
              className="input border-transparent bg-[#f3f6fb] font-normal"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </label>
        </div>
        <label className="block space-y-2 text-sm text-[var(--ink)]">
          <span className="font-semibold">{t("auth.username")}</span>
          <input
            className="input border-transparent bg-[#f3f6fb] font-normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. vanna.student"
            required
          />
        </label>
        <label className="block space-y-2 text-sm text-[var(--ink)]">
          <span className="font-semibold">{t("auth.password")}</span>
          <PasswordInput
            inputClassName="input border-transparent bg-[#f3f6fb] font-normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        <label className="block space-y-2 text-sm text-[var(--ink)]">
          <span className="font-semibold">{t("auth.confirmPassword")}</span>
          <PasswordInput
            inputClassName="input border-transparent bg-[#f3f6fb] font-normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          className="btn btn-primary mt-2 w-full !rounded-full uppercase tracking-wide"
          disabled={submitting}
        >
          {submitting ? t("auth.registering") : t("auth.register")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        {t("auth.haveAccount")}{" "}
        <Link href="/login" className="font-semibold text-[var(--brand)] hover:underline">
          {t("auth.login")}
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
