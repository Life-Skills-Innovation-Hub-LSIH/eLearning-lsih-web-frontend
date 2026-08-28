import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/features/admin/shadcn";

type Props = {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
  width?: "default" | "narrow" | "form";
  children: ReactNode;
};

const widthClass = {
  default: "admin-page",
  narrow: "admin-page admin-page--narrow",
  form: "admin-page admin-page--form",
};

export function AdminPageLayout({
  title,
  description,
  backHref,
  backLabel = "Back",
  actions,
  aside,
  footer,
  width = "default",
  children,
}: Props) {
  return (
    <div className={widthClass[width]}>
      <div className="mb-6 flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          {backHref ? (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 h-8 text-muted-foreground hover:text-foreground"
              nativeButton={false}
              render={<Link href={backHref} />}
            >
              <ArrowLeft />
              {backLabel}
            </Button>
          ) : null}
          {title ? (
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
              {description ? (
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
          ) : description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>

      <div
        className={
          aside
            ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]"
            : ""
        }
      >
        <div className="min-w-0 space-y-6">{children}</div>
        {aside ? <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">{aside}</aside> : null}
      </div>

      {footer}
    </div>
  );
}
