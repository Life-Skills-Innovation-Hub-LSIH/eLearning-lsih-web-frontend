import { apiRequest } from "@/shared/api/client";
import type { ManagedUser, PaymentDuration, User, UserPaymentStatus } from "@/shared/types";

type ApiUser = {
  id: number | string;
  first_name: string;
  last_name: string;
  username: string;
  email?: string;
  avatar?: string | null;
  role: User["role"];
  status: UserPaymentStatus;
  payment_duration?: PaymentDuration | null;
  subscription_starts_at?: string | null;
  subscription_expires_at?: string | null;
  subscription_active_days?: number | null;
  created_at: string;
};

export type UserFormInput = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar?: string | null;
  password?: string;
  confirmPassword?: string;
  role?: User["role"];
  status?: UserPaymentStatus;
};

function mapManagedUser(user: ApiUser): ManagedUser {
  return {
    id: String(user.id),
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    email: user.email || `${user.username}@lsih.local`,
    avatar: user.avatar ?? null,
    role: ((user.role as string) === "super_admin" ? "admin" : user.role) as User["role"],
    status: user.status,
    paymentDuration: user.payment_duration ?? null,
    subscriptionStartsAt: user.subscription_starts_at ?? null,
    subscriptionExpiresAt: user.subscription_expires_at ?? null,
    subscriptionActiveDays: user.subscription_active_days ?? null,
    createdAt: user.created_at,
  };
}

export async function fetchUsers(
  token: string,
  filters?: { role?: string; createdFrom?: string; createdTo?: string },
): Promise<ManagedUser[]> {
  const params = new URLSearchParams();
  if (filters?.role && filters.role !== "all") params.set("role", filters.role);
  if (filters?.createdFrom) params.set("created_from", filters.createdFrom);
  if (filters?.createdTo) params.set("created_to", filters.createdTo);
  const query = params.toString();
  const response = await apiRequest<{ data: ApiUser[] }>(`/admin/users${query ? `?${query}` : ""}`, {
    token,
  });
  return (response.data ?? []).map(mapManagedUser);
}

export async function fetchUser(token: string, id: string): Promise<ManagedUser> {
  const response = await apiRequest<{ data: ApiUser }>(`/admin/users/${id}`, { token });
  return mapManagedUser(response.data);
}

export async function createUserApi(token: string, input: UserFormInput): Promise<ManagedUser> {
  const body: Record<string, string | null> = {
    first_name: input.firstName,
    last_name: input.lastName,
    username: input.username,
    email: input.email,
    password: input.password ?? "",
    password_confirmation: input.confirmPassword ?? "",
    avatar: input.avatar?.trim() ? input.avatar.trim() : null,
    role: input.role ?? "student",
  };

  if (input.role === "student" || !input.role) {
    body.status = input.status ?? "unpaid";
  }

  const response = await apiRequest<{ data: ApiUser }>("/admin/users", {
    method: "POST",
    token,
    body,
  });
  return mapManagedUser(response.data);
}

export async function updateUserApi(
  token: string,
  id: string,
  input: UserFormInput,
): Promise<ManagedUser> {
  const body: Record<string, string | null> = {
    first_name: input.firstName,
    last_name: input.lastName,
    username: input.username,
    email: input.email,
    avatar: input.avatar?.trim() ? input.avatar.trim() : null,
  };

  if (input.status) body.status = input.status;

  if (input.password) {
    body.password = input.password;
    body.password_confirmation = input.confirmPassword ?? "";
  }

  const response = await apiRequest<{ data: ApiUser }>(`/admin/users/${id}`, {
    method: "PUT",
    token,
    body,
  });
  return mapManagedUser(response.data);
}

export async function deleteUserApi(token: string, id: string): Promise<void> {
  await apiRequest(`/admin/users/${id}`, {
    method: "DELETE",
    token,
  });
}
