"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CourseOutline } from "@/components/course/CourseOutline";
import { mockCourses } from "@/lib/data/mock-courses";

export default function AdminCourseDetailPage() {
  const params = useParams<{ id: string }>();
  const course = mockCourses.find((item) => item.id === params.id);

  if (!course) {
    return <p className="text-sm text-[var(--muted)]">Course not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/courses" className="text-sm font-medium text-[var(--brand)] hover:underline">
            ← Back to courses
          </Link>
          <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--ink)]">{course.title}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {course.status} · {course.category}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary opacity-70" disabled>
            Edit
          </button>
          <button type="button" className="btn btn-primary opacity-70" disabled>
            Publish
          </button>
        </div>
      </div>
      <CourseOutline course={course} />
    </div>
  );
}
