import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Learno" },
      { name: "description", content: "Log in to your Learno account to continue your courses, quizzes and certificates." },
      { property: "og:title", content: "Log in — Learno" },
      { property: "og:description", content: "Access your Learno dashboard, courses and progress." },
    ],
  }),
  component: () => <AuthForm mode="login" />,
});
