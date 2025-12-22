-- Миграция: Добавление utm_campaign в payments для отслеживания источника платежей
-- Дата: 2025-12-22

-- Добавляем поле utm_campaign в payments
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- Комментарий
COMMENT ON COLUMN payments.utm_campaign IS 'UTM campaign parameter from payment creation for precise payment type identification';

-- Индекс для аналитики по типам платежей
CREATE INDEX IF NOT EXISTS idx_payments_utm_campaign ON payments(utm_campaign);
