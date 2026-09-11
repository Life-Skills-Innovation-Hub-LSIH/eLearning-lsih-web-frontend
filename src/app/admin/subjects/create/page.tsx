import { RequireAdmin, SubjectForm } from "@/features/admin";

export default function CreateSubjectPage() {
  return (
    <RequireAdmin>
      <SubjectForm mode="create" />
    </RequireAdmin>
  );
}
