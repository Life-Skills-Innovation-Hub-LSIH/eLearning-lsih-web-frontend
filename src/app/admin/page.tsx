"use client";

import { mockCourses } from "@/lib/data/mock-courses";
import { countLessons, countQuizzes } from "@/lib/data/mock-courses";

export default function AdminDashboardPage() {
  const published = mockCourses.filter((course) => course.status === "published").length;
  const draft = mockCourses.length - published;
  const totalLessons = mockCourses.reduce((sum, course) => sum + countLessons(course), 0);
  const totalQuizzes = mockCourses.reduce((sum, course) => sum + countQuizzes(course), 0);

  const cards = [
    { label: "Total courses", value: mockCourses.length },
    { label: "Published", value: published },
    { label: "Draft", value: draft },
    { label: "Students (demo)", value: 214 },
    { label: "Lessons", value: totalLessons },
    { label: "Quizzes", value: totalQuizzes },
    { label: "Revenue (demo)", value: "$2,480" },
    { label: "Pending payments", value: 3 },
  ];

  return (
    <div className="space-y-6">
      <p className="text-[var(--muted)]">
        Static admin dashboard. Real stats will come from the Laravel API later.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="surface p-5">
            <p className="text-sm text-[var(--muted)]">{card.label}</p>
            <p className="mt-2 font-display text-3xl text-[var(--ink)]">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
