# FairyTale AI - Project Memory

## О проекте
Приложение для детей и родителей: генерация персонализированных терапевтических сказок с AI озвучкой и мультфильмами.

## Технологии
- **Frontend:** Next.js 15, React, Tailwind CSS v4
- **Backend:** Next.js API Routes, Supabase (PostgreSQL + Auth)
- **AI:** OpenAI GPT-4o-mini (сказки), ElevenLabs (озвучка), Udio/PiAPI (музыка)
- **Payments:** Lava.top API
- **Мультики:** n8n workflow (внешний сервис)
- **Audio:** ffmpeg (микширование голоса с музыкой)

## Система тарифов

### Подписки и покупки:
| Тариф | Цена | Что даёт |
|-------|------|----------|
| Week | $5 | 8 звёзд (одноразово, БЕЗ подписки) |
| Monthly | $29/мес | Подписка 30 дней (безлимит сказок) |
| Yearly | $189/год | Подписка 365 дней (безлимит сказок) |

### Пакеты звёзд (докупаются отдельно):
| Пакет | Цена | Звёзд |
|-------|------|-------|
| Starter | $14.90 | 10 |
| Popular | $39.90 | 30 |
| Big Pack | $59.90 | 50 |

### Стоимость действий:
| Действие | Стоимость |
|----------|-----------|
| Генерация сказки | Бесплатно (только для подписчиков!) |
| Озвучка диктором (ElevenLabs) | 1 звезда |
| Мультик | 5 звёзд |

### Важно:
- Без подписки генерация сказок НЕДОСТУПНА
- Week ($5) даёт только звёзды, но НЕ даёт подписку
- Подписка НЕ даёт звёзды — их нужно покупать отдельно

## Lava.top Offer IDs
- **Week ($5):** `82ca8328-9624-4ef5-ad69-2131721f51ef`
- **Monthly/Yearly ($29/$189):** `0f1994eb-ee95-4c4b-85ed-4437ed82ba49`
- **Пакеты звёзд:** TODO (нужно создать продукты в Lava.top)

## База данных (Supabase)

### Таблица profiles:
- `credits` — звёзды пользователя (единые для сказок и мультиков)
- `subscription_until` — дата окончания подписки (NULL = нет подписки)
- `is_admin` — флаг администратора (bypass для тестирования)

### Таблица user_characters:
- `user_id` — связь с пользователем
- `gender` — пол персонажа (boy/girl)
- `hair_color`, `eye_color`, `skin_color` — характеристики
- `image_url` — URL сгенерированного изображения (DALL-E 3)
- `week_id` — привязка к неделе программы

### Таблица payments:
- `credits_added` — сколько звёзд добавлено
- `subscription_days_added` — сколько дней подписки добавлено

## История коммитов

### 2025-12-24
- `072237a` chore: Add video file extensions to .gitignore

### 2025-12-23
- Создана страница `/create-cartoon` для кастомизации персонажа мультика
- API endpoint `/api/cartoon/generate-character` для генерации персонажа через DALL-E 3
- Миграция `005_user_characters.sql` для таблицы персонажей
- Добавлен admin bypass (поле `is_admin` в profiles) для тестирования
- **Унификация кредитов**: теперь `credits` используется для всех действий (сказки + мультики)
- Добавлен прелоадер при переходе в личный кабинет
- Удалён большой видеофайл из репозитория

### 2025-12-22
- `68f63d9` feat: Update pricing system with subscriptions and stars
- `71260a3` feat: Add unified stars system for credits
- `f358c4e` fix: Add User-Agent header to bypass Cloudflare
- `b883320` fix: Add better error logging for ElevenLabs API
- `2d07e36` fix: Move audio player to top of story page
- `ee8e332` feat: Add story reading modes with audio players
- `37d6017` feat: Redesign create page with 2-step flow and add progress bar
- `6c53e52` feat: Add 12-month program with stories, questions, and progress tracking

### 2025-12-21
- `453a5f6` feat: Update DevelopmentMap with full 12-month program structure
- `31e44a4` feat: Skip payment modal for authorized users
- `3d28c79` feat: Update payment modal for all 3 tariffs + new FAQ
- `786c08a` chore: Remove 3d-gallery component
- `0a3bea6` fix: Add 'week' plan type and fix TypeScript errors
- `27ea1ca` feat: New 3-tier pricing structure

### 2025-12-20
- `e6691fd` content: Translate 12-Month Program title to English
- `76c6bf2` content: Update 12-Month Program title and subtitle to Russian
- `9550bca` refactor: Move Curriculum block under 12-Month Program
- `6d2ffc8` feat: Replace 'How it works' with new FairyTale AI magic block
- `93aa6f9` refactor: Remove 'How it works' block and update intro text
- `7850cd1` fix: Improve mobile responsiveness across all blocks
- `bcdc61d` feat: Add optimized hero video and images
- `2427f02` feat: Add Parent Value and Curriculum blocks with interactive dashboard

### Ранее
- `420de7e` feat: Translate /create page to English
- `fd438a3` feat: Translate DevelopmentMap component to English
- `f076067` feat: Add 12-month journey and weekly rewards
- `ee73460` feat: Add yearly development map with Month 1 "Me and Myself"
- `70398e8` feat: UX improvements - payment modal, smooth scroll
- `4193b9d` feat: Add cartoon credits system and update pricing
- `393797b` feat: Add credits display to dashboard
- `432a48e` feat: Add credit check to story generation API

## Миграции (не забудь применить!)
После пуша нужно выполнить в Supabase SQL Editor:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_until TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS subscription_days_added INTEGER DEFAULT 0;
```

## Структура проекта
```
src/
├── app/
│   ├── api/
│   │   ├── generate-story/     # Генерация сказки (требует подписку)
│   │   ├── generate-audio/     # Озвучка ElevenLabs (1 звезда)
│   │   ├── generate-music/     # Генерация музыки через Udio/PiAPI
│   │   ├── mix-audio/          # Микширование голоса с музыкой (ffmpeg)
│   │   ├── request-cartoon/    # Запрос мультика (5 звёзд)
│   │   ├── cartoon/
│   │   │   └── generate-character/  # Генерация персонажа DALL-E 3
│   │   ├── payment/
│   │   │   ├── create/         # Создание платежа Lava.top
│   │   │   └── webhook/        # Обработка webhook от Lava.top
│   │   └── user/credits/       # Получение баланса звёзд + isAdmin
│   ├── create/                 # Страница создания сказки
│   ├── create-cartoon/         # Страница создания персонажа мультика
│   ├── story/[id]/             # Страница просмотра сказки
│   ├── dashboard/              # Личный кабинет
│   └── page.tsx                # Главная страница
├── components/
│   ├── AuthProvider.tsx
│   ├── AuthModal.tsx
│   └── DevelopmentMap.tsx
└── lib/
    └── supabase/
```

## Переменные окружения
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# ElevenLabs (озвучка)
ELEVENLABS_API_KEY=

# PiAPI (генерация музыки через Udio)
PIAPI_API_KEY=

# OpenAI (DALL-E 3 для персонажей)
OPENAI_API_KEY=

# Lava.top (платежи)
LAVA_SECRET_KEY=
```

## В планах (TODO)
- [ ] Интерактивный превью персонажа с CSS фильтрами (меняется в зависимости от выбора)
- [ ] Нужны базовые изображения: лицо мальчика, лицо девочки, волосы мальчика, волосы девочки
- [ ] Протестировать генерацию персонажа когда OpenAI будет оплачен
- [ ] Создать пакеты звёзд в Lava.top
