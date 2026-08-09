import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({ courseId: z.string().uuid() });

function makeCode() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LRN-${new Date().getFullYear()}-${rand}`;
}

/**
 * Issues a certificate only when every lesson in the course is completed.
 * Also flags the enrollment as completed.
 */
export const issueCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id, completed")
      .eq("course_id", data.courseId)
      .eq("student_id", userId)
      .maybeSingle();
    if (!enrollment) throw new Error("You are not enrolled in this course.");

    const [{ data: lessons }, { data: progress }] = await Promise.all([
      supabase.from("lessons").select("id").eq("course_id", data.courseId),
      supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("course_id", data.courseId)
        .eq("student_id", userId),
    ]);

    const total = (lessons ?? []).length;
    const done = (progress ?? []).length;
    if (total === 0 || done < total) {
      throw new Error("Finish every lesson in this course to unlock your certificate.");
    }

    if (!enrollment.completed) {
      await supabase
        .from("enrollments")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("id", enrollment.id);
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("certificates")
      .select("*")
      .eq("course_id", data.courseId)
      .eq("student_id", userId)
      .maybeSingle();
    if (existing) return existing;

    const { data: created, error } = await supabaseAdmin
      .from("certificates")
      .insert({ course_id: data.courseId, student_id: userId, certificate_code: makeCode() })
      .select("*")
      .single();
    if (error) throw new Error("Could not issue the certificate. Please try again.");
    return created;
  });
