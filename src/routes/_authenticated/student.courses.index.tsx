import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { fetchStudentOverview } from "@/lib/student";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/student/courses")({
  head: () => ({
    meta: [
      { title: "My learning — Learno" },
      { name: "description", content: "All the Learno courses you are enrolled in, with live progress for each one." },
      { property: "og:title", content: "My learning — Learno" },
      { property: "og:description", content: "Your enrolled courses and progress." },
    ],
  }),
  component: MyCourses,
});

function MyCourses() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-overview", user?.id],
    enabled: !!user,
    queryFn: () => fetchStudentOverview(user!.id),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">My learning</h1>
      <p className="mt-1 text-muted-foreground">Every course you are enrolled in.</p>
      <div className="mt-6">
        {isLoading && <LoadingState label="Loading your courses..." />}
        {isError && <ErrorState label="Unable to load your courses." />}
        {data && data.courses.length === 0 && (
          <EmptyState
            title="You have not enrolled yet"
            description="Browse the catalogue and enrol in your first course."
            action={
              <Button asChild size="sm" className="mt-2">
                <Link to="/courses">Browse courses</Link>
              </Button>
            }
          />
        )}
        {data && data.courses.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.courses.map((c) => (
              <div key={c.courseId} className="flex flex-col rounded-xl border border-border bg-card p-5 soft-shadow">
                <p className="text-xs text-muted-foreground">{c.category} · {c.difficulty}</p>
                <p className="mt-1 font-semibold">{c.title}</p>
                <Progress value={c.percent} className="mt-3 h-1.5" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {c.completedLessons}/{c.totalLessons} lessons · {c.percent}%
                  {c.completed && " · Completed"}
                </p>
                <Button asChild size="sm" className="mt-4">
                  <Link to="/student/courses/$courseId" params={{ courseId: c.courseId }}>
                    {c.completed ? "Review course" : "Continue"}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
