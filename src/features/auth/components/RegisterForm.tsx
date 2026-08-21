"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/shared/api/client";
import { registerWithApi } from "../api/auth-api";
import { AuthSplitLayout } from "./AuthSplitLayout";
import { useAuth } from "../context/auth-context";
import { homePathForRole } from "../lib/static-users";

export function RegisterForm() {
  const { applySession, user, ready } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    router.replace(homePathForRole(user.role));
  }, [ready, user, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
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
      const redirectTo = applySession(result);
      router.push(redirectTo);
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
    <AuthSplitLayout welcomeSubtitle="Join LSIH" welcomeTitle="Get started">
      <div className="mb-8 flex justify-center lg:hidden">
        <Link href="/">
          <Image
            src="/assets/logo-full.png"
            alt="LSIH"
            width={150}
            height={44}
            className="h-10 w-auto object-contain"
          />
        </Link>
      </div>

      <div className="text-center">
        <h2 className="font-display text-2xl font-semibold text-[var(--brand)]">Create account</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Register as a student to browse courses and start learning.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-semibold text-[var(--ink)]">
            <span>First name</span>
            <input
              className="input border-transparent bg-[#f3f6fb]"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </label>
          <label className="block space-y-2 text-sm font-semibold text-[var(--ink)]">
            <span>Last name</span>
            <input
              className="input border-transparent bg-[#f3f6fb]"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </label>
        </div>
        <label className="block space-y-2 text-sm font-semibold text-[var(--ink)]">
          <span>Username</span>
          <input
            className="input border-transparent bg-[#f3f6fb]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. vanna.student"
            required
          />
        </label>
        <label className="block space-y-2 text-sm font-semibold text-[var(--ink)]">
          <span>Password</span>
          <input
            className="input border-transparent bg-[#f3f6fb]"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        <label className="block space-y-2 text-sm font-semibold text-[var(--ink)]">
          <span>Confirm password</span>
          <input
            className="input border-transparent bg-[#f3f6fb]"
            type="password"
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
          {submitting ? "Creating account…" : "Register"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[var(--brand)] hover:underline">
          Log in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
