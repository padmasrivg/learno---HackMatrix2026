import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GetQuizInput = z.object({ quizId: z.string().uuid() });

const SubmitInput = z.object({
  quizId: z.string().uuid(),
  answers: z.record(z.string().uuid(), z.enum(["A", "B", "C", "D"])),
});

export const getQuizForStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GetQuizInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: quiz, error } = await context.supabase
      .from("quizzes")
      .select("id, title, description, course_id, pass_percentage")
      .eq("id", data.quizId)
      .maybeSingle();
    if (error) throw new Error("Unable to load quiz.");
    if (!quiz) throw new Error("Quiz not found.");

    const { data: enrollment } = await context.supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", quiz.course_id)
      .eq("student_id", context.userId)
      .maybeSingle();
    if (!enrollment) throw new Error("Enrol in this course to take the quiz.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: questions } = await supabaseAdmin
      .from("questions")
      .select("id, question_text, option_a, option_b, option_c, option_d, order_index")
      .eq("quiz_id", quiz.id)
      .order("order_index", { ascending: true });

    // correct_option is deliberately never selected here.
    return { quiz, questions: questions ?? [] };
  });

export const submitQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SubmitInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: quiz } = await context.supabase
      .from("quizzes")
      .select("id, course_id, pass_percentage, title")
      .eq("id", data.quizId)
      .maybeSingle();
    if (!quiz) throw new Error("Quiz not found.");

    const { data: enrollment } = await context.supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", quiz.course_id)
      .eq("student_id", context.userId)
      .maybeSingle();
    if (!enrollment) throw new Error("Enrol in this course to take the quiz.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: questions } = await supabaseAdmin
      .from("questions")
      .select("id, question_text, correct_option, order_index")
      .eq("quiz_id", quiz.id)
      .order("order_index", { ascending: true });

    const list = questions ?? [];
    if (list.length === 0) throw new Error("This quiz has no questions yet.");

    const review = list.map((q) => {
      const given = data.answers[q.id] ?? null;
      return {
        questionId: q.id,
        question: q.question_text,
        given,
        correct: q.correct_option,
        isCorrect: given === q.correct_option,
      };
    });

    const score = review.filter((r) => r.isCorrect).length;
    const total = list.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= quiz.pass_percentage;

    const { error: insertError } = await supabaseAdmin.from("quiz_attempts").insert({
      student_id: context.userId,
      quiz_id: quiz.id,
      course_id: quiz.course_id,
      score,
      total_questions: total,
      percentage,
      passed,
    });
    if (insertError) throw new Error("Could not save your attempt. Please try again.");

    return { score, total, percentage, passed, review, quizTitle: quiz.title, courseId: quiz.course_id };
  });
