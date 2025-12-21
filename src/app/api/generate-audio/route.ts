import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Словарь ударений для часто неправильно произносимых слов
// Используем символ ударения (́) после ударной гласной
const STRESS_DICTIONARY: Record<string, string> = {
  // Частые ошибки в детских сказках
  "сказка": "ска́зка",
  "сказки": "ска́зки",
  "сказку": "ска́зку",
  "сказке": "ска́зке",
  "сказкой": "ска́зкой",
  "замок": "за́мок", // крепость
  "замка": "за́мка",
  "замке": "за́мке",
  "красивый": "краси́вый",
  "красивая": "краси́вая",
  "красивое": "краси́вое",
  "красиво": "краси́во",
  "волшебный": "волше́бный",
  "волшебная": "волше́бная",
  "волшебное": "волше́бное",
  "волшебник": "волше́бник",
  "понял": "по́нял",
  "поняла": "поняла́",
  "поняли": "по́няли",
  "начал": "на́чал",
  "начала": "начала́",
  "начали": "на́чали",
  "хотел": "хоте́л",
  "хотела": "хоте́ла",
  "спать": "спа́ть",
  "спал": "спа́л",
  "спала": "спала́",
  "игрушки": "игру́шки",
  "игрушек": "игру́шек",
  "игрушку": "игру́шку",
  "малыш": "малы́ш",
  "малыша": "малыша́",
  "малышу": "малышу́",
  "ребенок": "ребёнок",
  "ребенка": "ребёнка",
  "зубки": "зу́бки",
  "зубы": "зу́бы",
  "чистить": "чи́стить",
  "темнота": "темнота́",
  "темноты": "темноты́",
  "темноте": "темноте́",
  "боялся": "боя́лся",
  "боялась": "боя́лась",
  "страшно": "стра́шно",
  "страшный": "стра́шный",
  "добрый": "до́брый",
  "добрая": "до́брая",
  "доброе": "до́брое",
  "друзья": "друзья́",
  "друзей": "друзе́й",
  "вместе": "вме́сте",
  "весело": "ве́село",
  "веселый": "весёлый",
  "веселая": "весёлая",
  "однажды": "одна́жды",
  "давным": "давны́м",
  "давно": "давно́",
  "жили": "жи́ли",
  "были": "бы́ли",
  "потом": "пото́м",
  "теперь": "тепе́рь",
  "всегда": "всегда́",
  "никогда": "никогда́",
  "любил": "люби́л",
  "любила": "люби́ла",
  "любили": "люби́ли",
  "улыбнулся": "улыбну́лся",
  "улыбнулась": "улыбну́лась",
  "обнял": "о́бнял",
  "обняла": "обняла́",
  "родители": "роди́тели",
  "родителей": "роди́телей",
  "мама": "ма́ма",
  "маму": "ма́му",
  "мамой": "ма́мой",
  "папа": "па́па",
  "папу": "па́пу",
  "папой": "па́пой",
  "бабушка": "ба́бушка",
  "бабушку": "ба́бушку",
  "дедушка": "де́душка",
  "дедушку": "де́душку",
  "животик": "живо́тик",
  "кроватка": "крова́тка",
  "кроватку": "крова́тку",
  "подушка": "поду́шка",
  "подушку": "поду́шку",
  "одеяло": "одея́ло",
  "одеялом": "одея́лом",
  "утром": "у́тром",
  "вечером": "ве́чером",
  "ночью": "но́чью",
  "днем": "днём",
  "солнце": "со́лнце",
  "солнышко": "со́лнышко",
  "звезды": "звёзды",
  "звездочки": "звёздочки",
  "луна": "луна́",
  "небо": "не́бо",
  "облака": "облака́",
  "радуга": "ра́дуга",
  "цветы": "цветы́",
  "цветок": "цвето́к",
  "дерево": "де́рево",
  "деревья": "дере́вья",
  "лес": "ле́с",
  "лесу": "ле́су",
  "поляна": "поля́на",
  "поляне": "поля́не",
};

// Функция для добавления ударений в текст
function addStressMarks(text: string): string {
  let result = text;

  // Сортируем слова по длине (от длинных к коротким), чтобы избежать частичных замен
  const sortedWords = Object.keys(STRESS_DICTIONARY).sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    // Создаём регулярное выражение для поиска слова с учётом границ слова
    // и без учёта регистра
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      // Сохраняем регистр первой буквы
      const replacement = STRESS_DICTIONARY[word.toLowerCase()];
      if (match[0] === match[0].toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }

  return result;
}

// Default English voice from ElevenLabs (Rachel - warm female voice)
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voiceId } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Text is required" },
        { status: 400 }
      );
    }

    // Use default voice if not specified or "default"
    const actualVoiceId = (voiceId && voiceId !== "default") ? voiceId : DEFAULT_VOICE_ID;

    // Generate audio via REST API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${actualVoiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2", // Поддерживает русский язык
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ElevenLabs TTS error:", errorData);
      throw new Error(errorData.detail?.message || "Failed to generate audio");
    }

    // Получаем аудио как ArrayBuffer
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioArrayBuffer).toString("base64");

    return NextResponse.json({
      success: true,
      audio: {
        base64: audioBase64,
        mimeType: "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("Error generating audio:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate audio" },
      { status: 500 }
    );
  }
}
