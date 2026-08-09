import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuth } from "@/lib/auth";
import { fetchStudentOverview } from "@/lib/student";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/student/dashboard")({
  head: () => ({
    meta: [
      { title: "Student dashboard — Learno" },
      { name: "description", content: "Track your enrolled courses, lesson progress, quiz performance and certificates." },
      { property: "og:title", content: "Student dashboard — Learno" },
      { property: "og:description", content: "Your learning progress at a glance." },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { user, fullName } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-overview", user?.id],
    enabled: !!user,
    queryFn: () => fetchStudentOverview(user!.id),
  });

  if (isLoading || !user) return <div className="mx-auto max-w-6xl px-4 py-10"><LoadingState label="Loading your dashboard..." /></div>;
  if (isError || !data) return <div className="mx-auto max-w-6xl px-4 py-10"><ErrorState label="Unable to load your dashboard." /></div>;

  const { stats, courses, attempts, certificates, recommendations } = data;
  const continueCourse = courses.find((c) => !c.completed);
  const chartData = attempts.slice(0, 8).reverse().map((a) => ({
    name: a.courseTitle.split(" ").slice(0, 2).join(" "),
    score: a.percentage,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold">Welcome back, {fullName || "learner"}!</h1>
        <p className="mt-1 text-muted-foreground">Here is where you stand today.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Enrolled courses", value: stats.enrolled, icon: BookOpen },
          { label: "In progress", value: stats.inProgress, icon: TrendingUp },
          { label: "Completed", value: stats.completed, icon: CheckCircle2 },
          { label: "Overall progress", value: `${stats.overallPercent}%`, icon: GraduationCap },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 soft-shadow">
            <s.icon className="size-5 text-primary" />
            <p className="mt-3 text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-xl font-bold">Continue learning</h2>
        <div className="mt-4">
          {continueCourse ? (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 soft-shadow sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="font-semibold">{continueCourse.title}</p>
                <p className="text-sm text-muted-foreground">
                  {continueCourse.completedLessons} / {continueCourse.totalLessons} lessons completed
                </p>
                <Progress value={continueCourse.percent} className="mt-3 h-2" />
              </div>
              <Button asChild>
                <Link to="/student/courses/$courseId" params={{ courseId: continueCourse.courseId }}>
                  Resume course
                </Link>
              </Button>
            </div>
          ) : (
            <EmptyState
              title="Nothing in progress"
              description="Enrol in a course to start learning."
              action={
                <Button asChild size="sm" className="mt-2">
                  <Link to="/courses">Browse courses</Link>
                </Button>
              }
            />
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">My learning</h2>
          <Link to="/student/courses" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {courses.length === 0 ? (
          <div className="mt-4"><EmptyState title="No enrolments yet" /></div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 3).map((c) => (
              <Link
                key={c.courseId}
                to="/student/courses/$courseId"
                params={{ courseId: c.courseId }}
                className="rounded-xl border border-border bg-card p-5 soft-shadow transition-transform hover:-translate-y-0.5"
              >
                <p className="text-xs text-muted-foreground">{c.category}</p>
                <p className="mt-1 font-semibold">{c.title}</p>
                <Progress value={c.percent} className="mt-3 h-1.5" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {c.percent}% · {c.completedLessons}/{c.totalLessons} lessons
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold">Quiz performance</h2>
          <div className="mt-4 rounded-xl border border-border bg-card p-5 soft-shadow">
            {attempts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Take a quiz to see your analytics here.</p>
            ) : (
              <>
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-2xl font-bold">{stats.averageScore}%</p>
                    <p className="text-muted-foreground">Average</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.bestScore}%</p>
                    <p className="text-muted-foreground">Best</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.attemptCount}</p>
                    <p className="text-muted-foreground">Attempts</p>
                  </div>
                </div>
                <div className="mt-5 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="score" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {attempts.slice(0, 4).map((a) => (
                    <li key={a.id} className="flex items-center justify-between">
                      <span className="truncate text-muted-foreground">{a.quizTitle}</span>
                      <span className={a.passed ? "font-medium text-success" : "font-medium text-destructive"}>
                        {a.score}/{a.total_questions} · {a.percentage}%
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold">Recommended for you</h2>
          <div className="mt-4 space-y-3">
            {recommendations.length === 0 ? (
              <EmptyState title="No recommendations yet" description="Enrol in a course to get suggestions." />
            ) : (
              recommendations.map((r) => (
                <Link
                  key={r.courseId}
                  to="/courses/$courseId"
                  params={{ courseId: r.courseId }}
                  className="block rounded-xl border border-border bg-card p-4 soft-shadow"
                >
                  <p className="font-medium">{r.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{r.reason}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">Certificates</h2>
        <div className="mt-4">
          {certificates.length === 0 ? (
            <EmptyState title="No certificates yet" description="Complete every lesson in a course to earn one." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-card p-5 soft-shadow">
                  <p className="font-semibold">{c.courseTitle}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.certificate_code}</p>
                  <Button asChild size="sm" variant="secondary" className="mt-3">
                    <Link to="/student/certificates">View certificate</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
