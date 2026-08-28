import type { User } from "@/shared/types";
import { Badge } from "@/features/admin/shadcn";
import { formatRoleLabel } from "../lib/user-store";

const roleStyles: Record<User["role"], string> = {
  admin: "border-[#bfd4f5] bg-[#e8f1fb] text-[#054da1]",
  student: "border-border bg-muted text-foreground",
};

type Props = {
  role: User["role"];
  className?: string;
};

export function RoleBadge({ role, className = "" }: Props) {
  return (
    <Badge variant="outline" className={`font-semibold ${roleStyles[role]} ${className}`}>
      {formatRoleLabel(role)}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: "paid" | "unpaid" }) {
  return (
    <Badge
      variant="outline"
      className={
        status === "paid"
          ? "border-emerald-200 bg-emerald-50 font-semibold text-emerald-700"
          : "border-amber-200 bg-amber-50 font-semibold text-amber-700"
      }
    >
      {status === "paid" ? "Paid" : "Unpaid"}
    </Badge>
  );
}
