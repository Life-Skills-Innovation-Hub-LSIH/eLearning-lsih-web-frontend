import { RequireAdmin, LecturerForm } from "@/features/admin";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditLecturerPage({ params }: Props) {
  const { id } = await params;

  return (
    <RequireAdmin>
      <LecturerForm mode="edit" lecturerId={id} />
    </RequireAdmin>
  );
}
