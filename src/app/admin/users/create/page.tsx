import { CreateUserForm, RequireSuperAdmin } from "@/features/admin";

export default function CreateUserPage() {
  return (
    <RequireSuperAdmin>
      <CreateUserForm />
    </RequireSuperAdmin>
  );
}
