-- Миграция: Добавление системы мультиков и таблицы историй
-- Дата: 2025-12-18

-- 1. Добавляем поле cartoon_credits в profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cartoon_credits INTEGER DEFAULT 0;

-- 2. Добавляем новые поля в payments
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS cartoon_credits_added INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'subscription';

-- 3. Создаём таблицу stories для хранения сгенерированных сказок
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Информация о ребёнке
  child_name TEXT NOT NULL,
  child_age TEXT,
  child_gender TEXT,
  child_interests TEXT,

  -- Параметры сказки
  topic TEXT NOT NULL,
  custom_topic TEXT,
  character TEXT NOT NULL,
  duration TEXT NOT NULL,

  -- Контент
  title TEXT NOT NULL,
  story_text TEXT NOT NULL,
  audio_url TEXT,

  -- Для мультиков (n8n)
  cartoon_requested BOOLEAN DEFAULT FALSE,
  cartoon_status TEXT DEFAULT 'none', -- none, pending, processing, completed, failed
  cartoon_url TEXT,
  cartoon_requested_at TIMESTAMPTZ,

  -- Метаданные
  word_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Создаём индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_cartoon_status ON stories(cartoon_status);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);

-- 5. RLS (Row Level Security) для stories
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Пользователи видят только свои истории
CREATE POLICY "Users can view own stories"
  ON stories FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователи могут создавать свои истории
CREATE POLICY "Users can insert own stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свои истории
CREATE POLICY "Users can update own stories"
  ON stories FOR UPDATE
  USING (auth.uid() = user_id);

-- 6. Сервисный доступ для n8n (через service_role key)
-- n8n будет использовать service_role для обновления статуса мультиков

-- 7. Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_stories_updated_at ON stories;
CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Поле для срока действия кредитов
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cartoon_credits_expire_at TIMESTAMPTZ;

-- 10. Функция для сгорания кредитов (вызывается cron job)
CREATE OR REPLACE FUNCTION expire_cartoon_credits()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET cartoon_credits = 0,
      cartoon_credits_expire_at = NULL,
      updated_at = NOW()
  WHERE cartoon_credits > 0
    AND cartoon_credits_expire_at IS NOT NULL
    AND cartoon_credits_expire_at < NOW();

  RAISE NOTICE 'Expired cartoon credits for users with past expiration date';
END;
$$ LANGUAGE plpgsql;

-- 11. Создание cron job (требует pg_cron расширение в Supabase)
-- Выполняется каждый день в полночь
-- ПРИМЕЧАНИЕ: Запустите это вручную в Supabase SQL Editor после включения pg_cron:
-- SELECT cron.schedule('expire-cartoon-credits', '0 0 * * *', 'SELECT expire_cartoon_credits()');

-- 12. Комментарии к таблицам
COMMENT ON TABLE stories IS 'Сгенерированные сказки пользователей';
COMMENT ON COLUMN stories.cartoon_status IS 'Статус генерации мультика: none, pending, processing, completed, failed';
COMMENT ON COLUMN profiles.cartoon_credits IS 'Кредиты для генерации мультиков';
COMMENT ON COLUMN profiles.cartoon_credits_expire_at IS 'Дата сгорания кредитов на мультики (90 дней с покупки)';
