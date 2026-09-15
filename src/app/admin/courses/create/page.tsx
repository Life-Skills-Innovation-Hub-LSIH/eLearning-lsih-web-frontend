import { RequireAdmin, CourseForm } from "@/features/admin";

export default function CreateCoursePage() {
  return (
    <RequireAdmin>
      <CourseForm mode="create" />
    </RequireAdmin>
  );
}
