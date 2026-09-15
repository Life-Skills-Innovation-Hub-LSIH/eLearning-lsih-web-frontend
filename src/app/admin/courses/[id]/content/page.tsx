import { RequireAdmin } from "@/features/admin";
import { CourseContentManager } from "@/features/admin/components/CourseContentManager";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CourseContentPage({ params }: Props) {
  const { id } = await params;

  return (
    <RequireAdmin>
      <CourseContentManager courseId={id} />
    </RequireAdmin>
  );
}
