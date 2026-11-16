import { CouponsManagement, RequireAdmin } from "@/features/admin";

export default function AdminCouponsPage() {
  return (
    <RequireAdmin>
      <CouponsManagement />
    </RequireAdmin>
  );
}
