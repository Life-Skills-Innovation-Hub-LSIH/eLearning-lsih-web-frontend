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

export async function uploadSubjectIconApi(
  token: string,
  file: File,
  options?: { slug?: string },
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  if (options?.slug) {
    formData.append("slug", options.slug);
  }

  const response = await fetch(`${getApiBaseUrl()}/admin/upload/subject-icon`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as {
    message?: string;
    data?: { url?: string; icon?: string; path?: string };
    errors?: Record<string, string[]>;
  } | null;

  if (!response.ok) {
    const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
    throw new ApiError(response.status, firstError ?? data?.message ?? "Upload failed.", data);
  }

  return data?.data?.icon ?? data?.data?.url ?? "";
}

export async function uploadLecturerAvatarApi(
  token: string,
  file: File,
  options?: { slug?: string },
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  if (options?.slug) {
    formData.append("slug", options.slug);
  }

  const response = await fetch(`${getApiBaseUrl()}/admin/upload/lecturer-avatar`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as {
    message?: string;
    data?: { url?: string; avatar?: string; path?: string };
    errors?: Record<string, string[]>;
  } | null;

  if (!response.ok) {
    const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
    throw new ApiError(response.status, firstError ?? data?.message ?? "Upload failed.", data);
  }

  return data?.data?.avatar ?? data?.data?.url ?? "";
}

export async function uploadCourseCoverApi(
  token: string,
  file: File,
  options?: { slug?: string },
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  if (options?.slug) {
    formData.append("slug", options.slug);
  }

  const response = await fetch(`${getApiBaseUrl()}/admin/upload/course-cover`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as {
    message?: string;
    data?: { url?: string; cover_image?: string; path?: string };
    errors?: Record<string, string[]>;
  } | null;

  if (!response.ok) {
    const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
    throw new ApiError(response.status, firstError ?? data?.message ?? "Upload failed.", data);
  }

  return data?.data?.cover_image ?? data?.data?.url ?? "";
}

export async function deleteCourseCoverApi(token: string, urlOrPath: string): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/admin/upload/course-cover`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url: urlOrPath }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(response.status, body?.message ?? "Failed to delete cover.", body);
  }
}

export async function uploadLessonMediaApi(
  token: string,
  file: File,
  options: {
    type: "video" | "file";
    slug?: string;
    onProgress?: (progress: { phase: "upload" | "compress"; percent: number; message?: string }) => void;
  },
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", options.type);
  if (options.slug) {
    formData.append("slug", options.slug);
  }

  if (options.type === "file") {
    options.onProgress?.({ phase: "upload", percent: 10, message: "Uploading PDF…" });
    const response = await fetch(`${getApiBaseUrl()}/admin/upload/lesson-media`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = (await response.json().catch(() => null)) as {
      message?: string;
      data?: { url?: string; media_url?: string; path?: string };
      errors?: Record<string, string[]>;
    } | null;

    if (!response.ok) {
      const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
      throw new ApiError(response.status, firstError ?? data?.message ?? "Upload failed.", data);
    }

    options.onProgress?.({ phase: "upload", percent: 100, message: "PDF uploaded." });
    return data?.data?.media_url ?? data?.data?.url ?? "";
  }

  const uploadResult = await new Promise<{
    jobId?: string;
    mediaUrl?: string;
    status: number;
    body: {
      message?: string;
      data?: {
        job_id?: string;
        media_url?: string;
        url?: string;
        progress?: number;
      };
      errors?: Record<string, string[]>;
    } | null;
  }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${getApiBaseUrl()}/admin/upload/lesson-media`);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.max(1, Math.min(99, Math.round((event.loaded / event.total) * 100)));
      options.onProgress?.({ phase: "upload", percent, message: "Uploading video…" });
    };

    xhr.onload = () => {
      const body = (() => {
        try {
          return JSON.parse(xhr.responseText) as {
            message?: string;
            data?: {
              job_id?: string;
              media_url?: string;
              url?: string;
              progress?: number;
            };
            errors?: Record<string, string[]>;
          };
        } catch {
          return null;
        }
      })();

      resolve({
        status: xhr.status,
        body,
        jobId: body?.data?.job_id,
        mediaUrl: body?.data?.media_url ?? body?.data?.url,
      });
    };

    xhr.onerror = () => reject(new Error("Network error while uploading video."));
    xhr.send(formData);
  });

  if (uploadResult.status >= 400 || !uploadResult.body) {
    const firstError = uploadResult.body?.errors
      ? Object.values(uploadResult.body.errors)[0]?.[0]
      : undefined;
    throw new ApiError(
      uploadResult.status || 500,
      firstError ?? uploadResult.body?.message ?? "Upload failed.",
      uploadResult.body,
    );
  }

  if (uploadResult.mediaUrl) {
    options.onProgress?.({ phase: "compress", percent: 100, message: "Video ready." });
    return uploadResult.mediaUrl;
  }

  const jobId = uploadResult.jobId;
  if (!jobId) {
    throw new ApiError(500, "Compression job was not created.", uploadResult.body);
  }

  options.onProgress?.({ phase: "compress", percent: 1, message: "Compressing video…" });

  const startedAt = Date.now();
  const timeoutMs = 30 * 60 * 1000;

  while (Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const statusResponse = await fetch(`${getApiBaseUrl()}/admin/upload/lesson-media/jobs/${jobId}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const statusData = (await statusResponse.json().catch(() => null)) as {
      message?: string;
      data?: {
        status?: string;
        progress?: number;
        message?: string;
        media_url?: string;
        url?: string;
        error?: string;
      };
    } | null;

    if (!statusResponse.ok) {
      throw new ApiError(
        statusResponse.status,
        statusData?.message ?? "Failed to check compression progress.",
        statusData,
      );
    }

    const progress = Math.max(0, Math.min(100, Number(statusData?.data?.progress ?? 0)));
    const status = statusData?.data?.status ?? "unknown";
    options.onProgress?.({
      phase: "compress",
      percent: progress,
      message: statusData?.data?.message ?? "Compressing video…",
    });

    if (status === "done") {
      const url = statusData?.data?.media_url ?? statusData?.data?.url ?? "";
      if (!url) {
        throw new ApiError(500, "Compression finished but no media URL was returned.", statusData);
      }
      return url;
    }

    if (status === "failed") {
      throw new ApiError(500, statusData?.data?.error ?? "Video compression failed.", statusData);
    }
  }

  throw new ApiError(504, "Video compression timed out.", null);
}

