-- 1. Profiles: hide email from anon/authenticated via column-level grants
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.profiles FROM authenticated;
GRANT SELECT (id, full_name, bio, created_at, updated_at) ON public.profiles TO anon;
GRANT SELECT (id, full_name, bio, created_at, updated_at) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 2. Questions: never expose correct_option to clients
REVOKE SELECT ON public.questions FROM anon;
REVOKE SELECT ON public.questions FROM authenticated;
GRANT SELECT (id, quiz_id, question_text, option_a, option_b, option_c, option_d, order_index, created_at)
  ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;

-- 3. SECURITY DEFINER functions should not be callable from the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
