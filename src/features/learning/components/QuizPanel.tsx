"use client";

import { useMemo, useState } from "react";
import type { CatalogQuiz } from "../api/enrollment-api";

type Props = {
  quiz: CatalogQuiz;
  completed: boolean;
  submitting?: boolean;
  onSubmit: (answers: Record<string, number>) => Promise<{
    score_percent: number;
    passed: boolean;
    pass_score: number;
  } | void>;
};

export function QuizPanel({ quiz, completed, submitting = false, onSubmit }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{
    score_percent: number;
    passed: boolean;
    pass_score: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const questions = quiz.questions ?? [];
  const allAnswered = useMemo(
    () => questions.every((question) => answers[String(question.id)] != null),
    [answers, questions],
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
          Lesson quiz
        </p>
        <h2 className="mt-2 font-display text-3xl text-[var(--ink)]">{quiz.title}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Passing score: {quiz.pass_score}%
          {completed ? " · Already passed" : ""}
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={String(question.id)} className="surface p-4">
            <p className="font-medium text-[var(--ink)]">
              {index + 1}. {question.question_text}
            </p>
            <div className="mt-3 space-y-2">
              {(question.options ?? []).map((option) => {
                const selected = answers[String(question.id)] === Number(option.id);
                return (
                  <label
                    key={String(option.id)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm ${
                      selected
                        ? "border-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_8%,white)]"
                        : "border-[var(--line)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${question.id}`}
                      checked={selected}
                      disabled={completed || busy || submitting}
                      onChange={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [String(question.id)]: Number(option.id),
                        }))
                      }
                    />
                    {option.option_text}
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
          disabled={!allAnswered || busy || submitting}
          onClick={() => {
            setBusy(true);
            setError("");
            void onSubmit(answers)
              .then((next) => {
                if (next) setResult(next);
              })
              .catch((err) => {
                setError(err instanceof Error ? err.message : "Failed to submit quiz.");
              })
              .finally(() => setBusy(false));
          }}
        >
          {busy || submitting ? "Submitting…" : "Submit quiz"}
        </button>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {result ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            result.passed
              ? "bg-[color-mix(in_srgb,var(--success)_12%,white)] text-[var(--success)]"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          Score: {result.score_percent}%.{" "}
          {result.passed
            ? "Passed — progress saved."
            : `Not passed yet (need ${result.pass_score}%). Try again.`}
        </div>
      ) : null}
    </div>
  );
}
