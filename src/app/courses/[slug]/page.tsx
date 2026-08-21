import { notFound } from "next/navigation";
import { getCourseBySlug, getPublishedCourses } from "@/features/courses";
import { CourseDetailClient } from "@/features/courses";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPublishedCourses().map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  return { title: course?.title ?? "Course" };
}

export default async function CourseDetailsPage({ params }: Props) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course || course.status !== "published") notFound();

  return <CourseDetailClient course={course} />;
}
