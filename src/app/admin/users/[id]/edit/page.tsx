import { EditUserForm, RequireAdmin } from "@/features/admin";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditUserPage({ params }: Props) {
  const { id } = await params;

  return (
    <RequireAdmin>
      <EditUserForm userId={id} />
    </RequireAdmin>
  );
}
