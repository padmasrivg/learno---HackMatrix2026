import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCourseDetail } from "@/lib/courses";
import { useAuth } from "@/lib/auth";
import { AskLearnoAI } from "@/components/AskLearnoAI";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/student/courses/$courseId/lesson/$lessonId")({
  head: () => ({
    meta: [
      { title: "Lesson — Learno" },
      { name: "description", content: "Read the lesson, ask Learno AI for help and mark it complete when you are done." },
      { property: "og:title", content: "Lesson — Learno" },
      { property: "og:description", content: "Learn with an AI study assistant beside you." },
    ],
  }),
  component: LessonView,
});

function LessonView() {
  const { courseId, lessonId } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const detail = useQuery({ queryKey: ["course", courseId], queryFn: () => fetchCourseDetail(courseId) });
  const progress = useQuery({
    queryKey: ["lesson-progress", courseId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("course_id", courseId)
        .eq("student_id", user!.id);
      return (data ?? []).map((d) => d.lesson_id);
    },
  });

  const complete = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("lesson_progress")
        .upsert(
          { student_id: user!.id, lesson_id: lessonId, course_id: courseId },
          { onConflict: "student_id,lesson_id" },
        );
      if (error) throw error;
      await supabase
        .from("enrollments")
        .update({ last_lesson_id: lessonId })
        .eq("course_id", courseId)
        .eq("student_id", user!.id);
    },
    onSuccess: async () => {
      toast.success("Lesson marked complete");
      await queryClient.invalidateQueries();
    },
    onError: () => toast.error("Could not save your progress. Please try again."),
  });

  if (detail.isLoading || progress.isLoading) return <div className="mx-auto max-w-4xl px-4 py-10"><LoadingState /></div>;
  if (detail.isError) return <div className="mx-auto max-w-4xl px-4 py-10"><ErrorState label="Unable to load this lesson." /></div>;

  const lessons = detail.data?.lessons ?? [];
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) return <div className="mx-auto max-w-4xl px-4 py-10"><EmptyState title="Lesson not found" /></div>;

  const index = lessons.findIndex((l) => l.id === lessonId);
  const prev = index > 0 ? lessons[index - 1] : null;
  const next = index < lessons.length - 1 ? lessons[index + 1] : null;
  const done = new Set(progress.data ?? []);
  const isDone = done.has(lessonId);
  const pct = lessons.length ? Math.round((done.size / lessons.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        to="/student/courses/$courseId"
        params={{ courseId }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to course
      </Link>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Lesson {index + 1} of {lessons.length}</span>
        <span>{pct}% complete</span>
      </div>
      <Progress value={pct} className="mt-2 h-1.5" />

      <h1 className="mt-6 text-3xl font-bold">{lesson.title}</h1>
      <p className="mt-2 text-muted-foreground">{lesson.description}</p>

      <article className="mt-6 whitespace-pre-wrap rounded-xl border border-border bg-card p-6 leading-relaxed soft-shadow">
        {lesson.content}
      </article>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={() => complete.mutate()} disabled={isDone || complete.isPending}>
          <CheckCircle2 className="mr-1 size-4" />
          {isDone ? "Completed" : complete.isPending ? "Saving..." : "Mark as complete"}
        </Button>
        {prev && (
          <Button asChild variant="secondary">
            <Link to="/student/courses/$courseId/lesson/$lessonId" params={{ courseId, lessonId: prev.id }}>
              <ArrowLeft className="mr-1 size-4" /> Previous
            </Link>
          </Button>
        )}
        {next && (
          <Button asChild variant="secondary">
            <Link to="/student/courses/$courseId/lesson/$lessonId" params={{ courseId, lessonId: next.id }}>
              Next <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        )}
      </div>

      <div className="mt-8">
        <AskLearnoAI lessonId={lessonId} courseTitle={detail.data?.course.title ?? ""} />
      </div>
    </div>
  );
}
