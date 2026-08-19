"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { STATIC_PASSWORD, staticUsers } from "@/lib/auth/static-users";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("student@lsih.demo");
  const [password, setPassword] = useState(STATIC_PASSWORD);
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = login(email, password);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.push(result.redirectTo);
  }

  return (
    <main className="container-page grid gap-8 py-12 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)] md:p-8">
        <div className="mb-6 space-y-4">
          <Image
            src="/assets/logo-full.png"
            alt="LSIH"
            width={150}
            height={44}
            className="h-10 w-auto object-contain"
          />
          <div>
            <h1 className="font-display text-2xl font-semibold text-[var(--ink)]">Log in</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Welcome back to Life Skills Innovation Hub</p>
          </div>
        </div>

        <p className="text-sm leading-6 text-[var(--muted)]">
          Static demo login for UI review. Real Sanctum auth comes later.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block space-y-2 text-sm font-semibold">
            <span>Email</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block space-y-2 text-sm font-semibold">
            <span>Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button type="submit" className="btn btn-primary w-full">
            Log in
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-[var(--ink)]">Demo accounts</h2>
        <p className="text-sm text-[var(--muted)]">
          Password for all accounts:{" "}
          <code className="rounded bg-white px-1.5 py-0.5 font-semibold text-[var(--brand)]">
            {STATIC_PASSWORD}
          </code>
        </p>
        <div className="grid gap-3">
          {staticUsers.map((account) => (
            <button
              key={account.id}
              type="button"
              className="surface p-4 text-left transition hover:border-[var(--brand)]"
              onClick={() => {
                setEmail(account.email);
                setPassword(STATIC_PASSWORD);
                setError("");
              }}
            >
              <p className="font-bold text-[var(--ink)]">{account.name}</p>
              <p className="text-sm text-[var(--muted)]">
                {account.email} · {account.role.replace("_", " ")}
              </p>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
