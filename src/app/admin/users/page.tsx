import { RequireAdmin, UsersManagement } from "@/features/admin";

export default function AdminUsersPage() {
  return (
    <RequireAdmin>
      <UsersManagement />
    </RequireAdmin>
  );
}
