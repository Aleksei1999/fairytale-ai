-- Migration: Add child info fields to profiles
-- Date: 2025-12-27

-- Add child info fields (collected at registration)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS child_name TEXT,
ADD COLUMN IF NOT EXISTS child_age TEXT,
ADD COLUMN IF NOT EXISTS child_gender TEXT,
ADD COLUMN IF NOT EXISTS child_interests TEXT;

-- Comments
COMMENT ON COLUMN profiles.child_name IS 'Child name for story personalization';
COMMENT ON COLUMN profiles.child_age IS 'Child age (2-8 years)';
COMMENT ON COLUMN profiles.child_gender IS 'Child gender: boy or girl';
COMMENT ON COLUMN profiles.child_interests IS 'Child interests for story themes';
