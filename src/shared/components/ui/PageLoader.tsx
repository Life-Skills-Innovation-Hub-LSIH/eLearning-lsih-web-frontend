"use client";

import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  className?: string;
  compact?: boolean;
};

export function PageLoader({
  label = "Loading…",
  className,
  compact = false,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 bg-background text-foreground",
        compact ? "py-10" : "min-h-[40vh] py-16",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="relative size-12">
        <div className="absolute inset-0 rounded-full border-[3px] border-primary/15" />
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-primary border-r-primary/40" />
        <div className="absolute inset-2 animate-pulse rounded-full bg-primary/10" />
      </div>
      <p className="text-sm font-medium tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
