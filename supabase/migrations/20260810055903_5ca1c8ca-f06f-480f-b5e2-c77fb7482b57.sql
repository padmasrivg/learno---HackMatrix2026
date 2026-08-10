CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- Recreate policies against private.has_role
DROP POLICY IF EXISTS "student own certificates" ON public.certificates;
CREATE POLICY "student own certificates" ON public.certificates FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "instructor manage own courses" ON public.courses;
CREATE POLICY "instructor manage own courses" ON public.courses FOR ALL TO authenticated
  USING (instructor_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (instructor_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "instructor view course enrollments" ON public.enrollments;
CREATE POLICY "instructor view course enrollments" ON public.enrollments FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR EXISTS (
    SELECT 1 FROM public.courses c WHERE c.id = enrollments.course_id AND c.instructor_id = auth.uid()));

DROP POLICY IF EXISTS "instructor view progress" ON public.lesson_progress;
CREATE POLICY "instructor view progress" ON public.lesson_progress FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR EXISTS (
    SELECT 1 FROM public.courses c WHERE c.id = lesson_progress.course_id AND c.instructor_id = auth.uid()));

DROP POLICY IF EXISTS "instructor manage own lessons" ON public.lessons;
CREATE POLICY "instructor manage own lessons" ON public.lessons FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = lessons.course_id AND (c.instructor_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = lessons.course_id AND (c.instructor_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))));

DROP POLICY IF EXISTS "instructor manage own questions" ON public.questions;
CREATE POLICY "instructor manage own questions" ON public.questions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.quizzes q JOIN public.courses c ON c.id = q.course_id WHERE q.id = questions.quiz_id AND (c.instructor_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.quizzes q JOIN public.courses c ON c.id = q.course_id WHERE q.id = questions.quiz_id AND (c.instructor_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))));

DROP POLICY IF EXISTS "instructor view attempts" ON public.quiz_attempts;
CREATE POLICY "instructor view attempts" ON public.quiz_attempts FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR EXISTS (
    SELECT 1 FROM public.courses c WHERE c.id = quiz_attempts.course_id AND c.instructor_id = auth.uid()));

DROP POLICY IF EXISTS "instructor manage own quizzes" ON public.quizzes;
CREATE POLICY "instructor manage own quizzes" ON public.quizzes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = quizzes.course_id AND (c.instructor_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = quizzes.course_id AND (c.instructor_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))));

DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "read own roles" ON public.user_roles;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
