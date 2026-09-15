"use client";

import { useRef, useState } from "react";
import { FileText, Upload, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/shared/api/client";
import { uploadLessonMediaApi } from "@/shared/api/upload";

type Props = {
  token: string;
  type: "video" | "file";
  mediaUrl?: string | null;
  slug?: string;
  onChange: (url: string | null) => void;
};

export function LessonMediaUploadField({ token, type, mediaUrl, slug, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [phase, setPhase] = useState<"upload" | "compress" | null>(null);
  const [percent, setPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const isVideo = type === "video";
  const accept = isVideo ? "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" : "application/pdf,.pdf";
  const hasMedia = Boolean(mediaUrl);

  async function onFileSelected(file: File | null) {
    if (!file) return;

    setFileName(file.name);
    setError("");
    setUploading(true);
    setPhase("upload");
    setPercent(0);
    setStatusMessage(isVideo ? "Uploading video…" : "Uploading PDF…");

    try {
      const url = await uploadLessonMediaApi(token, file, {
        type,
        slug: slug?.trim() || undefined,
        onProgress: ({ phase: nextPhase, percent: nextPercent, message }) => {
          setPhase(nextPhase);
          setPercent(nextPercent);
          if (message) setStatusMessage(message);
        },
      });
      onChange(url || null);
      setPercent(100);
      setStatusMessage(isVideo ? "Video ready." : "PDF uploaded.");
    } catch (err) {
      setFileName("");
      setPercent(0);
      setPhase(null);
      if (err instanceof ApiError) {
        const firstError = Object.values(err.body?.errors ?? {})[0]?.[0];
        const raw = firstError ?? err.message;
        setError(
          raw === "The file failed to upload."
            ? "Upload rejected by the server. Video must be under 100 MB, and PHP upload_max_filesize must be at least 100M (restart php artisan serve after changing it)."
            : raw,
        );
      } else {
        setError(err instanceof Error ? err.message : "Upload failed.");
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onRemove() {
    onChange(null);
    setFileName("");
    setError("");
    setPhase(null);
    setPercent(0);
    setStatusMessage("");
  }

  return (
    <div className="space-y-2 sm:col-span-2">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {isVideo ? <Video className="size-4" /> : <FileText className="size-4" />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {fileName ||
              (hasMedia
                ? isVideo
                  ? "Video uploaded"
                  : "PDF uploaded"
                : isVideo
                  ? "No video yet"
                  : "No PDF yet")}
          </p>
          {hasMedia && !uploading ? (
            <a
              href={mediaUrl ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="truncate text-xs text-primary hover:underline"
            >
              Open file
            </a>
          ) : (
            <p className="text-xs text-muted-foreground">
              {isVideo ? "MP4 / WebM / MOV · max 100 MB · auto-compress ~720p" : "PDF only · max 20 MB"}
            </p>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => void onFileSelected(event.target.files?.[0] ?? null)}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer bg-background"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload />
          {uploading ? "Working…" : hasMedia ? "Replace" : "Upload"}
        </Button>

        {hasMedia ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer border-destructive/30 bg-background text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={uploading}
            onClick={onRemove}
          >
            <X />
            Remove
          </Button>
        ) : null}
      </div>

      {uploading ? (
        <div className="space-y-1.5 rounded-lg border border-border bg-background px-3 py-2">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground">
              {phase === "compress" ? "Compressing" : "Uploading"}
              {statusMessage ? ` · ${statusMessage}` : ""}
            </span>
            <span className="font-semibold tabular-nums text-foreground">{percent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      ) : null}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
