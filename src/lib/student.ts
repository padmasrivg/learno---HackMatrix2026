import { supabase } from "@/integrations/supabase/client";

export type CourseProgress = {
  courseId: string;
  title: string;
  category: string;
  difficulty: string;
  durationHours: number;
  totalLessons: number;
  completedLessons: number;
  percent: number;
  completed: boolean;
  lastLessonId: string | null;
  nextLessonId: string | null;
  enrolledAt: string;
};

export async function fetchStudentOverview(userId: string) {
  const [{ data: enrollments, error }, { data: attempts }, { data: certificates }] =
    await Promise.all([
      supabase
        .from("enrollments")
        .select("*")
        .eq("student_id", userId)
        .order("enrolled_at", { ascending: false }),
      supabase
        .from("quiz_attempts")
        .select("*")
        .eq("student_id", userId)
        .order("created_at", { ascending: false }),
      supabase.from("certificates").select("*").eq("student_id", userId),
    ]);
  if (error) throw error;

  const courseIds = (enrollments ?? []).map((e) => e.course_id);
  const [{ data: allCourses }, { data: lessons }, { data: progress }, { data: quizzes }] =
    await Promise.all([
      supabase.from("courses").select("*"),
      supabase.from("lessons").select("id, course_id, order_index, title").order("order_index"),
      supabase.from("lesson_progress").select("lesson_id, course_id").eq("student_id", userId),
      supabase.from("quizzes").select("id, course_id, title"),
    ]);

  const courseById = new Map((allCourses ?? []).map((c) => [c.id, c]));
  const completedLessonIds = new Set((progress ?? []).map((p) => p.lesson_id));

  const courses: CourseProgress[] = (enrollments ?? []).flatMap((e) => {
    const course = courseById.get(e.course_id);
    if (!course) return [];
    const courseLessons = (lessons ?? []).filter((l) => l.course_id === e.course_id);
    const done = courseLessons.filter((l) => completedLessonIds.has(l.id)).length;
    const next = courseLessons.find((l) => !completedLessonIds.has(l.id));
    return [
      {
        courseId: course.id,
        title: course.title,
        category: course.category,
        difficulty: course.difficulty,
        durationHours: course.duration_hours,
        totalLessons: courseLessons.length,
        completedLessons: done,
        percent: courseLessons.length ? Math.round((done / courseLessons.length) * 100) : 0,
        completed: courseLessons.length > 0 && done === courseLessons.length,
        lastLessonId: e.last_lesson_id,
        nextLessonId: next?.id ?? e.last_lesson_id ?? courseLessons[0]?.id ?? null,
        enrolledAt: e.enrolled_at,
      },
    ];
  });

  const attemptRows = (attempts ?? []).map((a) => ({
    ...a,
    courseTitle: courseById.get(a.course_id)?.title ?? "Course",
    quizTitle: (quizzes ?? []).find((q) => q.id === a.quiz_id)?.title ?? "Quiz",
  }));

  // Simple, explainable recommendation rules.
  const enrolledCategories = new Set(courses.map((c) => c.category));
  const notEnrolled = (allCourses ?? []).filter((c) => !courseIds.includes(c.id));
  const recommendations: { courseId: string; title: string; reason: string }[] = [];

  const weakByCourse = new Map<string, number>();
  for (const a of attemptRows) {
    const current = weakByCourse.get(a.course_id);
    if (current === undefined || a.percentage > current) weakByCourse.set(a.course_id, a.percentage);
  }
  for (const [courseId, best] of weakByCourse) {
    if (best < 70) {
      const c = courseById.get(courseId);
      if (c) recommendations.push({ courseId, title: c.title, reason: `Your best quiz score here is ${best}% — review the lessons to strengthen this topic.` });
    }
  }
  for (const c of courses.filter((c) => !c.completed && c.completedLessons > 0)) {
    recommendations.push({
      courseId: c.courseId,
      title: c.title,
      reason: `You are ${c.percent}% through — finish the remaining ${c.totalLessons - c.completedLessons} lessons.`,
    });
  }
  for (const c of notEnrolled.filter((c) => enrolledCategories.has(c.category))) {
    recommendations.push({
      courseId: c.id,
      title: c.title,
      reason: `Matches your interest in ${c.category}.`,
    });
  }
  for (const c of notEnrolled) {
    recommendations.push({ courseId: c.id, title: c.title, reason: "Popular on Learno right now." });
  }

  const seen = new Set<string>();
  const uniqueRecommendations = recommendations.filter((r) =>
    seen.has(r.courseId) ? false : (seen.add(r.courseId), true),
  );

  const percentages = attemptRows.map((a) => a.percentage);
  return {
    courses,
    attempts: attemptRows,
    certificates: (certificates ?? []).map((c) => ({
      ...c,
      courseTitle: courseById.get(c.course_id)?.title ?? "Course",
    })),
    recommendations: uniqueRecommendations.slice(0, 4),
    stats: {
      enrolled: courses.length,
      inProgress: courses.filter((c) => !c.completed).length,
      completed: courses.filter((c) => c.completed).length,
      overallPercent: courses.length
        ? Math.round(courses.reduce((sum, c) => sum + c.percent, 0) / courses.length)
        : 0,
      averageScore: percentages.length
        ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
        : 0,
      bestScore: percentages.length ? Math.max(...percentages) : 0,
      attemptCount: percentages.length,
    },
  };
}
