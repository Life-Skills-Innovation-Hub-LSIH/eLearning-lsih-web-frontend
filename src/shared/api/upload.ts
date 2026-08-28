import { ApiError, getApiBaseUrl } from "./client";

type UploadAvatarResponse = {
  message?: string;
  data: {
    url: string;
    avatar: string;
    path?: string;
  };
};

export async function uploadUserAvatarApi(
  token: string,
  file: File,
  options?: { userId?: string; username?: string },
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  if (options?.userId) {
    formData.append("user_id", options.userId);
  }
  if (options?.username) {
    formData.append("username", options.username);
  }

  const response = await fetch(`${getApiBaseUrl()}/admin/upload/avatar`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as UploadAvatarResponse | null;

  if (!response.ok) {
    const body = data as { message?: string; errors?: Record<string, string[]> } | null;
    const firstError = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    throw new ApiError(response.status, firstError ?? body?.message ?? "Upload failed.", body);
  }

  return data?.data?.avatar ?? data?.data?.url ?? "";
}

export async function removeUserAvatarApi(token: string, userId: string): Promise<void> {
  await fetch(`${getApiBaseUrl()}/admin/users/${userId}/avatar`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then(async (response) => {
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new ApiError(response.status, body?.message ?? "Failed to remove photo.", body);
    }
  });
}

export async function uploadProfileAvatarApi(token: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${getApiBaseUrl()}/upload/avatar`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as UploadAvatarResponse | null;

  if (!response.ok) {
    const body = data as { message?: string; errors?: Record<string, string[]> } | null;
    const firstError = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    throw new ApiError(response.status, firstError ?? body?.message ?? "Upload failed.", body);
  }

  return data?.data?.avatar ?? data?.data?.url ?? "";
}

export async function removeProfileAvatarApi(token: string): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/upload/avatar`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body?.message ?? "Failed to remove photo.", body);
  }
}
