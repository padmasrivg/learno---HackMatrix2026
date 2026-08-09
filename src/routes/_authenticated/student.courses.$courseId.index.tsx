import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CheckCircle2, Circle, HelpCircle, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCourseDetail } from "@/lib/courses";
import { issueCertificate } from "@/lib/certificate.functions";
import { useAuth } from "@/lib/auth";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/student/courses/$courseId")({
  head: () => ({
    meta: [
      { title: "Course workspace — Learno" },
      { name: "description", content: "Work through lessons, take quizzes and track your progress in this course." },
      { property: "og:title", content: "Course workspace — Learno" },
      { property: "og:description", content: "Lessons, quizzes and progress for your enrolled course." },
    ],
  }),
  component: StudentCourse,
});

function StudentCourse() {
  const { courseId } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const issue = useServerFn(issueCertificate);

  const detail = useQuery({ queryKey: ["course", courseId], queryFn: () => fetchCourseDetail(courseId) });
  const progress = useQuery({
    queryKey: ["progress", courseId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: done }, { data: enrollment }, { data: cert }] = await Promise.all([
        supabase.from("lesson_progress").select("lesson_id").eq("course_id", courseId).eq("student_id", user!.id),
        supabase.from("enrollments").select("*").eq("course_id", courseId).eq("student_id", user!.id).maybeSingle(),
        supabase.from("certificates").select("*").eq("course_id", courseId).eq("student_id", user!.id).maybeSingle(),
      ]);
      return { done: (done ?? []).map((d) => d.lesson_id), enrollment, certificate: cert };
    },
  });

  const claim = useMutation({
    mutationFn: async () => issue({ data: { courseId } }),
    onSuccess: async () => {
      toast.success("Certificate issued!");
      await queryClient.invalidateQueries();
      navigate({ to: "/student/certificates" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (detail.isLoading || progress.isLoading) return <div className="mx-auto max-w-5xl px-4 py-10"><LoadingState /></div>;
  if (detail.isError || progress.isError) return <div className="mx-auto max-w-5xl px-4 py-10"><ErrorState label="Unable to load this course." /></div>;
  if (!detail.data) return <div className="mx-auto max-w-5xl px-4 py-10"><EmptyState title="Course not found" /></div>;
  if (!progress.data?.enrollment)
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <EmptyState
          title="You are not enrolled in this course"
          action={
            <Button asChild size="sm" className="mt-2">
              <Link to="/courses/$courseId" params={{ courseId }}>Go to course page</Link>
            </Button>
          }
        />
      </div>
    );

  const { course, lessons, quizzes } = detail.data;
  const done = new Set(progress.data.done);
  const pct = lessons.length ? Math.round((done.size / lessons.length) * 100) : 0;
  const allDone = lessons.length > 0 && done.size === lessons.length;
  const nextLesson = lessons.find((l) => !done.has(l.id)) ?? lessons[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm text-muted-foreground">{course.category}</p>
      <h1 className="mt-1 text-3xl font-bold">{course.title}</h1>

      <div className="mt-6 rounded-xl border border-border bg-card p-5 soft-shadow">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Course progress</span>
          <span className="text-muted-foreground">
            {done.size} / {lessons.length} lessons · {pct}%
          </span>
        </div>
        <Progress value={pct} className="mt-3 h-2" />
        <div className="mt-4 flex flex-wrap gap-3">
          {nextLesson && (
            <Button asChild>
              <Link
                to="/student/courses/$courseId/lesson/$lessonId"
                params={{ courseId, lessonId: nextLesson.id }}
              >
                {done.size === 0 ? "Start course" : allDone ? "Review lessons" : "Continue learning"}
              </Link>
            </Button>
          )}
          {allDone &&
            (progress.data.certificate ? (
              <Button asChild variant="secondary">
                <Link to="/student/certificates">
                  <Award className="mr-1 size-4" /> View certificate
                </Link>
              </Button>
            ) : (
              <Button variant="secondary" disabled={claim.isPending} onClick={() => claim.mutate()}>
                <Award className="mr-1 size-4" />
                {claim.isPending ? "Issuing..." : "Claim certificate"}
              </Button>
            ))}
        </div>
      </div>

      <h2 className="mt-10 text-xl font-bold">Lessons</h2>
      <ol className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {lessons.map((l) => (
          <li key={l.id}>
            <Link
              to="/student/courses/$courseId/lesson/$lessonId"
              params={{ courseId, lessonId: l.id }}
              className="flex items-center gap-4 p-4 hover:bg-secondary"
            >
              {done.has(l.id) ? (
                <CheckCircle2 className="size-5 shrink-0 text-success" />
              ) : (
                <Circle className="size-5 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0">
                <p className="font-medium">{l.title}</p>
                <p className="truncate text-sm text-muted-foreground">{l.description}</p>
              </div>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">{l.duration_minutes} min</span>
            </Link>
          </li>
        ))}
      </ol>

      {quizzes.length > 0 && (
        <>
          <h2 className="mt-10 text-xl font-bold">Quizzes</h2>
          <ul className="mt-4 space-y-3">
            {quizzes.map((q) => (
              <li key={q.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <HelpCircle className="size-5 text-primary" />
                <div>
                  <p className="font-medium">{q.title}</p>
                  <p className="text-sm text-muted-foreground">Pass mark {q.pass_percentage}%</p>
                </div>
                <Button asChild size="sm" className="ml-auto">
                  <Link to="/student/courses/$courseId/quiz/$quizId" params={{ courseId, quizId: q.id }}>
                    Take quiz
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
