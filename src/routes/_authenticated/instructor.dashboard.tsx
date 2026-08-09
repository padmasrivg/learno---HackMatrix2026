import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/instructor/dashboard")({
  head: () => ({
    meta: [
      { title: "Instructor dashboard — Learno" },
      { name: "description", content: "See your published courses, lessons and student enrolments on Learno." },
      { property: "og:title", content: "Instructor dashboard — Learno" },
      { property: "og:description", content: "Manage the courses you teach." },
    ],
  }),
  component: InstructorDashboard,
});

function InstructorDashboard() {
  const { user, fullName } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["instructor-overview", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: courses } = await supabase
        .from("courses")
        .select("*")
        .eq("instructor_id", user!.id)
        .order("created_at", { ascending: false });
      const ids = (courses ?? []).map((c) => c.id);
      const [{ data: lessons }, { data: enrollments }] = await Promise.all([
        ids.length ? supabase.from("lessons").select("id, course_id").in("course_id", ids) : Promise.resolve({ data: [] as { id: string; course_id: string }[] }),
        ids.length ? supabase.from("enrollments").select("id, course_id").in("course_id", ids) : Promise.resolve({ data: [] as { id: string; course_id: string }[] }),
      ]);
      return { courses: courses ?? [], lessons: lessons ?? [], enrollments: enrollments ?? [] };
    },
  });

  if (isLoading) return <div className="mx-auto max-w-5xl px-4 py-10"><LoadingState /></div>;
  if (isError || !data) return <div className="mx-auto max-w-5xl px-4 py-10"><ErrorState label="Unable to load your courses." /></div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Instructor dashboard</h1>
      <p className="mt-1 text-muted-foreground">Welcome, {fullName || "instructor"}.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Courses", value: data.courses.length },
          { label: "Lessons", value: data.lessons.length },
          { label: "Enrolments", value: data.enrollments.length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 soft-shadow">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-bold">Your courses</h2>
      <div className="mt-4 space-y-3">
        {data.courses.length === 0 && <EmptyState title="No courses yet" description="Courses you create will appear here." />}
        {data.courses.map((c) => {
          const lessonCount = data.lessons.filter((l) => l.course_id === c.id).length;
          const studentCount = data.enrollments.filter((e) => e.course_id === c.id).length;
          return (
            <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4 soft-shadow">
              <div className="min-w-0">
                <p className="font-semibold">{c.title}</p>
                <p className="text-sm text-muted-foreground">
                  {c.category} · {lessonCount} lessons · {studentCount} students
                </p>
              </div>
              <Button asChild size="sm" variant="secondary" className="ml-auto">
                <Link to="/courses/$courseId" params={{ courseId: c.id }}>View public page</Link>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
