"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { ApiError } from "@/shared/api/client";
import { CustomSelect } from "@/shared/components/ui/CustomSelect";
import { createUserApi, updateUserApi, type UserFormInput } from "../api/users-api";
import type { ManagedUser, User, UserPaymentStatus } from "@/shared/types";

const roleOptions = [
  { value: "student", label: "Student" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
];

const statusOptions = [
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
];

const PAYMENT_DURATION = "1_year" as const;

type Props = {
  mode: "create" | "edit";
  initialUser?: ManagedUser;
};

export function UserForm({ mode, initialUser }: Props) {
  const router = useRouter();
  const { token, user: currentUser } = useAuth();
  const [firstName, setFirstName] = useState(initialUser?.firstName ?? "");
  const [lastName, setLastName] = useState(initialUser?.lastName ?? "");
  const [username, setUsername] = useState(initialUser?.username ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<User["role"]>(initialUser?.role ?? "student");
  const [status, setStatus] = useState<UserPaymentStatus>(initialUser?.status ?? "unpaid");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEditingSelf = mode === "edit" && currentUser?.id === initialUser?.id;
  const title = mode === "create" ? "Create user" : "Edit user";
  const subtitle =
    mode === "create"
      ? "Add a new account with role, payment status, and subscription duration."
      : "Update account details. Leave password blank to keep the current password.";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "create" || password || confirmPassword) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Password and confirm password do not match.");
        return;
      }
    }

    if (!token) {
      setError("Please log in again to continue.");
      return;
    }

    const input: UserFormInput = {
      firstName,
      lastName,
      username,
      email,
      role,
      status,
      paymentDuration: PAYMENT_DURATION,
      ...(password
        ? {
            password,
            confirmPassword,
          }
        : {}),
    };

    setSubmitting(true);
    try {
      if (mode === "create") {
        await createUserApi(token, {
          ...input,
          password: password,
          confirmPassword: confirmPassword,
        });
        setSuccess("User created successfully.");
      } else if (initialUser) {
        await updateUserApi(token, initialUser.id, input);
        setSuccess("User updated successfully.");
      }
      setTimeout(() => router.push("/admin/users"), 800);
    } catch (err) {
      if (err instanceof ApiError) {
        const firstError = Object.values(err.body?.errors ?? {})[0]?.[0];
        setError(firstError ?? err.message);
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to save user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[var(--ink)]">{title}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-xl border border-[#d8dee8] bg-white p-6 shadow-sm"
      >
        <section className="space-y-4">
          <h2 className="border-b border-[#eef1f6] pb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Personal information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-[var(--ink)]">First name</span>
              <input
                className="input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-[var(--ink)]">Last name</span>
              <input
                className="input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </label>
          </div>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[var(--ink)]">Username</span>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. vanna.student"
              required
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[var(--ink)]">Email</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. vanna@gmail.com"
              required
            />
          </label>
        </section>

        <section className="space-y-4">
          <h2 className="border-b border-[#eef1f6] pb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Account security
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-[var(--ink)]">
                {mode === "edit" ? "New password (optional)" : "Password"}
              </span>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={mode === "create"}
                minLength={mode === "create" ? 6 : undefined}
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-[var(--ink)]">Confirm password</span>
              <input
                className="input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={mode === "create" || Boolean(password)}
              />
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="border-b border-[#eef1f6] pb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Role & subscription
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-[var(--ink)]">Role</span>
              <CustomSelect
                value={role}
                options={roleOptions}
                onChange={(value) => setRole(value as User["role"])}
                disabled={isEditingSelf}
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-[var(--ink)]">Status</span>
              <CustomSelect
                value={status}
                options={statusOptions}
                onChange={(value) => setStatus(value as UserPaymentStatus)}
              />
            </label>
          </div>
          <p className="text-xs text-[var(--muted)]">
            Payment duration is fixed at <span className="font-medium">1 year</span>.
          </p>
          {isEditingSelf ? (
            <p className="text-xs text-amber-700">
              You cannot change your own role away from Super Admin.
            </p>
          ) : (
            <p className="text-xs text-[var(--muted)]">
              Super Admin can create, edit, and remove any role, including other Super Admins.
            </p>
          )}
        </section>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

        <div className="flex flex-wrap gap-3 border-t border-[#eef1f6] pt-4">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : mode === "create" ? "Create user" : "Save changes"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.push("/admin/users")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
