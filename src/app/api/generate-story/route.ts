import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

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

    return NextResponse.json({
      success: true,
      story: {
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
