import { EditUserForm, RequireSuperAdmin } from "@/features/admin";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditUserPage({ params }: Props) {
  const { id } = await params;

  return (
    <RequireSuperAdmin>
      <EditUserForm userId={id} />
    </RequireSuperAdmin>
  );
}
