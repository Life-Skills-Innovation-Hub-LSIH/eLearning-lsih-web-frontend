"use client";

import { useMemo, useState } from "react";
import type { Quiz } from "@/types";

type Props = {
  quiz: Quiz;
  completed: boolean;
  onPassed: () => void;
};

export function QuizPanel({ quiz, completed, onPassed }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    if (!submitted) return 0;
    const correct = quiz.questions.filter(
      (question) => answers[question.id] === question.correctIndex,
    ).length;
    return Math.round((correct / quiz.questions.length) * 100);
  }, [answers, quiz.questions, submitted]);

  const passed = score >= quiz.passingScore;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
          {quiz.level === "module" ? "End of module quiz" : "End of course quiz"}
        </p>
        <h2 className="mt-2 font-display text-3xl text-[var(--ink)]">{quiz.title}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Passing score: {quiz.passingScore}%
          {completed ? " · Already completed" : ""}
        </p>
      </div>

      <div className="space-y-4">
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="surface p-4">
            <p className="font-medium text-[var(--ink)]">
              {index + 1}. {question.prompt}
            </p>
            <div className="mt-3 space-y-2">
              {question.options.map((option, optionIndex) => {
                const selected = answers[question.id] === optionIndex;
                return (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm ${
                      selected
                        ? "border-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_8%,white)]"
                        : "border-[var(--line)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={selected}
                      disabled={completed}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))
                      }
                    />
                    {option}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!completed ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setSubmitted(true);
            const correct = quiz.questions.filter(
              (question) => answers[question.id] === question.correctIndex,
            ).length;
            const nextScore = Math.round((correct / quiz.questions.length) * 100);
            if (nextScore >= quiz.passingScore) onPassed();
          }}
        >
          Submit quiz
        </button>
      ) : null}

      {submitted ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            passed
              ? "bg-[color-mix(in_srgb,var(--success)_12%,white)] text-[var(--success)]"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          Score: {score}%. {passed ? "Passed — progress saved." : "Not passed yet. Try again."}
        </div>
      ) : null}
    </div>
  );
}
