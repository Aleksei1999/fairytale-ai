import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

interface StoryRequest {
  childName: string;
  childAge: string;
  childGender: "boy" | "girl";
  childInterests: string;
  topic: string;
  customTopic?: string;
  character: string;
  duration: "short" | "medium" | "long";
}

const TOPIC_DESCRIPTIONS: Record<string, string> = {
  teeth: "ребёнок не хочет чистить зубы",
  sleep: "ребёнок не хочет ложиться спать",
  food: "ребёнок плохо ест или капризничает за столом",
  "fear-dark": "ребёнок боится темноты",
  "fear-doctor": "ребёнок боится врачей и больницы",
  sharing: "ребёнок не хочет делиться игрушками",
  toys: "ребёнок не убирает игрушки",
  gadgets: "ребёнок слишком много времени проводит с гаджетами",
  siblings: "ребёнок обижает брата или сестру",
  kindergarten: "ребёнок не хочет идти в детский сад",
};

// Информация о персонажах с учётом грамматического рода
const CHARACTER_INFO: Record<string, { name: string; gender: "male" | "female"; friend: string; pronoun: string; pronounHim: string }> = {
  dinosaur: { name: "добрый динозаврик", gender: "male", friend: "друг", pronoun: "он", pronounHim: "его" },
  unicorn: { name: "волшебный единорог", gender: "male", friend: "друг", pronoun: "он", pronounHim: "его" },
  robot: { name: "умный робот", gender: "male", friend: "друг", pronoun: "он", pronounHim: "его" },
  dragon: { name: "дружелюбный дракончик", gender: "male", friend: "друг", pronoun: "он", pronounHim: "его" },
  fairy: { name: "добрая фея", gender: "female", friend: "подруга", pronoun: "она", pronounHim: "её" },
  superhero: { name: "храбрый супергерой", gender: "male", friend: "друг", pronoun: "он", pronounHim: "его" },
  animal: { name: "мудрый лисёнок", gender: "male", friend: "друг", pronoun: "он", pronounHim: "его" },
  space: { name: "отважный космонавт", gender: "male", friend: "друг", pronoun: "он", pronounHim: "его" },
};

const DURATION_WORDS: Record<string, number> = {
  short: 300,
  medium: 500,
  long: 800,
};

export async function POST(request: NextRequest) {
  try {
    // Verify user session first
    const supabaseAuth = await createClient();
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body: StoryRequest = await request.json();

    const {
      childName,
      childAge,
      childGender,
      childInterests,
      topic,
      customTopic,
      character,
      duration,
    } = body;

    const supabase = createAdminClient();

    // Get user's profile and check subscription using authenticated user's email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, credits, subscription_until, subscription_type, free_trial_stories_used")
      .eq("email", user.email)
      .single();

    if (profileError || !profile) {
      console.error("Profile not found:", profileError);
      return NextResponse.json(
        { success: false, error: "User profile not found" },
        { status: 404 }
      );
    }

    // Check if user has active subscription (story generation is free for subscribers)
    const hasActiveSubscription = profile.subscription_until &&
      new Date(profile.subscription_until) > new Date();

    if (!hasActiveSubscription) {
      return NextResponse.json(
        { success: false, error: "Subscription required", message: "Story generation requires an active subscription" },
        { status: 402 }
      );
    }

    // Check free trial story limit (max 3 stories)
    const isFreeTrial = profile.subscription_type === "free_trial";
    const freeTrialStoriesUsed = profile.free_trial_stories_used || 0;
    const FREE_TRIAL_STORY_LIMIT = 3;

    if (isFreeTrial && freeTrialStoriesUsed >= FREE_TRIAL_STORY_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: "Free trial limit reached",
          message: "You have used all 3 stories in your free trial. Subscribe to continue creating stories!",
          freeTrialLimitReached: true
        },
        { status: 402 }
      );
    }

    const genderPronoun = childGender === "boy" ? "мальчик" : "девочка";
    const genderHe = childGender === "boy" ? "он" : "она";
    const genderHim = childGender === "boy" ? "его" : "её";

    const topicDescription = topic === "custom"
      ? customTopic
      : TOPIC_DESCRIPTIONS[topic] || topic;

    // Получаем информацию о персонаже
    const charInfo = CHARACTER_INFO[character] || {
      name: character,
      gender: "male" as const,
      friend: "друг",
      pronoun: "он",
      pronounHim: "его"
    };
    const characterName = charInfo.name;
    const characterFriend = charInfo.friend; // друг или подруга
    const characterPronoun = charInfo.pronoun; // он или она
    const characterPronounHim = charInfo.pronounHim; // его или её

    const wordCount = DURATION_WORDS[duration] || 500;

    const systemPrompt = `Ты — профессиональный детский писатель и психолог, специализирующийся на терапевтических сказках для детей.

Твоя задача — написать персонализированную терапевтическую сказку, которая:
1. Использует метод терапевтической метафоры
2. Мягко помогает ребёнку справиться с проблемой через историю
3. Показывает главного героя (ребёнка), который сначала сталкивается с трудностью, но с помощью волшебного помощника находит решение
4. Заканчивается позитивно, с чётким уроком
5. Написана простым, понятным языком для ребёнка ${childAge} лет
6. Добрая, без страшных или жестоких элементов

ОБЯЗАТЕЛЬНАЯ СТРУКТУРА СКАЗКИ (строго следуй этой методике):

1. **Метафора (Введение):** Введи героя, похожего на ребёнка — ${genderPronoun} по имени ${childName}. Опиши ${genderHim} мир, семью, что ${genderHe} любит.

2. **Проблема:** Герой сталкивается с той же проблемой, что и ребёнок (${topicDescription}). Покажи, как ${genderHe} себя ведёт, что чувствует.

3. **Кульминация:** Покажи в мягкой форме, к чему приводит такое поведение. Не пугай, но дай понять последствия. Здесь появляется волшебный помощник — ${characterName}.

4. **Решение:** С помощью волшебного помощника герой находит выход, меняет своё поведение. Покажи конкретные действия, которые помогли.

5. **Хэппи-энд + Закрепление:** Счастливый финал. Герой делает вывод, чему ${genderHe} научился. Закрепи позитивное поведение.

КРИТИЧЕСКИ ВАЖНО — ГРАММАТИКА И РОД:

Главный герой — ${genderPronoun} ${childName}:
- Используй местоимения: ${genderHe}, ${genderHim}
- Пример: "${childName} ${genderHe === "он" ? "пошёл" : "пошла"}", "${genderHim} мама"

Волшебный помощник — ${characterName}:
- Это ${characterFriend} (${characterPronoun === "он" ? "мужской род" : "женский род"})
- Используй местоимения: ${characterPronoun}, ${characterPronounHim}
- Пример: "${characterName} ${characterPronoun === "он" ? "сказал" : "сказала"}", "${characterPronounHim} глаза"
- ${characterName} — это ${characterFriend}, НЕ ${characterPronoun === "он" ? "подруга" : "друг"}!

Правила:
- Главный герой сказки — ${genderPronoun} по имени ${childName} (${genderHe}/${genderHim})
- Волшебный помощник — ${characterName} (${characterPronoun}/${characterPronounHim}) — это ${characterFriend}
- Сказка должна быть примерно ${wordCount} слов
- Используй яркие, добрые образы
- Избегай прямых нравоучений — показывай через действия героя
- Сказка должна быть увлекательной и интересной для ребёнка
- Пиши плавно, без разбивки на части — это единый текст сказки
- СТРОГО следи за правильным родом и склонениями для ОБОИХ персонажей!`;

    const userPrompt = `Напиши терапевтическую сказку для ребёнка:

Имя: ${childName}
Возраст: ${childAge} лет
Пол: ${genderPronoun}
${childInterests ? `Интересы: ${childInterests}` : ""}

Проблема, которую нужно проработать: ${topicDescription}

Волшебный помощник: ${characterName}

Напиши сказку, которая поможет ${childName} справиться с этой ситуацией. Начни сразу с текста сказки, без заголовков и пояснений.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const storyText = completion.choices[0]?.message?.content || "";

    // Генерируем название сказки
    const titleCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Придумай короткое (3-5 слов) название для детской сказки про ${genderPronoun} ${childName} и ${characterName}. Тема: ${topicDescription}. Ответь только названием, без кавычек.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 50,
    });

    const storyTitle = titleCompletion.choices[0]?.message?.content || `${childName} и ${characterName}`;

    // Story generation is FREE for subscribers - no credit deduction
    // But for free trial users, increment the story counter
    if (isFreeTrial) {
      await supabase
        .from("profiles")
        .update({ free_trial_stories_used: freeTrialStoriesUsed + 1 })
        .eq("id", profile.id);
    }

    // Сохраняем сказку в БД для истории и n8n
    const { data: savedStory, error: storyError } = await supabase
      .from("stories")
      .insert({
        user_id: profile.id,
        child_name: childName,
        child_age: childAge,
        child_gender: childGender,
        child_interests: childInterests || null,
        topic,
        custom_topic: customTopic || null,
        character,
        duration,
        title: storyTitle.trim(),
        story_text: storyText.trim(),
        word_count: storyText.split(/\s+/).length,
      })
      .select("id")
      .single();

    if (storyError) {
      console.error("Error saving story:", storyError);
    } else {
      console.log(`Story saved with ID: ${savedStory?.id}`);
    }

    return NextResponse.json({
      success: true,
      story: {
        id: savedStory?.id || null,
        title: storyTitle.trim(),
        text: storyText.trim(),
        childName,
        character,
        topic,
        duration,
        wordCount: storyText.split(/\s+/).length,
      },
    });
  } catch (error) {
    console.error("Error generating story:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate story" },
      { status: 500 }
    );
  }
}
