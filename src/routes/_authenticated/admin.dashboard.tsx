import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState, ErrorState } from "@/components/states";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — Learno" },
      { name: "description", content: "Platform-wide statistics for courses, learners and quiz activity on Learno." },
      { property: "og:title", content: "Admin dashboard — Learno" },
      { property: "og:description", content: "Learno platform overview for administrators." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [courses, users, enrollments, attempts, certificates] = await Promise.all([
        supabase.from("courses").select("id, title, category, published", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("id", { count: "exact", head: true }),
        supabase.from("quiz_attempts").select("percentage"),
        supabase.from("certificates").select("id", { count: "exact", head: true }),
      ]);
      const scores = (attempts.data ?? []).map((a) => a.percentage);
      return {
        courses: courses.data ?? [],
        courseCount: courses.count ?? 0,
        userCount: users.count ?? 0,
        enrollmentCount: enrollments.count ?? 0,
        certificateCount: certificates.count ?? 0,
        averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      };
    },
  });

  if (isLoading) return <div className="mx-auto max-w-5xl px-4 py-10"><LoadingState /></div>;
  if (isError || !data) return <div className="mx-auto max-w-5xl px-4 py-10"><ErrorState label="Unable to load platform data." /></div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Admin dashboard</h1>
      <p className="mt-1 text-muted-foreground">Platform overview.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Users", value: data.userCount },
          { label: "Courses", value: data.courseCount },
          { label: "Enrolments", value: data.enrollmentCount },
          { label: "Certificates", value: data.certificateCount },
          { label: "Avg quiz score", value: `${data.averageScore}%` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 soft-shadow">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-bold">All courses</h2>
      <div className="mt-4 space-y-3">
        {data.courses.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <div>
              <p className="font-medium">{c.title}</p>
              <p className="text-sm text-muted-foreground">
                {c.category} · {c.published ? "Published" : "Draft"}
              </p>
            </div>
            <Button asChild size="sm" variant="secondary" className="ml-auto">
              <Link to="/courses/$courseId" params={{ courseId: c.id }}>View</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
