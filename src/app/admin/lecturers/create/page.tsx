import { RequireAdmin, LecturerForm } from "@/features/admin";

export default function CreateLecturerPage() {
  return (
    <RequireAdmin>
      <LecturerForm mode="create" />
    </RequireAdmin>
  );
}
