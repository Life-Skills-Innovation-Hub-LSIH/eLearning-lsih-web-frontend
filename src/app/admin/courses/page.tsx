import { RequireAdmin, CoursesManagement } from "@/features/admin";

export default function AdminCoursesPage() {
  return (
    <RequireAdmin>
      <CoursesManagement />
    </RequireAdmin>
  );
}
