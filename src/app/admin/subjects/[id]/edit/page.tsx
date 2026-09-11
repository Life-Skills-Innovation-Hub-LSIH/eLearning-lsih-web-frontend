import { RequireAdmin, SubjectForm } from "@/features/admin";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditSubjectPage({ params }: Props) {
  const { id } = await params;

  return (
    <RequireAdmin>
      <SubjectForm mode="edit" subjectId={id} />
    </RequireAdmin>
  );
}
