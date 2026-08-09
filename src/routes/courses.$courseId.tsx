import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpen, Clock, HelpCircle, Users, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCourseDetail } from "@/lib/courses";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";

export const Route = createFileRoute("/courses/$courseId")({
  head: () => ({
    meta: [
      { title: "Course details — Learno" },
      {
        name: "description",
        content: "See the curriculum, lessons, quizzes and instructor for this Learno course.",
      },
      { property: "og:title", content: "Course details — Learno" },
      {
        property: "og:description",
        content: "Curriculum, lessons and quizzes for this Learno course.",
      },
    ],
  }),
  component: CourseDetail,
});

function CourseDetail() {
  const { courseId } = Route.useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const detail = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => fetchCourseDetail(courseId),
  });

  const enrollment = useQuery({
    queryKey: ["enrollment", courseId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("course_id", courseId)
        .eq("student_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const enroll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("enrollments")
        .insert({ course_id: courseId, student_id: user!.id });
      if (error) {
        if (error.code === "23505") throw new Error("You are already enrolled in this course.");
        throw error;
      }
    },
    onSuccess: async () => {
      toast.success("Enrolled successfully. Happy learning!");
      await queryClient.invalidateQueries();
      navigate({ to: "/student/courses/$courseId", params: { courseId } });
    },
    onError: (e: Error) => toast.error(e.message || "Could not enrol. Please try again."),
  });

  if (detail.isLoading) return <div className="mx-auto max-w-6xl px-4 py-10"><LoadingState label="Loading course..." /></div>;
  if (detail.isError)
    return <div className="mx-auto max-w-6xl px-4 py-10"><ErrorState label="Unable to load this course." /></div>;
  if (!detail.data)
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <EmptyState
          title="Course not found"
          description="This course may have been removed."
          action={
            <Link to="/courses" className="text-sm font-medium text-primary">
              Back to catalogue
            </Link>
          }
        />
      </div>
    );

  const { course, lessons, quizzes, enrollmentCount, instructorName, instructorBio } = detail.data;
  const isEnrolled = !!enrollment.data;

  return (
    <div>
      <div className="surface-gradient text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <Badge variant="secondary" className="bg-background/85 text-foreground">
            {course.category}
          </Badge>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold sm:text-4xl">{course.title}</h1>
          <p className="mt-3 max-w-3xl text-sm opacity-90">{course.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm opacity-95">
            <span>By {instructorName}</span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" /> {course.duration_hours} hours
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="size-4" /> {lessons.length} lessons
            </span>
            <span className="flex items-center gap-1.5">
              <HelpCircle className="size-4" /> {quizzes.length} quizzes
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-4" /> {enrollmentCount} enrolled
            </span>
            <span>{course.difficulty}</span>
          </div>
          <div className="mt-7">
            {!user ? (
              <Button asChild size="lg" variant="secondary">
                <Link to="/login">Log in to enrol</Link>
              </Button>
            ) : isEnrolled ? (
              <Button asChild size="lg" variant="secondary">
                <Link to="/student/courses/$courseId" params={{ courseId }}>
                  Continue learning
                </Link>
              </Button>
            ) : role === "student" ? (
              <Button
                size="lg"
                variant="secondary"
                disabled={enroll.isPending}
                onClick={() => enroll.mutate()}
              >
                {enroll.isPending ? "Enrolling..." : "Enrol now"}
              </Button>
            ) : (
              <p className="text-sm opacity-90">
                Enrolment is available to student accounts.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[2fr_1fr]">
        <section>
          <h2 className="text-xl font-bold">Curriculum</h2>
          {lessons.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No lessons published yet" />
            </div>
          ) : (
            <ol className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {lessons.map((l, i) => (
                <li key={l.id} className="flex items-start gap-4 p-4">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{l.title}</p>
                    <p className="text-sm text-muted-foreground">{l.description}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {l.duration_minutes} min
                  </span>
                </li>
              ))}
            </ol>
          )}

          {quizzes.length > 0 && (
            <>
              <h2 className="mt-10 text-xl font-bold">Assessments</h2>
              <ul className="mt-4 space-y-3">
                {quizzes.map((q) => (
                  <li
                    key={q.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                  >
                    <PlayCircle className="size-5 text-primary" />
                    <div>
                      <p className="font-medium">{q.title}</p>
                      <p className="text-sm text-muted-foreground">{q.description}</p>
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground">
                      Pass {q.pass_percentage}%
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold">Your instructor</h3>
            <p className="mt-2 text-sm font-medium">{instructorName}</p>
            {instructorBio && <p className="mt-1 text-sm text-muted-foreground">{instructorBio}</p>}
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold">What you get</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>{lessons.length} structured lessons</li>
              <li>{quizzes.length} graded quizzes with instant results</li>
              <li>Progress tracking across every lesson</li>
              <li>Ask Learno AI inside each lesson</li>
              <li>Certificate on completion</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
