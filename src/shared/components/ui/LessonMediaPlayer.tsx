"use client";

import {
  isDirectVideoFile,
  resolveMediaUrl,
  vimeoEmbedUrl,
  youtubeEmbedUrl,
} from "@/shared/lib/media";

type Props = {
  contentType: "video" | "text" | "file";
  mediaUrl?: string | null;
  title: string;
  className?: string;
};

export function LessonMediaPlayer({ contentType, mediaUrl, title, className }: Props) {
  const url = resolveMediaUrl(mediaUrl);

  if (contentType === "video") {
    if (!url) {
      return (
        <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-[var(--line)] bg-[var(--background)] text-sm text-[var(--muted)]">
          No video uploaded for this lesson yet.
        </div>
      );
    }

    const yt = youtubeEmbedUrl(url);
    if (yt) {
      return (
        <div className={className ?? "overflow-hidden rounded-2xl shadow-[var(--shadow)]"}>
          <iframe
            title={title}
            src={yt}
            className="aspect-video w-full bg-black"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    const vimeo = vimeoEmbedUrl(url);
    if (vimeo) {
      return (
        <div className={className ?? "overflow-hidden rounded-2xl shadow-[var(--shadow)]"}>
          <iframe
            title={title}
            src={vimeo}
            className="aspect-video w-full bg-black"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <video
        key={url}
        controls
        preload="metadata"
        playsInline
        className={
          className ??
          "aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-[var(--shadow)]"
        }
        src={url}
      >
        Your browser does not support video playback.
      </video>
    );
  }

  if (contentType === "file") {
    if (!url) {
      return (
        <div className="flex h-[40vh] items-center justify-center rounded-2xl border border-dashed border-[var(--line)] bg-[var(--background)] text-sm text-[var(--muted)]">
          No PDF uploaded for this lesson yet.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <iframe
          title={title}
          src={url}
          className="h-[70vh] w-full rounded-2xl border border-[var(--line)] bg-white shadow-sm"
        />
        <a href={url} target="_blank" rel="noreferrer" className="btn btn-secondary">
          Open PDF in new tab
        </a>
      </div>
    );
  }

  return null;
}

export { isDirectVideoFile, resolveMediaUrl };
