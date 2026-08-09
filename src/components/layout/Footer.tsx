import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="surface-gradient flex size-8 items-center justify-center rounded-lg text-primary-foreground">
              <GraduationCap className="size-4" />
            </span>
            <span className="font-display text-base font-bold">Learno</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Learn. Practice. Progress. An AI-assisted learning platform for structured, measurable
            study.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/courses" className="hover:text-foreground">
                Course catalogue
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-foreground">
                Create an account
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-foreground">
                Log in
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Platform</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Real progress tracking</li>
            <li>Graded quizzes and analytics</li>
            <li>Verifiable certificates</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Learno. Built for learners.
      </div>
    </footer>
  );
}
