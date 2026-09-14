-- ============================================================================
-- 0004: auto-create public.users profile when an auth user signs up
-- Run once in the Supabase SQL Editor.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_display TEXT;
  v_role user_role;
BEGIN
  v_username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''),
    lower(split_part(NEW.email, '@', 1))
  );
  v_display := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''),
    v_username
  );
  v_role := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'role', '')::user_role,
    'viewer'::user_role
  );

  INSERT INTO public.users (id, username, display_name, email, role)
  VALUES (
    NEW.id,
    v_username,
    v_display,
    NEW.email,
    v_role
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();