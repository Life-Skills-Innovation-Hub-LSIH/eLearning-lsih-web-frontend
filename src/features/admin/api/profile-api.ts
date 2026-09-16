import { apiRequest } from "@/shared/api/client";
import type { ApiUser } from "@/features/auth/api/auth-api";
import { mapAuthUser } from "@/features/auth/api/auth-api";
import { normalizeEmail } from "@/shared/lib/email";
import type { User } from "@/shared/types";

export type ProfileFormInput = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar?: string | null;
  password?: string;
  confirmPassword?: string;
};

export async function updateProfileApi(token: string, input: ProfileFormInput): Promise<User> {
  const body: Record<string, string | null> = {
    first_name: input.firstName,
    last_name: input.lastName,
    username: input.username,
    email: normalizeEmail(input.email),
    avatar: input.avatar?.trim() ? input.avatar.trim() : null,
  };

  if (input.password) {
    body.password = input.password;
    body.password_confirmation = input.confirmPassword ?? "";
  }

  const response = await apiRequest<{ data: ApiUser }>("/user/profile", {
    method: "PUT",
    token,
    body,
  });

  return mapAuthUser(response.data);
}
