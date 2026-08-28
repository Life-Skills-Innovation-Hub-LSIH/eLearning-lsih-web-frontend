import { CreateUserForm, RequireAdmin } from "@/features/admin";

export default function CreateUserPage() {
  return (
    <RequireAdmin>
      <CreateUserForm />
    </RequireAdmin>
  );
}
