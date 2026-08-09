import { supabase } from "@/integrations/supabase/client";

export type CourseRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_hours: number;
  thumbnail_url: string | null;
  instructor_id: string;
  created_at: string;
  updated_at: string;
};

export async function fetchCourseCatalogue() {
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;

  const ids = (courses ?? []).map((c) => c.id);
  const [{ data: lessons }, { data: enrollments }, { data: profiles }] = await Promise.all([
    supabase.from("lessons").select("id, course_id").in("course_id", ids.length ? ids : [""]),
    supabase.from("enrollments").select("id, course_id").in("course_id", ids.length ? ids : [""]),
    supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", Array.from(new Set((courses ?? []).map((c) => c.instructor_id)))),
  ]);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
  return (courses ?? []).map((c) => ({
    ...c,
    instructorName: nameById.get(c.instructor_id) ?? "Learno instructor",
    lessonCount: (lessons ?? []).filter((l) => l.course_id === c.id).length,
    enrollmentCount: (enrollments ?? []).filter((e) => e.course_id === c.id).length,
  }));
}

export async function fetchCourseDetail(courseId: string) {
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .maybeSingle();
  if (error) throw error;
  if (!course) return null;

  const [{ data: lessons }, { data: quizzes }, { data: enrollments }, { data: instructor }] =
    await Promise.all([
      supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true }),
      supabase.from("quizzes").select("*").eq("course_id", courseId),
      supabase.from("enrollments").select("id").eq("course_id", courseId),
      supabase.from("profiles").select("full_name, bio").eq("id", course.instructor_id).maybeSingle(),
    ]);

  return {
    course,
    lessons: lessons ?? [],
    quizzes: quizzes ?? [],
    enrollmentCount: (enrollments ?? []).length,
    instructorName: instructor?.full_name ?? "Learno instructor",
    instructorBio: instructor?.bio ?? "",
  };
}

export function percent(done: number, total: number) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}
