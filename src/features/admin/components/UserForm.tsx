"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Shield, UserRound } from "lucide-react";
import { useAuth } from "@/features/auth";
import { ApiError } from "@/shared/api/client";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import { AvatarUploadField } from "@/shared/components/ui/AvatarUploadField";
import { PasswordInput } from "@/shared/components/ui/PasswordInput";
import {
  Badge,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/admin/shadcn";
import { createUserApi, updateUserApi, type UserFormInput } from "../api/users-api";
import {
  AdminFormField,
  AdminFormInput,
  AdminFormSection,
  AdminInfoPanel,
  AdminInfoRow,
  AdminReadonlyValue,
} from "./AdminFormFields";
import { AdminPageLayout } from "./AdminPageLayout";
import { RoleBadge, StatusBadge } from "./RoleBadge";
import {
  formatAdminDate,
  formatRoleLabel,
  isStudentRole,
  previewPaidSubscriptionDates,
} from "../lib/user-store";
import type { ManagedUser, User, UserPaymentStatus } from "@/shared/types";
import { normalizeEmail, validateEmailInput } from "@/shared/lib/email";

const roleOptions = [
  { value: "student", label: "Student" },
  { value: "admin", label: "Admin" },
];

const statusOptions = [
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
];

type Props = {
  mode: "create" | "edit";
  initialUser?: ManagedUser;
};

export function UserForm({ mode, initialUser }: Props) {
  const router = useRouter();
  const { token, user: currentUser, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState(initialUser?.firstName ?? "");
  const [lastName, setLastName] = useState(initialUser?.lastName ?? "");
  const [username, setUsername] = useState(initialUser?.username ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [avatar, setAvatar] = useState(initialUser?.avatar ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(mode === "create");
  const [createRole, setCreateRole] = useState<User["role"]>("student");
  const [status, setStatus] = useState<UserPaymentStatus>(initialUser?.status ?? "unpaid");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const userRole = initialUser?.role ?? "student";
  const isEdit = mode === "edit";
  const effectiveRole = isEdit ? userRole : createRole;
  const isEditingSelf = mode === "edit" && currentUser?.id === initialUser?.id;
  const showSubscriptionFields = isStudentRole(effectiveRole);
  const isPaidStudent = showSubscriptionFields && status === "paid";
  const paidPreview = !isEdit && isPaidStudent ? previewPaidSubscriptionDates() : null;
  const displayName = `${firstName} ${lastName}`.trim() || username || "User";

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

    const normalizedEmail = normalizeEmail(email);
    if (normalizedEmail !== email) {
      setEmail(normalizedEmail);
    }
    const emailError = validateEmailInput(normalizedEmail);
    if (emailError) {
      setError(emailError);
      return;
    }

    if (!token) {
      setError("Please log in again to continue.");
      return;
    }

    const input: UserFormInput = {
      firstName,
      lastName,
      username,
      email: normalizedEmail,
      avatar: avatar.trim() || null,
      ...(mode === "create" ? { role: createRole } : {}),
      ...(showSubscriptionFields ? { status } : {}),
      ...(password ? { password, confirmPassword } : {}),
    };

    setSubmitting(true);
    try {
      if (mode === "create") {
        await createUserApi(token, {
          ...input,
          password,
          confirmPassword,
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

  const aside =
    isEdit && initialUser ? (
      <>
        <AdminInfoPanel title="Account overview">
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
            <div className="flex flex-wrap justify-center gap-1.5">
              <RoleBadge role={userRole} />
              {isEditingSelf ? <Badge variant="secondary">You</Badge> : null}
              {showSubscriptionFields ? <StatusBadge status={status} /> : null}
            </div>
          </div>
          <AdminInfoRow label="Email" value={email || "—"} />
          <AdminInfoRow label="Role" value={formatRoleLabel(userRole)} />
          <AdminInfoRow
            label="Member since"
            value={formatAdminDate(initialUser.createdAt)}
          />
          {isPaidStudent && initialUser.subscriptionExpiresAt ? (
            <AdminInfoRow
              label="Subscription ends"
              value={formatAdminDate(initialUser.subscriptionExpiresAt)}
            />
          ) : null}
        </AdminInfoPanel>

        <AdminInfoPanel title="Quick tips">
          <ul className="space-y-2.5 px-1 text-xs leading-relaxed text-muted-foreground">
            <li>Role is locked after the account is created.</li>
            <li>Password changes take effect immediately on next login.</li>
            <li>Profile photos are stored securely and compressed automatically.</li>
          </ul>
        </AdminInfoPanel>
      </>
    ) : null;

  const formActions = (
    <>
      <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
        Cancel
      </Button>
      <Button type="submit" form="user-form" disabled={submitting}>
        {submitting ? "Saving…" : isEdit ? "Save changes" : "Create user"}
      </Button>
    </>
  );

  return (
    <AdminPageLayout
      title={isEdit ? undefined : "Add user"}
      description={
        isEdit ? undefined : "Create a new student or admin account for the platform."
      }
      backHref="/admin/users"
      backLabel="Back to users"
      actions={formActions}
      aside={aside}
    >
      <form id="user-form" onSubmit={onSubmit} autoComplete="off" className="relative space-y-6">
        {!isEdit ? (
          <div className="pointer-events-none absolute -z-10 h-0 overflow-hidden opacity-0" aria-hidden>
            <input type="text" name="username" tabIndex={-1} autoComplete="username" defaultValue="" />
            <input type="password" name="password" tabIndex={-1} autoComplete="current-password" defaultValue="" />
          </div>
        ) : null}

        <AdminFormSection
          step={1}
          icon={UserRound}
          title="Personal details"
          description="Name, username, and contact information."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminFormField id="firstName" label="First name" required>
              <AdminFormInput
                id="firstName"
                name="user_first_name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Vanna"
                autoComplete="off"
                required
              />
            </AdminFormField>
            <AdminFormField id="lastName" label="Last name" required>
              <AdminFormInput
                id="lastName"
                name="user_last_name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Sok"
                autoComplete="off"
                required
              />
            </AdminFormField>
          </div>

          <AdminFormField id="username" label="Username" hint="Used for login and profile URL." required>
            <AdminFormInput
              id="username"
              name="user_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. vanna.student"
              autoComplete="off"
              required
            />
          </AdminFormField>

          <AdminFormField
            id="email"
            label="Email address"
            hint="Spaces and capitals are cleaned up automatically."
            required
          >
            <AdminFormInput
              id="email"
              name="user_email"
              type="text"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmail(normalizeEmail(email))}
              placeholder="e.g. vanna@gmail.com"
              autoComplete="off"
              required
            />
          </AdminFormField>

          {token ? (
            <AdminFormField
              id="avatar"
              label="Profile photo"
              hint="Optional. A colored letter is shown if no photo is uploaded."
            >
              <AvatarUploadField
                token={token}
                name={displayName}
                firstName={firstName}
                avatarUrl={avatar.trim() || null}
                userId={isEdit ? initialUser?.id : undefined}
                username={username}
                isSelf={isEditingSelf}
                compact
                onChange={(url) => setAvatar(url ?? "")}
                onUploaded={() => {
                  if (isEditingSelf) {
                    void refreshUser();
                  }
                }}
              />
            </AdminFormField>
          ) : null}
        </AdminFormSection>

        <AdminFormSection
          step={2}
          icon={KeyRound}
          title="Password"
          description={
            isEdit
              ? "Only fill this in if you want to set a new password."
              : "Set a secure password for this account."
          }
        >
          {isEdit && !showPasswordFields ? (
            <Button type="button" variant="outline" onClick={() => setShowPasswordFields(true)}>
              Change password
            </Button>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <AdminFormField id="password" label="New password" required={!isEdit}>
                <PasswordInput
                  id="password"
                  name="user_password"
                  inputClassName="admin-form-input flex h-10 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEdit ? "Leave blank to keep current" : "Min. 6 characters"}
                  autoComplete="new-password"
                  required={!isEdit}
                  minLength={!isEdit ? 6 : undefined}
                />
              </AdminFormField>
              <AdminFormField
                id="confirmPassword"
                label="Confirm password"
                required={!isEdit || Boolean(password)}
              >
                <PasswordInput
                  id="confirmPassword"
                  name="user_password_confirm"
                  inputClassName="admin-form-input flex h-10 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required={!isEdit || Boolean(password)}
                />
              </AdminFormField>
            </div>
          )}
        </AdminFormSection>

        <AdminFormSection
          step={3}
          icon={Shield}
          title="Access & billing"
          description={
            isEdit
              ? "Account type is fixed after creation."
              : "Choose Student or Admin. Role cannot be changed later."
          }
        >
          {isEdit ? (
            <AdminFormField id="role" label="Account type">
              <RoleBadge role={userRole} />
            </AdminFormField>
          ) : (
            <AdminFormField id="role" label="Account type" required>
              <Select
                value={createRole}
                onValueChange={(value) => setCreateRole(value as User["role"])}
              >
                <SelectTrigger className="admin-form-input w-full max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminFormField>
          )}

          {showSubscriptionFields ? (
            <>
              <AdminFormField id="status" label="Payment status">
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as UserPaymentStatus)}
                >
                  <SelectTrigger className="admin-form-input w-full max-w-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </AdminFormField>

              {isPaidStudent ? (
                <div className="grid gap-5 sm:grid-cols-3">
                  <AdminReadonlyValue label="Subscription duration" value="1 year" />
                  <AdminReadonlyValue
                    label="Active days"
                    value={
                      isEdit
                        ? `${initialUser?.subscriptionActiveDays ?? 0} days`
                        : `${paidPreview?.activeDays ?? 1} day`
                    }
                  />
                  <AdminReadonlyValue
                    label="Expire date"
                    value={formatAdminDate(
                      isEdit ? initialUser?.subscriptionExpiresAt : paidPreview?.expiresAt,
                    )}
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  Unpaid students have no subscription duration, active days, or expiry date.
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              Admin accounts do not use student billing.
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
