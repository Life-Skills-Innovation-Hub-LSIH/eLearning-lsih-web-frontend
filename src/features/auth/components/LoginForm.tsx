"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthSplitLayout } from "./AuthSplitLayout";
import { useAuth } from "../context/auth-context";
import { homePathForRole } from "../lib/static-users";

export function LoginForm() {
  const { login, user, ready } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
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
      return;
    }
    router.push(result.redirectTo);
  }

  if (ready && user) {
    return null;
  }

  return (
    <AuthSplitLayout>
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
        <h2 className="font-display text-2xl font-semibold text-[var(--brand)]">Login Account</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Sign in with your username or email to continue learning.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block space-y-2 text-sm font-semibold text-[var(--ink)]">
          <span>Username or email</span>
          <input
            className="input border-transparent bg-[#f3f6fb]"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username or email"
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
            placeholder="••••••••"
            required
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          className="btn btn-primary mt-2 w-full !rounded-full uppercase tracking-wide"
          disabled={submitting}
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-[var(--brand)] hover:underline">
          Register
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
