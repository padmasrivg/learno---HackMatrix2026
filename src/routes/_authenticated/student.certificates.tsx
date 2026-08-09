import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchStudentOverview } from "@/lib/student";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/student/certificates")({
  head: () => ({
    meta: [
      { title: "My certificates — Learno" },
      { name: "description", content: "View and print the completion certificates you have earned on Learno." },
      { property: "og:title", content: "My certificates — Learno" },
      { property: "og:description", content: "Certificates earned for completed courses." },
    ],
  }),
  component: Certificates,
});

function Certificates() {
  const { user, fullName } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-overview", user?.id],
    enabled: !!user,
    queryFn: () => fetchStudentOverview(user!.id),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">My certificates</h1>
      <p className="mt-1 text-muted-foreground">Earned by completing every lesson in a course.</p>

      <div className="mt-6 space-y-6">
        {isLoading && <LoadingState />}
        {isError && <ErrorState label="Unable to load your certificates." />}
        {data && data.certificates.length === 0 && (
          <EmptyState
            title="No certificates yet"
            description="Complete all lessons in a course to unlock your certificate."
            action={
              <Button asChild size="sm" className="mt-2">
                <Link to="/student/courses">Go to my learning</Link>
              </Button>
            }
          />
        )}
        {data?.certificates.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border-2 border-primary/30 bg-card p-8 text-center soft-shadow"
          >
            <Award className="mx-auto size-10 text-primary" />
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Certificate of completion
            </p>
            <p className="mt-4 text-sm text-muted-foreground">This certifies that</p>
            <p className="text-2xl font-bold">{fullName || "Learno student"}</p>
            <p className="mt-3 text-sm text-muted-foreground">has successfully completed</p>
            <p className="text-xl font-semibold">{c.courseTitle}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              Issued {new Date(c.issued_at).toLocaleDateString()} · Code {c.certificate_code}
            </p>
            <Button className="mt-5 print:hidden" variant="secondary" onClick={() => window.print()}>
              Print / save as PDF
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
