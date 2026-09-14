"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/shared/api/client";
import { uploadSubjectIconApi } from "@/shared/api/upload";

type Props = {
  token: string;
  iconUrl?: string | null;
  slug?: string;
  onChange: (url: string | null) => void;
};

const ACCEPT = "image/jpeg,image/jpg,image/png,image/gif,image/webp,image/avif,image/bmp,.jpg,.jpeg,.png,.gif,.webp,.avif,.bmp";

export function SubjectIconUploadField({ token, iconUrl, slug, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const previewUrl = localPreview || iconUrl || null;

  async function onFileSelected(file: File | null) {
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });

    setError("");
    setUploading(true);
    try {
      const url = await uploadSubjectIconApi(token, file, {
        slug: slug?.trim() || undefined,
      });
      onChange(url || null);
      setLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    } catch (err) {
      setLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      if (err instanceof ApiError) {
        const firstError = Object.values(err.body?.errors ?? {})[0]?.[0];
        setError(firstError ?? err.message);
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
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setError("");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-6 text-muted-foreground" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(event) => void onFileSelected(event.target.files?.[0] ?? null)}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer bg-background"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload />
              {uploading ? "Uploading…" : previewUrl ? "Change icon" : "Upload icon"}
            </Button>

            {previewUrl ? (
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

          <p className="text-xs leading-relaxed text-muted-foreground">
            JPG, PNG, GIF, WebP, AVIF, or BMP. Max 5 MB upload — auto-compressed under 100 KB.
          </p>
        </div>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
