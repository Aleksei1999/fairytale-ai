-- Migration: Add free trial tracking
-- Date: 2025-12-25
-- Description: Adds fields to track free trial status and story count

-- Add subscription type to profiles (free_trial, monthly, yearly, null)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT NULL;

-- Add free trial story count (max 3 for free trial users)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS free_trial_stories_used INTEGER DEFAULT 0;

-- Add free trial started date
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS free_trial_started_at TIMESTAMPTZ DEFAULT NULL;

-- Comment for documentation
COMMENT ON COLUMN profiles.subscription_type IS 'Type of subscription: free_trial, monthly, yearly, or null (no subscription)';
COMMENT ON COLUMN profiles.free_trial_stories_used IS 'Number of stories used during free trial (max 3)';
COMMENT ON COLUMN profiles.free_trial_started_at IS 'When the free trial was started';
