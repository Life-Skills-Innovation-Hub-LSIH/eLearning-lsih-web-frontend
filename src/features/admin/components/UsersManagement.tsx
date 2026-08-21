"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/features/auth";
import { ApiError } from "@/shared/api/client";
import { deleteUserApi, fetchUsers } from "../api/users-api";
import {
  formatPaymentDuration,
  formatRoleLabel,
  formatUserStatus,
} from "../lib/user-store";
import type { ManagedUser, User } from "@/shared/types";

function userInitials(user: ManagedUser) {
  return `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U";
}

function roleBadgeClass(role: User["role"]) {
  if (role === "super_admin") return "bg-[#e8f1fb] text-[var(--brand)]";
  if (role === "admin") return "bg-violet-50 text-violet-700";
  return "bg-slate-100 text-slate-700";
}

export function UsersManagement() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [role, setRole] = useState<"all" | User["role"]>("all");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadUsers() {
    if (!token) {
      setLoading(false);
      setLoadError("Please log in again to load users.");
      return;
    }

    setLoading(true);
    setLoadError("");
    try {
      const nextUsers = await fetchUsers(token, { role, createdFrom, createdTo });
      setUsers(nextUsers);
    } catch (error) {
      setUsers([]);
      setLoadError(error instanceof Error ? error.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role, createdFrom, createdTo]);

  async function onDelete(user: ManagedUser) {
    if (!token) {
      setActionError("Please log in again to delete a user.");
      return;
    }
    if (currentUser?.id === user.id) {
      setActionError("You cannot delete your own account.");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${user.firstName} ${user.lastName} (@${user.username})? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(user.id);
    setActionError("");
    try {
      await deleteUserApi(token, user.id);
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
    } catch (error) {
      if (error instanceof ApiError) {
        setActionError(error.message);
      } else {
        setActionError(error instanceof Error ? error.message : "Failed to delete user.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  const hasFilters = role !== "all" || createdFrom || createdTo;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--ink)]">Manage Users</h1>
          <p className="mt-0.5 text-sm text-[var(--muted)]">
            {loading ? "Loading accounts…" : `${users.length} accounts`}
          </p>
        </div>
        <Link href="/admin/users/create" className="btn btn-primary !py-2 text-sm">
          Create user
        </Link>
      </div>

      <div className="grid gap-3 rounded-xl border border-[#d8dee8] bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-[var(--ink)]">Filter by role</span>
          <select
            className="input !py-2 appearance-none"
            value={role}
            onChange={(e) => setRole(e.target.value as "all" | User["role"])}
          >
            <option value="all">All roles</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-[var(--ink)]">Created from</span>
          <input
            className="input !py-2"
            type="date"
            value={createdFrom}
            onChange={(e) => setCreatedFrom(e.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-[var(--ink)]">Created to</span>
          <input
            className="input !py-2"
            type="date"
            value={createdTo}
            onChange={(e) => setCreatedTo(e.target.value)}
          />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            className="btn btn-secondary w-full !py-2 text-sm"
            disabled={!hasFilters}
            onClick={() => {
              setRole("all");
              setCreatedFrom("");
              setCreatedTo("");
            }}
          >
            Clear filters
          </button>
        </div>
      </div>

      {actionError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      <div className="space-y-2">
        {loading ? (
          <div className="rounded-xl border border-[#d8dee8] bg-white px-6 py-12 text-center text-sm text-[var(--muted)] shadow-sm">
            Loading users…
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-red-200 bg-white px-6 py-12 text-center text-sm text-red-600 shadow-sm">
            {loadError}
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-xl border border-[#d8dee8] bg-white px-6 py-12 text-center text-sm text-[var(--muted)] shadow-sm">
            {hasFilters ? (
              "No users match the selected filters."
            ) : (
              <>
                No users created yet.{" "}
                <Link
                  href="/admin/users/create"
                  className="font-semibold text-[var(--brand)] hover:underline"
                >
                  Create the first user
                </Link>
              </>
            )}
          </div>
        ) : (
          users.map((user) => {
            const isSelf = currentUser?.id === user.id;
            return (
              <article
                key={user.id}
                className="flex items-center gap-3 rounded-xl border border-[#d8dee8] bg-white px-3 py-2.5 shadow-sm transition hover:border-[#c5d0e0] hover:shadow"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-semibold text-white">
                  {userInitials(user)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h2 className="truncate text-sm font-semibold text-[var(--ink)]">
                      {user.firstName} {user.lastName}
                    </h2>
                    {isSelf ? (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                        You
                      </span>
                    ) : null}
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${roleBadgeClass(user.role)}`}
                    >
                      {formatRoleLabel(user.role)}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        user.status === "paid"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {formatUserStatus(user.status)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                    @{user.username}
                    <span className="mx-1.5 text-[#c5d0e0]">·</span>
                    {user.email}
                    <span className="mx-1.5 text-[#c5d0e0]">·</span>
                    {formatPaymentDuration(user.paymentDuration)}
                    <span className="mx-1.5 text-[#c5d0e0]">·</span>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Link
                    href={`/admin/users/${user.id}/edit`}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#d8dee8] px-2.5 text-xs font-semibold text-[var(--brand)] transition hover:bg-[var(--brand-soft)]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-200 px-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSelf || deletingId === user.id}
                    onClick={() => void onDelete(user)}
                    title={isSelf ? "You cannot delete your own account" : "Delete user"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deletingId === user.id ? "…" : "Delete"}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
