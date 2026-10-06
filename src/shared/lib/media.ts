import { getApiBaseUrl } from "@/shared/api/client";

/** Turn relative/storage paths into absolute API media URLs when needed. */
export function resolveMediaUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;
  const value = url.trim();
  if (/^https?:\/\//i.test(value) || value.startsWith("blob:") || value.startsWith("data:")) {
    return value;
  }
  const apiBase = getApiBaseUrl().replace(/\/$/, "");
  const origin = apiBase.replace(/\/api$/, "");
  if (value.startsWith("/api/media/")) return `${origin}${value}`;
  if (value.startsWith("/")) return `${origin}${value}`;
  return `${apiBase}/media/${value.replace(/^\//, "")}`;
}

export function isDirectVideoFile(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

export function youtubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const parts = parsed.pathname.split("/");
      const embedIndex = parts.indexOf("embed");
      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        return `https://www.youtube.com/embed/${parts[embedIndex + 1]}`;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function vimeoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("vimeo.com")) return null;
    const id = parsed.pathname.split("/").filter(Boolean)[0];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  } catch {
    return null;
  }
}
