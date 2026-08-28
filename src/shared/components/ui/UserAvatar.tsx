"use client";

import { useState } from "react";
import { getAvatarColor, getAvatarInitial } from "@/shared/lib/avatar";

type Size = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<Size, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-10 w-10 text-base",
  xl: "h-14 w-14 text-xl",
};

type Props = {
  name: string;
  firstName?: string;
  avatarUrl?: string | null;
  size?: Size;
  className?: string;
  title?: string;
};

export function UserAvatar({
  name,
  firstName,
  avatarUrl,
  size = "md",
  className = "",
  title,
}: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = getAvatarInitial(name, firstName);
  const color = getAvatarColor(firstName || name);
  const showImage = Boolean(avatarUrl) && !imageFailed;

  if (showImage && avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={title ?? name}
        title={title ?? name}
        onError={() => setImageFailed(true)}
        className={`shrink-0 rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <span
      title={title ?? name}
      aria-hidden={title ? undefined : true}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: color.background, color: color.text }}
    >
      {initial}
    </span>
  );
}
