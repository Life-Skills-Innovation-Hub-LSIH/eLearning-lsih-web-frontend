"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/shared/api/client";
import {
  removeProfileAvatarApi,
  removeUserAvatarApi,
  uploadProfileAvatarApi,
  uploadUserAvatarApi,
} from "@/shared/api/upload";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";

type Props = {
  token: string;
  name: string;
  firstName?: string;
  avatarUrl?: string | null;
  userId?: string;
  username?: string;
  isSelf?: boolean;
  compact?: boolean;
  onChange: (url: string | null) => void;
  onUploaded?: (url: string | null) => void;
};

const ACCEPT = "image/jpeg,image/jpg,image/png,image/gif,image/webp";

export function AvatarUploadField({
  token,
  name,
  firstName,
  avatarUrl,
  userId,
  username,
  isSelf = false,
  compact = false,
  onChange,
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const previewUrl = localPreview || avatarUrl || null;

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
      let url: string;
      if (isSelf) {
        url = await uploadProfileAvatarApi(token, file);
      } else {
        url = await uploadUserAvatarApi(token, file, {
          userId,
          username: username?.trim() || undefined,
        });
      }
      onChange(url || null);
      onUploaded?.(url || null);
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
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function onRemove() {
    setError("");
    setUploading(true);
    try {
      if (avatarUrl) {
        if (isSelf) {
          await removeProfileAvatarApi(token);
        } else if (userId) {
          await removeUserAvatarApi(token, userId);
        }
      }
      onChange(null);
      onUploaded?.(null);
      setLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove photo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <UserAvatar
          name={name}
          firstName={firstName}
          avatarUrl={previewUrl}
          size="xl"
        />

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
              className="bg-background"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload />
              {uploading ? "Uploading…" : previewUrl ? "Change photo" : "Upload photo"}
            </Button>

            {previewUrl ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-destructive/30 bg-background text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={uploading}
                onClick={() => void onRemove()}
              >
                <X />
                Remove
              </Button>
            ) : null}
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {compact ? (
              "JPG, PNG, GIF, or WebP · Max 5 MB"
            ) : (
              <>
                JPG, PNG, GIF, or WebP. Max 5 MB. Images are resized and compressed automatically.
                Saved to{" "}
                <span className="font-medium text-foreground">
                  user/image/{username?.trim() || "username"}/
                </span>{" "}
                in R2.
              </>
            )}
          </p>
        </div>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
