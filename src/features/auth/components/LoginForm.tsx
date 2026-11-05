"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthSplitLayout } from "./AuthSplitLayout";
import { useAuth } from "../context/auth-context";
import { homePathForRole } from "../lib/static-users";
import { hasCompletedOnboarding } from "@/features/onboarding/lib/onboarding-storage";
import { PasswordInput } from "@/shared/components/ui/PasswordInput";
import { useLocale } from "@/shared/i18n/locale-context";

export function LoginForm() {
  const { login, user, ready } = useAuth();
  const router = useRouter();
  const { t } = useLocale();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    if (
      user.role === "student" &&
      !user.onboardingTrack &&
      !hasCompletedOnboarding(user.id)
    ) {
      router.replace("/onboarding");
      return;
    }
    router.replace(homePathForRole(user.role));
  }, [ready, user, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await login(username, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
    }
    // Successful login sets `user`; the effect above chooses home vs onboarding.
  }

  if (ready && user) {
    return null;
  }

  return (
    <AuthSplitLayout welcomeTitle={t("auth.loginWelcomeTitle")} welcomeSubtitle={t("auth.loginWelcomeSubtitle")}>
      <div className="text-center">
        <h2 className="font-display text-2xl font-semibold text-[var(--brand)]">
          {t("auth.loginTitle")}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{t("auth.loginSubtitle")}</p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" autoComplete="on">
        <div className="space-y-2 text-sm text-[var(--ink)]">
          <label htmlFor="login-username" className="font-semibold">
            {t("auth.usernameEmail")}
          </label>
          <input
            id="login-username"
            className="input border-transparent bg-[#f3f6fb] text-[16px] font-normal"
            type="text"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t("auth.usernameEmailPlaceholder")}
            required
          />
        </div>
        <div className="space-y-2 text-sm text-[var(--ink)]">
          <label htmlFor="login-password" className="font-semibold">
            {t("auth.password")}
          </label>
          <PasswordInput
            id="login-password"
            name="password"
            autoComplete="current-password"
            inputClassName="input border-transparent bg-[#f3f6fb] text-[16px] font-normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          className="btn btn-primary mt-2 w-full !rounded-full uppercase tracking-wide"
          disabled={submitting}
        >
          {submitting ? t("auth.loggingIn") : t("auth.login")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        {t("auth.noAccount")}{" "}
        <Link href="/register" className="font-semibold text-[var(--brand)] hover:underline">
          {t("auth.registerLink")}
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
