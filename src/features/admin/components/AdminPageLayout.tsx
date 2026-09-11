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
  const showToolbar = Boolean(backHref || actions);
  const stickyToolbar = Boolean(actions);

  return (
    <div className={widthClass[width]}>
      {showToolbar ? (
        <div
          className={
            stickyToolbar
              ? "sticky top-14 z-20 -mx-6 mb-6 border-b border-border/80 bg-background/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:-mx-8 lg:px-8"
              : "mb-6 space-y-4 border-b border-border/80 pb-6"
          }
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              {backHref ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-2 h-8 text-muted-foreground hover:text-foreground"
                  render={<Link href={backHref} />}
                >
                  <ArrowLeft />
                  {backLabel}
                </Button>
              ) : null}
            </div>
            {actions ? (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                {actions}
              </div>
            ) : null}
          </div>

          {!stickyToolbar && (title || description) ? (
            <div className="mt-4">
              {title ? (
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
              ) : null}
              {description ? (
                <p className={`text-sm leading-relaxed text-muted-foreground ${title ? "mt-1.5" : ""}`}>
                  {description}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {stickyToolbar && (title || description) ? (
        <div className="mb-6">
          {title ? (
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          ) : null}
          {description ? (
            <p className={`text-sm leading-relaxed text-muted-foreground ${title ? "mt-1.5" : ""}`}>
              {description}
            </p>
          ) : null}
        </div>
      ) : !showToolbar && (title || description) ? (
        <div className="mb-6 space-y-4 border-b border-border/80 pb-6">
          {title ? (
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          ) : null}
          {description ? (
            <p className={`text-sm leading-relaxed text-muted-foreground ${title ? "mt-1.5" : ""}`}>
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div
        className={
          aside
            ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]"
            : ""
        }
      >
        <div className="min-w-0 space-y-6">{children}</div>
        {aside ? (
          <aside
            className={`space-y-4 lg:sticky lg:self-start ${stickyToolbar ? "lg:top-28" : "lg:top-24"}`}
          >
            {aside}
          </aside>
        ) : null}
      </div>

      {footer}
    </div>
  );
}
