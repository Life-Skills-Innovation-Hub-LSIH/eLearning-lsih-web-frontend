import { StudentDetail } from "@/features/admin/components/StudentDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminStudentDetailPage({ params }: Props) {
  const { id } = await params;

  return <StudentDetail studentId={id} />;
}
