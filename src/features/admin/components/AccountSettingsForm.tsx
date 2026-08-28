"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, UserRound } from "lucide-react";
import { useAuth } from "@/features/auth";
import { fetchCurrentUser } from "@/features/auth/api/auth-api";
import { ApiError } from "@/shared/api/client";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import { AvatarUploadField } from "@/shared/components/ui/AvatarUploadField";
import { Button, Skeleton } from "@/features/admin/shadcn";
import { updateProfileApi } from "../api/profile-api";
import {
  AdminFormField,
  AdminFormInput,
  AdminFormSection,
  AdminInfoPanel,
  AdminInfoRow,
} from "./AdminFormFields";
import { AdminPageLayout } from "./AdminPageLayout";
import { RoleBadge } from "./RoleBadge";
import { formatRoleLabel } from "../lib/user-store";

export function AccountSettingsForm() {
  const router = useRouter();
  const { token, user, refreshUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const homeHref = user?.role === "admin" ? "/admin/users" : "/admin";
  const displayName = `${firstName} ${lastName}`.trim() || username || "User";

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchCurrentUser(token)
      .then((profile) => {
        setFirstName(profile.firstName ?? "");
        setLastName(profile.lastName ?? "");
        setUsername(profile.username ?? "");
        setEmail(profile.email);
        setAvatar(profile.avatar ?? "");
      })
      .catch(() => {
        setError("Failed to load your account details.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password || confirmPassword) {
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

    setSubmitting(true);
    try {
      const passwordWasChanged = Boolean(password);
      await updateProfileApi(token, {
        firstName,
        lastName,
        username,
        email,
        avatar: avatar.trim() || null,
        ...(password ? { password, confirmPassword } : {}),
      });

      if (passwordWasChanged) {
        logout();
        router.push("/login");
        return;
      }

      await refreshUser();
      setPassword("");
      setConfirmPassword("");
      setShowPasswordFields(false);
      setSuccess("Your account has been updated.");
      setTimeout(() => router.push("/admin/users"), 800);
    } catch (err) {
      if (err instanceof ApiError) {
        const firstError = Object.values(err.body?.errors ?? {})[0]?.[0];
        setError(firstError ?? err.message);
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-page space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const aside = (
    <AdminInfoPanel title="Your profile">
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <UserAvatar
          name={displayName}
          firstName={firstName}
          avatarUrl={avatar.trim() || null}
          size="xl"
        />
        <div>
          <p className="font-semibold">{displayName}</p>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </div>
        {user ? <RoleBadge role={user.role} /> : null}
      </div>
      <AdminInfoRow label="Email" value={email || "—"} />
      <AdminInfoRow label="Role" value={user ? formatRoleLabel(user.role) : "—"} />
    </AdminInfoPanel>
  );

  const footer = (
    <div className="admin-sticky-footer flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Only you can edit your own account details here.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={() => router.push(homeHref)}>
          Cancel
        </Button>
        <Button type="submit" form="account-form" disabled={submitting}>
          {submitting ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );

  return (
    <AdminPageLayout
      title="Your account"
      description="Manage your personal information, profile photo, and password."
      backHref={homeHref}
      aside={aside}
      footer={footer}
    >
      <form id="account-form" onSubmit={onSubmit} className="space-y-6">
        <AdminFormSection
          step={1}
          icon={UserRound}
          title="Personal details"
          description="Update your name, username, email, and profile photo."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminFormField id="firstName" label="First name" required>
              <AdminFormInput
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </AdminFormField>
            <AdminFormField id="lastName" label="Last name" required>
              <AdminFormInput
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </AdminFormField>
          </div>

          <AdminFormField id="username" label="Username" required>
            <AdminFormInput
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </AdminFormField>

          <AdminFormField id="email" label="Email address" required>
            <AdminFormInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </AdminFormField>

          {token ? (
            <AdminFormField id="avatar" label="Profile photo" hint="Optional. Max 5 MB.">
              <AvatarUploadField
                token={token}
                name={displayName}
                firstName={firstName}
                avatarUrl={avatar.trim() || null}
                username={username}
                isSelf
                compact
                onChange={(url) => setAvatar(url ?? "")}
                onUploaded={() => {
                  void refreshUser();
                }}
              />
            </AdminFormField>
          ) : null}
        </AdminFormSection>

        <AdminFormSection
          step={2}
          icon={KeyRound}
          title="Password"
          description="Change your login password. Leave blank to keep your current one."
        >
          {!showPasswordFields ? (
            <Button type="button" variant="outline" onClick={() => setShowPasswordFields(true)}>
              Change password
            </Button>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <AdminFormField id="password" label="New password">
                <AdminFormInput
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                />
              </AdminFormField>
              <AdminFormField id="confirmPassword" label="Confirm password">
                <AdminFormInput
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                />
              </AdminFormField>
            </div>
          )}
        </AdminFormSection>

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}
      </form>
    </AdminPageLayout>
  );
}
