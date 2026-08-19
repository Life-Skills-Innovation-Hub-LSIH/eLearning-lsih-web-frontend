"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CourseOutline } from "@/components/course/CourseOutline";
import { mockCourses } from "@/lib/data/mock-courses";

export default function AdminCourseDetailPage() {
  const params = useParams<{ id: string }>();
  const course = mockCourses.find((item) => item.id === params.id);

  if (!course) {
    return <p>Course not found.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/courses" className="text-sm text-[var(--brand)]">
            ← Back to courses
          </Link>
          <h2 className="mt-2 font-display text-3xl text-[var(--ink)]">{course.title}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Status: {course.status} · Category: {course.category}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary opacity-70" disabled>
            Edit (API later)
          </button>
          <button type="button" className="btn btn-primary opacity-70" disabled>
            Publish controls later
          </button>
        </div>
      </div>
      <CourseOutline course={course} />
    </div>
  );
}
