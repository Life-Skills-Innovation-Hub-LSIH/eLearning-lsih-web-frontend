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
  const hasHeader = Boolean(backHref || title || description || actions);

  return (
    <div className={widthClass[width]}>
      {hasHeader ? (
        <div className="mb-6 space-y-4 border-b border-[var(--admin-border)] pb-6">
          {backHref ? (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 h-8 text-[var(--admin-muted)] hover:text-[var(--admin-brand)]"
              render={<Link href={backHref} />}
            >
              <ArrowLeft />
              {backLabel}
            </Button>
          ) : null}

          {title || description || actions ? (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {title ? (
                  <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-text)]">
                    {title}
                  </h1>
                ) : null}
                {description ? (
                  <p
                    className={`text-sm leading-relaxed text-[var(--admin-muted)] ${title ? "mt-1.5" : ""}`}
                  >
                    {description}
                  </p>
                ) : null}
              </div>
              {actions ? (
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  {actions}
                </div>
              ) : null}
            </div>
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
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">{aside}</aside>
        ) : null}
      </div>

      {footer}
    </div>
  );
}
