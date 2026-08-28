import { apiRequest } from "@/shared/api/client";
import type { PaymentDuration, User, UserPaymentStatus } from "@/shared/types";

export type ApiUser = {
  id: number | string;
  first_name: string;
  last_name: string;
  username: string;
  email?: string;
  avatar?: string | null;
  role: User["role"];
  status: UserPaymentStatus;
  payment_duration: PaymentDuration;
  created_at?: string;
};

export type AuthSessionResponse = {
  token: string;
  token_type: string;
  expires_at: string;
  expires_in: number;
  user: ApiUser;
};

export function mapAuthUser(user: ApiUser): User {
  const role = (user.role as string) === "super_admin" ? "admin" : user.role;

  return {
    id: String(user.id),
    name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    email: user.email || `${user.username}@lsih.local`,
    avatar: user.avatar ?? null,
    role: role as User["role"],
  };
}

export async function loginWithApi(username: string, password: string): Promise<AuthSessionResponse> {
  return apiRequest<AuthSessionResponse>("/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

export async function registerWithApi(input: {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  confirmPassword: string;
}): Promise<AuthSessionResponse> {
  return apiRequest<AuthSessionResponse>("/auth/register", {
    method: "POST",
    body: {
      first_name: input.firstName,
      last_name: input.lastName,
      username: input.username,
      password: input.password,
      password_confirmation: input.confirmPassword,
    },
  });
}

export async function fetchCurrentUser(token: string): Promise<User> {
  const response = await apiRequest<{ data: ApiUser } | ApiUser>("/user", { token });
  const user = "data" in response && response.data ? response.data : (response as ApiUser);
  return mapAuthUser(user);
}

export async function logoutWithApi(token: string): Promise<void> {
  await apiRequest("/auth/logout", { method: "POST", token });
}

export async function changePasswordWithApi(
  token: string,
  input: {
    currentPassword: string;
    password: string;
    confirmPassword: string;
  },
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/change-password", {
    method: "POST",
    token,
    body: {
      current_password: input.currentPassword,
      password: input.password,
      password_confirmation: input.confirmPassword,
    },
  });
}
