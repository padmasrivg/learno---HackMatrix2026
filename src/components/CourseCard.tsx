import { Link } from "@tanstack/react-router";
import { BookOpen, Clock, Users, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export type CourseSummary = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_hours: number;
  thumbnail_url: string | null;
  instructorName?: string;
  lessonCount?: number;
  enrollmentCount?: number;
  progress?: number | null;
};

const difficultyTone: Record<string, string> = {
  Beginner: "bg-success/12 text-success border-success/30",
  Intermediate: "bg-warning/15 text-warning-foreground border-warning/40",
  Advanced: "bg-destructive/10 text-destructive border-destructive/30",
};

export function CourseCard({ course, to }: { course: CourseSummary; to?: string }) {
  const href = to ?? `/courses/${course.id}`;
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card soft-shadow transition-transform hover:-translate-y-0.5">
      <div className="surface-gradient relative flex h-28 items-end p-4">
        <Badge variant="secondary" className="bg-background/85">
          {course.category}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold leading-snug">{course.title}</h3>
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
              difficultyTone[course.difficulty] ?? "border-border text-muted-foreground"
            }`}
          >
            {course.difficulty}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
        {course.instructorName && (
          <p className="text-xs text-muted-foreground">By {course.instructorName}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" /> {course.duration_hours}h
          </span>
          {course.lessonCount !== undefined && (
            <span className="flex items-center gap-1">
              <BookOpen className="size-3.5" /> {course.lessonCount} lessons
            </span>
          )}
          {course.enrollmentCount !== undefined && (
            <span className="flex items-center gap-1">
              <Users className="size-3.5" /> {course.enrollmentCount} enrolled
            </span>
          )}
        </div>
        {typeof course.progress === "number" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BarChart3 className="size-3.5" /> Progress
              </span>
              <span>{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-1.5" />
          </div>
        )}
        <Link
          to={href}
          className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {typeof course.progress === "number" ? "Continue learning" : "View course"}
        </Link>
      </div>
    </article>
  );
}
