import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/student/profile")({
  head: () => ({
    meta: [
      { title: "My profile — Learno" },
      { name: "description", content: "Update your Learno display name and bio." },
      { property: "og:title", content: "My profile — Learno" },
      { property: "og:description", content: "Manage your Learno account details." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, role, refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    setName(profile?.full_name ?? "");
    setBio(profile?.bio ?? "");
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: name.trim().slice(0, 100), bio: bio.trim().slice(0, 500) })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Profile updated");
      await refreshProfile();
    },
    onError: () => toast.error("Could not update your profile."),
  });

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-3xl font-bold">My profile</h1>
      <p className="mt-1 text-muted-foreground">Signed in as {user?.email} · Role: {role}</p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim().length < 2) {
            toast.error("Please enter your full name.");
            return;
          }
          save.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} maxLength={100} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={bio} maxLength={500} rows={4} onChange={(e) => setBio(e.target.value)} />
        </div>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
