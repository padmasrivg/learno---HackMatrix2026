import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — Learno" },
      { name: "description", content: "Sign up free as a student or instructor and start learning or teaching on Learno." },
      { property: "og:title", content: "Create your account — Learno" },
      { property: "og:description", content: "Join Learno as a student or an instructor." },
    ],
  }),
  component: () => <AuthForm mode="register" />,
});
