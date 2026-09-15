import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@/features/admin/shadcn";
import { cn } from "@/lib/utils";

export function AdminFormField({
  id,
  label,
  hint,
  required,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-[0.8125rem] font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function AdminFormSection({
  icon: Icon,
  title,
  description,
  children,
  step,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
  step?: number;
}) {
  return (
    <Card className="gap-0 overflow-hidden border-border/80 py-0 shadow-sm">
      <CardHeader className="border-b bg-muted/40 px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {step ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[0.625rem] font-bold text-primary-foreground">
                  {step}
                </span>
              ) : null}
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </div>
            {description ? (
              <CardDescription className="mt-1 text-[0.8125rem]">{description}</CardDescription>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 px-6 py-6">{children}</CardContent>
    </Card>
  );
}

export function AdminReadonlyValue({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-[0.6875rem] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div className="rounded-lg border bg-muted/30 px-3 py-2.5 text-sm font-medium">{value}</div>
    </div>
  );
}

export function AdminFormInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return <Input className={cn("admin-form-input", className)} {...props} />;
}

export function AdminInfoPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-0 overflow-hidden border-border/80 py-0 shadow-sm">
      <CardHeader className="border-b bg-muted/40 px-5 py-4">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="divide-y px-5 py-0">{children}</CardContent>
    </Card>
  );
}

export function AdminInfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-3.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
