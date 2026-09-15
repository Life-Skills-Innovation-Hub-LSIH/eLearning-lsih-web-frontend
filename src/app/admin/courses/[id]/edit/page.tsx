import { RequireAdmin, CourseForm } from "@/features/admin";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCoursePage({ params }: Props) {
  const { id } = await params;

  return (
    <RequireAdmin>
      <CourseForm mode="edit" courseId={id} />
    </RequireAdmin>
  );
}
