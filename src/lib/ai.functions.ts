import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  question: z.string().trim().min(3, "Ask a slightly longer question.").max(600),
  lessonId: z.string().uuid().optional(),
  courseTitle: z.string().max(200).optional(),
});

export const askLearnoAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("The AI assistant is not configured right now.");

    let lessonContext = "";
    if (data.lessonId) {
      const { data: lesson } = await context.supabase
        .from("lessons")
        .select("title, description, content")
        .eq("id", data.lessonId)
        .maybeSingle();
      if (lesson) {
        lessonContext = `Lesson title: ${lesson.title}\nSummary: ${lesson.description}\nLesson content:\n${lesson.content}`;
      }
    }

    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const { streamText } = await import("ai");

    const gateway = createLovableAiGatewayProvider(key);

    try {
      const result = streamText({
        model: gateway("google/gemini-3.5-flash"),
        system:
          "You are Learno AI, a patient tutor inside a learning platform. Answer the student's question clearly and pedagogically. Use short paragraphs, concrete examples, and plain language. If the student asks for practice questions, produce them with answers at the end. Stay on educational topics; if asked something unrelated to studying, politely redirect. Keep answers under 300 words unless practice questions are requested.",
        prompt: [
          data.courseTitle ? `Course: ${data.courseTitle}` : "",
          lessonContext,
          `Student question: ${data.question}`,
        ]
          .filter(Boolean)
          .join("\n\n"),
      });

      const text = await result.text;
      return { answer: text };
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("429")) throw new Error("Learno AI is busy right now. Please try again in a moment.");
      if (message.includes("402")) throw new Error("The AI assistant has run out of credits.");
      throw new Error("Learno AI is unavailable right now. The rest of your course still works.");
    }
  });
