import { NextRequest, NextResponse } from "next/server";

// Увеличиваем таймаут до 120 секунд для генерации музыки (Udio может работать долго)
export const maxDuration = 120;

const PIAPI_KEY = process.env.PIAPI_API_KEY;
const PIAPI_BASE_URL = "https://api.piapi.ai/api/v1";

// Промпты для музыки под разные темы сказок (для Udio)
const MUSIC_PROMPTS: Record<string, string> = {
  teeth: "gentle lullaby, soft piano, magical chimes, children's music, calming, bedtime story background, instrumental, no vocals",
  sleep: "dreamy lullaby, soft strings, music box melody, sleepy, peaceful, nighttime, children's instrumental, very calm, no vocals",
  food: "playful cheerful melody, xylophone, light and happy, children's music, fun kitchen vibes, instrumental, no vocals",
  "fear-dark": "magical and reassuring, soft orchestral, twinkling stars, gentle courage theme, children's instrumental, no vocals",
  "fear-doctor": "brave adventure theme, soft and encouraging, gentle brass, heroic but calm, children's instrumental, no vocals",
  sharing: "warm friendly melody, acoustic guitar, happy together, friendship theme, children's instrumental, no vocals",
  toys: "playful bouncy tune, toy piano, music box, organizing fun, light and cheerful, children's instrumental, no vocals",
  gadgets: "nature sounds mixed with soft melody, acoustic, outdoor adventure, discovery theme, children's instrumental, no vocals",
  siblings: "sweet family melody, warm strings, love and harmony, gentle bonding theme, children's instrumental, no vocals",
  kindergarten: "bright morning melody, cheerful flute, new adventures, exciting but gentle, children's instrumental, no vocals",
  emotions: "gentle emotional melody, soft piano and strings, introspective, calming, children's story background, no vocals",
  friendship: "warm and joyful, ukulele and light percussion, playful friendship theme, children's music, no vocals",
  confidence: "uplifting and encouraging, gentle orchestral, building confidence theme, positive, children's instrumental, no vocals",
  custom: "magical fairy tale melody, soft orchestral, enchanting, children's story background, instrumental, whimsical, no vocals",
};


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, storyTitle } = body;

    // Проверяем наличие PiAPI ключа
    if (!PIAPI_KEY || PIAPI_KEY === "your_piapi_key_here") {
      return NextResponse.json({
        success: false,
        error: "Music generation not configured (no PIAPI_API_KEY)",
      });
    }

    // Генерируем музыку через Udio
    const musicUrl = await generateWithUdio(topic, storyTitle);

    if (musicUrl) {
      return NextResponse.json({
        success: true,
        music: { url: musicUrl, source: "udio" },
      });
    }

    return NextResponse.json({
      success: false,
      error: "Music generation failed",
    });

  } catch (error) {
    console.error("Error generating music:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate music" },
      { status: 500 }
    );
  }
}

// Генерация через Udio API (PiAPI)
async function generateWithUdio(topic: string, storyTitle?: string): Promise<string | null> {
  const basePrompt = MUSIC_PROMPTS[topic] || MUSIC_PROMPTS.custom;
  const prompt = storyTitle
    ? `${basePrompt}, background music for story "${storyTitle}"`
    : basePrompt;

  // Создаём задачу на генерацию
  const createResponse = await fetch(`${PIAPI_BASE_URL}/task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": PIAPI_KEY || "",
    },
    body: JSON.stringify({
      model: "music-u",
      task_type: "generate_music",
      input: {
        prompt: prompt,
        lyrics_type: "instrumental",
        negative_tags: "vocals, singing, voice, lyrics, speech",
      },
    }),
  });

  if (!createResponse.ok) {
    const errorData = await createResponse.json();
    console.error("PiAPI create task error:", errorData);
    throw new Error("Failed to create music generation task");
  }

  const createData = await createResponse.json();
  const taskId = createData.data?.task_id || createData.task_id;

  if (!taskId) {
    console.error("No task_id in response:", createData);
    throw new Error("No task_id returned from PiAPI");
  }

  // Polling для получения результата (макс 2 минуты)
  for (let i = 0; i < 60; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const statusResponse = await fetch(`${PIAPI_BASE_URL}/task/${taskId}`, {
      headers: {
        "X-API-Key": PIAPI_KEY || "",
      },
    });

    if (!statusResponse.ok) {
      console.error("PiAPI get task error:", await statusResponse.text());
      continue;
    }

    const statusData = await statusResponse.json();
    const task = statusData.data || statusData;
    const status = task.status;

    console.log(`Music generation status: ${status} (attempt ${i + 1})`);

    if (status === "completed") {
      // Получаем URL аудио из output
      const audioUrl = task.output?.audio_url
        || task.output?.audio?.[0]?.url
        || task.output?.url
        || task.audio_url;

      if (audioUrl) {
        return audioUrl;
      }
      console.error("No audio URL in completed task:", task);
      throw new Error("No audio URL in completed task");
    }

    if (status === "failed") {
      console.error("Music generation failed:", task.error);
      throw new Error(task.error?.message || "Music generation failed");
    }
  }

  throw new Error("Music generation timeout (2 minutes)");
}
