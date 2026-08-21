import { RequireSuperAdmin, UsersManagement } from "@/features/admin";

export default function AdminUsersPage() {
  return (
    <RequireSuperAdmin>
      <UsersManagement />
    </RequireSuperAdmin>
  );
}
