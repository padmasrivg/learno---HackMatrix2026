import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { homePathForRole, type AppRole } from "@/lib/auth";

const emailSchema = z.string().trim().email("Enter a valid email address").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72);
const nameSchema = z.string().trim().min(2, "Enter your full name").max(80);

async function roleForUser(userId: string): Promise<AppRole | null> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as AppRole);
  return (["admin", "instructor", "student"] as AppRole[]).find((r) => roles.includes(r)) ?? null;
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const parsedEmail = emailSchema.safeParse(email);
      if (!parsedEmail.success) throw new Error(parsedEmail.error.issues[0]!.message);
      const parsedPassword = passwordSchema.safeParse(password);
      if (!parsedPassword.success) throw new Error(parsedPassword.error.issues[0]!.message);

      if (mode === "register") {
        const parsedName = nameSchema.safeParse(fullName);
        if (!parsedName.success) throw new Error(parsedName.error.issues[0]!.message);

        const { data, error } = await supabase.auth.signUp({
          email: parsedEmail.data,
          password: parsedPassword.data,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: parsedName.data, role },
          },
        });
        if (error) {
          if (error.message.toLowerCase().includes("already"))
            throw new Error("An account with this email already exists. Try logging in.");
          throw error;
        }
        if (!data.session) {
          toast.success("Account created. Check your email to confirm before logging in.");
          navigate({ to: "/login" });
          return;
        }
        toast.success("Welcome to Learno!");
        navigate({ to: role === "instructor" ? "/instructor/dashboard" : "/student/dashboard" });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: parsedEmail.data,
        password: parsedPassword.data,
      });
      if (error) throw new Error("Invalid email or password.");
      toast.success("Logged in");
      const r = await roleForUser(data.user.id);
      navigate({ to: homePathForRole(r) });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google sign-in failed. Please try again.");
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/student/dashboard" });
    } catch {
      toast.error("Google sign-in is unavailable right now.");
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14">
      <h1 className="text-2xl font-bold">
        {mode === "login" ? "Welcome back" : "Create your Learno account"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "login"
          ? "Log in to continue learning where you left off."
          : "Join Learno and start building real, measurable skills."}
      </p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4 rounded-xl border border-border bg-card p-6 soft-shadow">
        {mode === "register" && (
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={80} required />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={255}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {mode === "register" && (
          <div className="space-y-2">
            <Label>I am joining as</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["student", "instructor"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-md border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                    role === r
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
        </Button>
        <div className="relative py-1 text-center text-xs text-muted-foreground">
          <span className="bg-card px-2">or</span>
        </div>
        <Button type="button" variant="secondary" className="w-full" onClick={google}>
          Continue with Google
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            New to Learno?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
