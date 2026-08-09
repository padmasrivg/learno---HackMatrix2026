import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { getQuizForStudent, submitQuiz } from "@/lib/quiz.functions";
import { LoadingState, ErrorState } from "@/components/states";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/student/courses/$courseId/quiz/$quizId")({
  head: () => ({
    meta: [
      { title: "Quiz — Learno" },
      { name: "description", content: "Answer the quiz questions and get instantly graded feedback from the server." },
      { property: "og:title", content: "Quiz — Learno" },
      { property: "og:description", content: "Backend-graded quizzes with instant feedback." },
    ],
  }),
  component: QuizPage,
});

type Choice = "A" | "B" | "C" | "D";

function QuizPage() {
  const { courseId, quizId } = Route.useParams();
  const load = useServerFn(getQuizForStudent);
  const send = useServerFn(submitQuiz);
  const [answers, setAnswers] = useState<Record<string, Choice>>({});

  const quiz = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => load({ data: { quizId } }),
    retry: false,
  });

  const submit = useMutation({
    mutationFn: async () => send({ data: { quizId, answers } }),
  });

  if (quiz.isLoading) return <div className="mx-auto max-w-3xl px-4 py-10"><LoadingState label="Loading quiz..." /></div>;
  if (quiz.isError || !quiz.data)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState label={(quiz.error as Error)?.message || "Unable to load this quiz."} />
      </div>
    );

  const { quiz: meta, questions } = quiz.data;
  const result = submit.data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/student/courses/$courseId"
        params={{ courseId }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to course
      </Link>

      <h1 className="mt-4 text-3xl font-bold">{meta.title}</h1>
      <p className="mt-1 text-muted-foreground">{meta.description}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {questions.length} questions · pass mark {meta.pass_percentage}%
      </p>

      {result ? (
        <div className="mt-8 space-y-6">
          <div
            className={`rounded-xl border p-6 text-center soft-shadow ${
              result.passed ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5"
            }`}
          >
            <p className="text-4xl font-bold">{result.percentage}%</p>
            <p className="mt-1 font-medium">
              {result.passed ? "Passed — well done!" : "Not passed yet — review and try again."}
            </p>
            <p className="text-sm text-muted-foreground">
              {result.score} of {result.total} correct
            </p>
          </div>

          <ul className="space-y-3">
            {result.review.map((r, i) => (
              <li key={r.questionId} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-2">
                  {r.isCorrect ? (
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
                  ) : (
                    <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                  )}
                  <div>
                    <p className="font-medium">{i + 1}. {r.question}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your answer: {r.given ?? "not answered"} · Correct answer: {r.correct}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex gap-3">
            <Button onClick={() => { submit.reset(); setAnswers({}); }}>Retake quiz</Button>
            <Button asChild variant="secondary">
              <Link to="/student/courses/$courseId" params={{ courseId }}>Back to course</Link>
            </Button>
          </div>
        </div>
      ) : (
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit.mutate();
          }}
        >
          {questions.map((q, i) => (
            <fieldset key={q.id} className="rounded-xl border border-border bg-card p-5 soft-shadow">
              <legend className="px-1 text-sm text-muted-foreground">Question {i + 1}</legend>
              <p className="font-medium">{q.question_text}</p>
              <div className="mt-3 space-y-2">
                {(
                  [
                    ["A", q.option_a],
                    ["B", q.option_b],
                    ["C", q.option_c],
                    ["D", q.option_d],
                  ] as [Choice, string][]
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                      answers[q.id] === key ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === key}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: key }))}
                      className="accent-primary"
                    />
                    <span className="font-medium">{key}.</span> {label}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          {submit.isError && (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {(submit.error as Error).message}
            </p>
          )}

          <Button type="submit" size="lg" disabled={submit.isPending || Object.keys(answers).length === 0}>
            {submit.isPending ? "Grading..." : "Submit quiz"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Answers are graded on the server — correct answers are never sent to your browser beforehand.
          </p>
        </form>
      )}
    </div>
  );
}
