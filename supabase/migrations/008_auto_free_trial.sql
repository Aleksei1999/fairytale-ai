-- Migration: Auto-assign free trial on registration
-- Date: 2025-12-26
-- Description: New users automatically get 7-day free trial upon registration

-- Update the handle_new_user function to set free trial
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits, subscription_type, subscription_until, free_trial_started_at, free_trial_stories_used)
  VALUES (
    NEW.id,
    NEW.email,
    0,
    'free_trial',
    NOW() + INTERVAL '7 days',
    NOW(),
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a profile with 7-day free trial when a new user signs up';
