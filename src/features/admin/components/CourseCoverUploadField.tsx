"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  /** Already-saved cover URL from the course record. */
  coverUrl?: string | null;
  /** Local file waiting to upload on form save. */
  pendingFile?: File | null;
  onPendingFileChange: (file: File | null) => void;
  /** Clear the saved remote cover (will be removed when the form is saved). */
  onRemoveSaved: () => void;
  disabled?: boolean;
};

const ACCEPT =
  "image/jpeg,image/jpg,image/png,image/gif,image/webp,image/avif,image/bmp,.jpg,.jpeg,.png,.gif,.webp,.avif,.bmp";
const MAX_BYTES = 5 * 1024 * 1024;

export function CourseCoverUploadField({
  coverUrl,
  pendingFile,
  onPendingFileChange,
  onRemoveSaved,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pendingFile) {
      setLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }

    const objectUrl = URL.createObjectURL(pendingFile);
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });

    return () => URL.revokeObjectURL(objectUrl);
  }, [pendingFile]);

  const previewUrl = localPreview || coverUrl || null;

  function onFileSelected(file: File | null) {
    if (!file) return;

    if (file.size > MAX_BYTES) {
      setError("Image must be 5 MB or smaller.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setError("");
    // Keep the file local only — upload happens when the course form saves successfully.
    onPendingFileChange(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onRemove() {
    setError("");
    onPendingFileChange(null);
    onRemoveSaved();
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40">
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
            onChange={(event) => onFileSelected(event.target.files?.[0] ?? null)}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer bg-background"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              <Upload />
              {previewUrl ? "Change cover" : "Choose cover"}
            </Button>

            {previewUrl ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer border-destructive/30 bg-background text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={disabled}
                onClick={onRemove}
              >
                <X />
                Remove
              </Button>
            ) : null}
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            JPG, PNG, GIF, WebP, AVIF, or BMP. Max 5 MB. The image is uploaded to cloud storage only
            when you save the course successfully.
            {pendingFile ? " New cover selected — waiting for save." : null}
          </p>
        </div>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
