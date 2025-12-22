-- Migration: Add subscription system
-- Date: 2025-12-22

-- 1. Add subscription_until field to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_until TIMESTAMPTZ;

-- 2. Add subscription_days_added to payments for tracking
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS subscription_days_added INTEGER DEFAULT 0;

-- 3. Index for quick subscription checks
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_until ON profiles(subscription_until);

-- 4. Comment
COMMENT ON COLUMN profiles.subscription_until IS 'Subscription expiration date. NULL = no subscription, future date = active subscriber';
COMMENT ON COLUMN payments.subscription_days_added IS 'Number of subscription days added with this payment';
