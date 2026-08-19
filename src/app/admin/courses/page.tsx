"use client";

import Link from "next/link";
import { countLessons, countQuizzes, mockCourses } from "@/lib/data/mock-courses";

export default function AdminCoursesPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[var(--muted)]">
          Each course has modules → lessons (video/PDF) → module quiz + course quiz.
        </p>
        <button type="button" className="btn btn-primary opacity-70" disabled>
          Create course (API later)
        </button>
      </div>

      <div className="overflow-hidden surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--background)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Course</th>
              <th className="px-4 py-3 font-medium">Structure</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {mockCourses.map((course) => (
              <tr key={course.id} className="border-t border-[var(--line)]">
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--ink)]">{course.title}</p>
                  <p className="text-[var(--muted)]">{course.category}</p>
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {course.modules.length} modules · {countLessons(course)} lessons ·{" "}
                  {countQuizzes(course)} quizzes
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      course.status === "published"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {course.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {course.price === 0 ? "Free" : `$${course.price}`}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="font-semibold text-[var(--brand)]"
                  >
                    View structure
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
