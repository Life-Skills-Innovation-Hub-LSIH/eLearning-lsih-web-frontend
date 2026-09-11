import { RequireAdmin, SubjectsManagement } from "@/features/admin";

export default function AdminSubjectsPage() {
  return (
    <RequireAdmin>
      <SubjectsManagement />
    </RequireAdmin>
  );
}
