import { NextRequest, NextResponse } from "next/server";

const SUNO_API_KEY = process.env.SUNO_API_KEY;
const SUNO_API_URL = process.env.SUNO_API_URL || "https://api.sunoapi.org";

// Промпты для музыки под разные темы сказок (для Suno)
const MUSIC_PROMPTS: Record<string, string> = {
  teeth: "gentle lullaby, soft piano, magical chimes, children's music, calming, bedtime story background, instrumental",
  sleep: "dreamy lullaby, soft strings, music box melody, sleepy, peaceful, nighttime, children's instrumental, very calm",
  food: "playful cheerful melody, xylophone, light and happy, children's music, fun kitchen vibes, instrumental",
  "fear-dark": "magical and reassuring, soft orchestral, twinkling stars, gentle courage theme, children's instrumental",
  "fear-doctor": "brave adventure theme, soft and encouraging, gentle brass, heroic but calm, children's instrumental",
  sharing: "warm friendly melody, acoustic guitar, happy together, friendship theme, children's instrumental",
  toys: "playful bouncy tune, toy piano, music box, organizing fun, light and cheerful, children's instrumental",
  gadgets: "nature sounds mixed with soft melody, acoustic, outdoor adventure, discovery theme, children's instrumental",
  siblings: "sweet family melody, warm strings, love and harmony, gentle bonding theme, children's instrumental",
  kindergarten: "bright morning melody, cheerful flute, new adventures, exciting but gentle, children's instrumental",
  custom: "magical fairy tale melody, soft orchestral, enchanting, children's story background, instrumental",
};

// Локальные royalty-free треки для разных настроений
// Файлы в /public/music/
const FALLBACK_MUSIC: Record<string, string> = {
  calm: "/music/calm.mp3",
  playful: "/music/playful.mp3",
  magical: "/music/magical.mp3",
  adventure: "/music/adventure.mp3",
};

// Маппинг тем на настроение музыки
const TOPIC_TO_MOOD: Record<string, string> = {
  teeth: "playful",
  sleep: "calm",
  food: "playful",
  "fear-dark": "magical",
  "fear-doctor": "adventure",
  sharing: "playful",
  toys: "playful",
  gadgets: "adventure",
  siblings: "calm",
  kindergarten: "adventure",
  custom: "magical",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic } = body;

    // Если Suno API настроен — используем его
    if (SUNO_API_KEY && SUNO_API_KEY !== "your_suno_api_key_here") {
      try {
        const musicUrl = await generateWithSuno(topic);
        if (musicUrl) {
          return NextResponse.json({
            success: true,
            music: { url: musicUrl, source: "suno" },
          });
        }
      } catch (err) {
        console.error("Suno generation failed, using fallback:", err);
      }
    }

    // Fallback: используем готовые треки
    const mood = TOPIC_TO_MOOD[topic] || "magical";
    const fallbackUrl = FALLBACK_MUSIC[mood] || FALLBACK_MUSIC.magical;

    return NextResponse.json({
      success: true,
      music: { url: fallbackUrl, source: "fallback" },
    });

  } catch (error) {
    console.error("Error generating music:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate music" },
      { status: 500 }
    );
  }
}

// Генерация через Suno API
async function generateWithSuno(topic: string): Promise<string | null> {
  const musicPrompt = MUSIC_PROMPTS[topic] || MUSIC_PROMPTS.custom;

  const response = await fetch(`${SUNO_API_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUNO_API_KEY}`,
    },
    body: JSON.stringify({
      prompt: musicPrompt,
      make_instrumental: true,
    }),
  });

  if (!response.ok) {
    throw new Error("Suno API request failed");
  }

  const data = await response.json();
  const taskId = data.task_id || data.id;

  if (!taskId) {
    return data.audio_url || data.url || null;
  }

  // Polling для получения результата
  for (let i = 0; i < 60; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const statusResponse = await fetch(`${SUNO_API_URL}/api/get?ids=${taskId}`, {
      headers: { "Authorization": `Bearer ${SUNO_API_KEY}` },
    });

    const statusData = await statusResponse.json();
    const task = Array.isArray(statusData) ? statusData[0] : statusData;

    if (task.status === "complete" || task.audio_url) {
      return task.audio_url || task.url;
    }

    if (task.status === "failed") {
      throw new Error("Suno generation failed");
    }
  }

  throw new Error("Suno generation timeout");
}
