import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Bot, Sparkles } from "lucide-react";
import { askLearnoAI } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const suggestions = [
  "Explain this lesson simply",
  "Give me a real-world example",
  "Create 3 practice questions",
];

export function AskLearnoAI({ lessonId, courseTitle }: { lessonId?: string; courseTitle?: string }) {
  const ask = useServerFn(askLearnoAI);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (q: string) => ask({ data: { question: q, lessonId, courseTitle } }),
    onMutate: () => {
      setError(null);
      setAnswer(null);
    },
    onSuccess: (res) => setAnswer(res.answer),
    onError: (e: Error) =>
      setError(e.message || "Learno AI is unavailable right now. Everything else still works."),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (q.length < 3) {
      setError("Please type a slightly longer question.");
      return;
    }
    mutation.mutate(q);
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 soft-shadow">
      <div className="flex items-center gap-2">
        <span className="surface-gradient flex size-8 items-center justify-center rounded-lg text-primary-foreground">
          <Bot className="size-4" />
        </span>
        <div>
          <h3 className="font-semibold">Ask Learno AI</h3>
          <p className="text-xs text-muted-foreground">Your study assistant for this lesson</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question..."
          maxLength={600}
          aria-label="Ask Learno AI a question"
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Thinking..." : "Ask"}
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQuestion(s);
              mutation.mutate(s);
            }}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Sparkles className="size-3" /> {s}
          </button>
        ))}
      </div>

      {mutation.isPending && (
        <p className="mt-4 text-sm text-muted-foreground">Learno AI is writing an answer...</p>
      )}
      {error && (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {answer && (
        <div className="mt-4 whitespace-pre-wrap rounded-md bg-secondary p-4 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </section>
  );
}
