import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const voiceName = formData.get("name") as string || "Мой голос";

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Конвертируем File в Blob для отправки
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type });

    // Создаём FormData для ElevenLabs API
    const elevenLabsFormData = new FormData();
    elevenLabsFormData.append("name", voiceName);
    elevenLabsFormData.append("description", "Клонированный голос для СказкаAI");
    elevenLabsFormData.append("files", audioBlob, "voice.webm");

    // Вызываем ElevenLabs API напрямую
    const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY || "",
      },
      body: elevenLabsFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ElevenLabs API error:", errorData);
      throw new Error(errorData.detail?.message || "Failed to clone voice");
    }

    const voice = await response.json();

    return NextResponse.json({
      success: true,
      voice: {
        voiceId: voice.voice_id,
        name: voice.name,
      },
    });
  } catch (error) {
    console.error("Error cloning voice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clone voice" },
      { status: 500 }
    );
  }
}
