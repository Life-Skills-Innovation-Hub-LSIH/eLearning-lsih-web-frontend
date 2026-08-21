"use client";

import Link from "next/link";
import { countLessons, countQuizzes, mockCourses } from "@/features/courses";

export default function AdminCoursesPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-[var(--ink)]">Courses</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{mockCourses.length} courses</p>
        </div>
        <button type="button" className="btn btn-primary opacity-70" disabled>
          Create course
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[var(--background)] text-[var(--muted)]">
            <tr>
              <th className="px-5 py-3 font-medium">Course</th>
              <th className="px-5 py-3 font-medium">Structure</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {mockCourses.map((course) => (
              <tr key={course.id} className="border-t border-[var(--line)]">
                <td className="px-5 py-4">
                  <p className="font-medium text-[var(--ink)]">{course.title}</p>
                  <p className="text-[var(--muted)]">{course.category}</p>
                </td>
                <td className="px-5 py-4 text-[var(--muted)]">
                  {course.modules.length} modules · {countLessons(course)} lessons ·{" "}
                  {countQuizzes(course)} quizzes
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      course.status === "published"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {course.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {course.price === 0 ? "Free" : `$${course.price}`}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="font-semibold text-[var(--brand)] hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
