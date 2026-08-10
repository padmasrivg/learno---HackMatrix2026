import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BrainCircuit, BadgeCheck, LineChart, ArrowRight, CheckCircle2 } from "lucide-react";
import heroImage from "@/assets/hero-learning.jpg";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/CourseCard";
import { fetchCourseCatalogue } from "@/lib/courses";
import { LoadingState, ErrorState } from "@/components/states";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Learno — Learn. Practice. Progress." },
      {
        name: "description",
        content:
          "Enrol in structured courses, track real lesson progress, take graded quizzes, get AI help and earn certificates on Learno.",
      },
      { property: "og:title", content: "Learno — Learn. Practice. Progress." },
      {
        property: "og:description",
        content:
          "Enrol in structured courses, track real lesson progress, take graded quizzes, get AI help and earn certificates on Learno.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["catalogue"],
    queryFn: fetchCourseCatalogue,
  });

  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              Learn. Practice. Progress.
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
              The learning platform that actually measures your progress
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
              Learno combines structured courses, graded quizzes and an AI study assistant. Every
              lesson you finish, every quiz you take and every certificate you earn is stored and
              tracked for real.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/register">
                  Start learning free <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/courses">Browse courses</Link>
              </Button>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["Free to join", "No credit card", "Certificates included"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-success" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <img
            src={heroImage}
            alt="Illustration of interactive learning cards, video lessons and progress checklists"
            width={1280}
            height={960}
            className="w-full rounded-2xl soft-shadow"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold">Built for real learning outcomes</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: BrainCircuit,
              title: "Ask Learno AI",
              body: "A study assistant inside every lesson. Ask for simpler explanations, examples or practice questions grounded in what you are reading.",
            },
            {
              icon: LineChart,
              title: "Quiz analytics",
              body: "Backend-graded quizzes with score history, averages and per-subject performance so you know exactly what to revise.",
            },
            {
              icon: BadgeCheck,
              title: "Verifiable certificates",
              body: "Finish every lesson in a course and Learno issues a certificate with a unique ID you can download and share.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 soft-shadow">
              <span className="surface-gradient mb-4 flex size-10 items-center justify-center rounded-lg text-primary-foreground">
                <f.icon className="size-5" />
              </span>
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Popular courses</h2>
          <Link to="/courses" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {isLoading && <LoadingState label="Loading courses..." />}
        {isError && <ErrorState label="Unable to load courses right now." />}
        {data && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.slice(0, 3).map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
