import { RequireAdmin, LecturersManagement } from "@/features/admin";

export default function AdminLecturersPage() {
  return (
    <RequireAdmin>
      <LecturersManagement />
    </RequireAdmin>
  );
}
