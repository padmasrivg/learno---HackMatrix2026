import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { CourseCard } from "@/components/CourseCard";
import { fetchCourseCatalogue } from "@/lib/courses";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Course catalogue — Learno" },
      {
        name: "description",
        content:
          "Browse Learno courses in programming, web development, databases, data science and computer networks. Filter by category and difficulty.",
      },
      { property: "og:title", content: "Course catalogue — Learno" },
      {
        property: "og:description",
        content: "Browse and filter structured courses with lessons, quizzes and certificates.",
      },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["catalogue"],
    queryFn: fetchCourseCatalogue,
  });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set((data ?? []).map((c) => c.category))).sort(),
    [data],
  );

  const filtered = (data ?? []).filter((c) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q);
    return (
      matchesSearch &&
      (category === "all" || c.category === category) &&
      (difficulty === "all" || c.difficulty === difficulty)
    );
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Course catalogue</h1>
      <p className="mt-2 text-muted-foreground">
        Structured courses with lessons, graded quizzes and certificates.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="pl-9"
            aria-label="Search courses"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-48" aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="sm:w-44" aria-label="Filter by difficulty">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-8">
        {isLoading && <LoadingState label="Loading courses..." />}
        {isError && (
          <ErrorState
            label="Unable to load courses."
            action={
              <button className="text-sm font-medium text-primary" onClick={() => refetch()}>
                Try again
              </button>
            }
          />
        )}
        {data && filtered.length === 0 && (
          <EmptyState
            title="No courses found"
            description="Try a different search term or clear your filters."
          />
        )}
        {filtered.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Are you an educator?{" "}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create an instructor account
        </Link>{" "}
        to publish your own courses.
      </p>
    </div>
  );
}
