-- Migration: Program Curriculum Structure
-- Date: 2025-12-21
-- Description: Tables for 12-month program with stories, questions, and user progress

-- 1. Blocks (4 blocks, each 3 months)
CREATE TABLE IF NOT EXISTS program_blocks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  goal TEXT NOT NULL,
  order_num INTEGER NOT NULL UNIQUE
);

-- 2. Months (12 months)
CREATE TABLE IF NOT EXISTS program_months (
  id SERIAL PRIMARY KEY,
  block_id INTEGER REFERENCES program_blocks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  metaphor TEXT,
  story_arc TEXT,
  order_num INTEGER NOT NULL UNIQUE
);

-- 3. Weeks (48 weeks, 4 per month)
CREATE TABLE IF NOT EXISTS program_weeks (
  id SERIAL PRIMARY KEY,
  month_id INTEGER REFERENCES program_months(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  task TEXT NOT NULL,
  order_num INTEGER NOT NULL UNIQUE
);

-- 4. Program Stories (144 stories, 3 per week)
CREATE TABLE IF NOT EXISTS program_stories (
  id SERIAL PRIMARY KEY,
  week_id INTEGER REFERENCES program_weeks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  plot TEXT NOT NULL,
  therapeutic_goal TEXT,
  methodology TEXT,
  why_important TEXT,
  day_in_week INTEGER NOT NULL CHECK (day_in_week IN (1, 3, 5)),
  order_num INTEGER NOT NULL UNIQUE
);

-- 5. Questions for each story (3 questions per story)
CREATE TABLE IF NOT EXISTS program_questions (
  id SERIAL PRIMARY KEY,
  story_id INTEGER REFERENCES program_stories(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('understanding', 'rule', 'practice', 'ritual', 'situation', 'feeling', 'conclusion')),
  question_text TEXT NOT NULL,
  hint TEXT,
  order_num INTEGER NOT NULL
);

-- 6. Weekly cartoons (48 cartoons, 1 per week)
CREATE TABLE IF NOT EXISTS program_cartoons (
  id SERIAL PRIMARY KEY,
  week_id INTEGER REFERENCES program_weeks(id) ON DELETE CASCADE UNIQUE,
  title TEXT NOT NULL,
  storyline_connection TEXT,
  scenes JSONB NOT NULL,
  outcome TEXT NOT NULL
);

-- 7. User progress tracking
CREATE TABLE IF NOT EXISTS user_story_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  story_id INTEGER REFERENCES program_stories(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  questions_answered JSONB DEFAULT '[]',
  UNIQUE(user_id, story_id)
);

-- 8. User current position in program
CREATE TABLE IF NOT EXISTS user_program_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_story_id INTEGER REFERENCES program_stories(id),
  last_story_completed_at TIMESTAMPTZ,
  next_story_available_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_program_months_block ON program_months(block_id);
CREATE INDEX IF NOT EXISTS idx_program_weeks_month ON program_weeks(month_id);
CREATE INDEX IF NOT EXISTS idx_program_stories_week ON program_stories(week_id);
CREATE INDEX IF NOT EXISTS idx_program_questions_story ON program_questions(story_id);
CREATE INDEX IF NOT EXISTS idx_user_story_progress_user ON user_story_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_program_state_user ON user_program_state(user_id);

-- RLS
ALTER TABLE program_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_cartoons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_story_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_program_state ENABLE ROW LEVEL SECURITY;

-- Program content is readable by all authenticated users
CREATE POLICY "Anyone can read program blocks" ON program_blocks FOR SELECT USING (true);
CREATE POLICY "Anyone can read program months" ON program_months FOR SELECT USING (true);
CREATE POLICY "Anyone can read program weeks" ON program_weeks FOR SELECT USING (true);
CREATE POLICY "Anyone can read program stories" ON program_stories FOR SELECT USING (true);
CREATE POLICY "Anyone can read program questions" ON program_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can read program cartoons" ON program_cartoons FOR SELECT USING (true);

-- Users can only access their own progress
CREATE POLICY "Users can view own progress" ON user_story_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_story_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_story_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own state" ON user_program_state FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own state" ON user_program_state FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own state" ON user_program_state FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_user_program_state_updated_at ON user_program_state;
CREATE TRIGGER update_user_program_state_updated_at
  BEFORE UPDATE ON user_program_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE program_blocks IS '4 blocks of the year program (3 months each)';
COMMENT ON TABLE program_months IS '12 months of the program';
COMMENT ON TABLE program_weeks IS '48 weeks (4 per month)';
COMMENT ON TABLE program_stories IS '144 stories (3 per week, every other day)';
COMMENT ON TABLE program_questions IS 'Discussion questions for parents (3-4 per story)';
COMMENT ON TABLE program_cartoons IS 'Weekly reward cartoons (1 per week after completing 3 stories)';
COMMENT ON TABLE user_story_progress IS 'Tracks which stories user has completed';
COMMENT ON TABLE user_program_state IS 'Tracks user current position and next unlock time';
