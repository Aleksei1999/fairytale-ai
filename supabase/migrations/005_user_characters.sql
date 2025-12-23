-- Create table for storing user-generated cartoon characters
CREATE TABLE IF NOT EXISTS user_characters (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('boy', 'girl')),
  hair_color VARCHAR(50) NOT NULL,
  eye_color VARCHAR(50) NOT NULL,
  skin_color VARCHAR(50) NOT NULL,
  image_url TEXT NOT NULL,
  week_id INTEGER REFERENCES program_weeks(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_user_characters_user_id ON user_characters(user_id);

-- Create index for lookups by week
CREATE INDEX IF NOT EXISTS idx_user_characters_week_id ON user_characters(week_id);

-- Enable RLS
ALTER TABLE user_characters ENABLE ROW LEVEL SECURITY;

-- Users can view their own characters
CREATE POLICY "Users can view own characters" ON user_characters
  FOR SELECT USING (auth.uid() = user_id);

-- Only allow inserts through service key (API)
CREATE POLICY "Service can insert characters" ON user_characters
  FOR INSERT WITH CHECK (true);
