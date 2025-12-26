-- Migration: Add full UTM tracking
-- Date: 2025-12-26

-- Add UTM fields to profiles (source of registration)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS utm_term TEXT,
ADD COLUMN IF NOT EXISTS utm_content TEXT;

-- Add full UTM fields to payments (was only utm_campaign before)
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_term TEXT,
ADD COLUMN IF NOT EXISTS utm_content TEXT;

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_profiles_utm_source ON profiles(utm_source);
CREATE INDEX IF NOT EXISTS idx_profiles_utm_campaign ON profiles(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_payments_utm_source ON payments(utm_source);

-- Comments
COMMENT ON COLUMN profiles.utm_source IS 'Traffic source at registration (google, facebook, instagram, etc.)';
COMMENT ON COLUMN profiles.utm_medium IS 'Traffic medium at registration (cpc, email, social, etc.)';
COMMENT ON COLUMN profiles.utm_campaign IS 'Campaign name at registration';
COMMENT ON COLUMN payments.utm_source IS 'Traffic source at payment';
