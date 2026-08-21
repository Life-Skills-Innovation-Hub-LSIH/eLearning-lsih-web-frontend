"use client";

import { useState } from "react";
import { CheckCircle, Clock, Star, Users } from "lucide-react";
import { CourseOutline } from "./CourseOutline";
import { EnrollButton } from "./EnrollButton";
import type { Course } from "@/shared/types";
import {
  countLessons,
  countQuizzes,
  getCourseDurationLabel,
  getLevelLabel,
} from "../data/mock-courses";

type Props = {
  course: Course;
};

type Tab = "about" | "curriculum" | "benefits";

export function CourseDetailClient({ course }: Props) {
  const [tab, setTab] = useState<Tab>("about");

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "about", label: "About course" },
    { id: "curriculum", label: "Curriculum" },
    { id: "benefits", label: "What you will learn" },
  ];

  return (
    <main className="bg-gray-50">
      <section className="bg-[#054DA1]/5">
        <div className="container-page grid gap-8 py-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4 text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
              {course.category}
            </p>
            <h1 className="text-3xl font-semibold text-[var(--brand)] md:text-4xl">
              {course.title}
            </h1>
            <p className="text-[var(--muted)]">{course.shortDescription}</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--muted)] lg:justify-start">
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {course.rating.toFixed(1)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" />
                {course.studentsCount} students
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {getCourseDurationLabel(course)} · {getLevelLabel(course.level)}
              </span>
            </div>
            <p className="text-sm text-[var(--muted)]">Instructor: {course.instructor}</p>
          </div>

          <div className="surface mx-auto w-full max-w-md space-y-4 p-6">
            <div
              className={`h-40 rounded-2xl bg-gradient-to-br ${course.thumbnailGradient}`}
            />
            <div>
              <p className="text-sm text-[var(--muted)]">Price</p>
              <p className="text-3xl font-bold text-[var(--ink)]">
                {course.price === 0 ? "Free" : `$${course.price}`}
              </p>
            </div>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>{course.modules.length} modules</li>
              <li>{countLessons(course)} lessons (video + PDF)</li>
              <li>{countQuizzes(course)} quizzes (module + course)</li>
            </ul>
            <EnrollButton courseId={course.id} slug={course.slug} price={course.price} />
          </div>
        </div>
      </section>

      <section className="container-page py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                tab === item.id
                  ? "bg-[var(--brand)] text-white"
                  : "border border-[var(--line)] bg-white text-[var(--brand)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "about" ? (
          <div className="surface max-w-3xl p-6 leading-7 text-[var(--muted)]">
            {course.description}
          </div>
        ) : null}

        {tab === "curriculum" ? (
          <div className="max-w-3xl">
            <CourseOutline course={course} />
          </div>
        ) : null}

        {tab === "benefits" ? (
          <div className="surface max-w-3xl space-y-3 p-6">
            {course.whatYouWillLearn.map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm text-[var(--ink)]">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
