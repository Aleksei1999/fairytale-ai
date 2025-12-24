import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink, readFile, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

// Увеличиваем таймаут до 60 секунд для микширования аудио
export const maxDuration = 60;

const execAsync = promisify(exec);

// Микширование голоса диктора с фоновой музыкой
// Голос громче (100%), музыка тише (20-30%)
export async function POST(request: NextRequest) {
  const tempFiles: string[] = [];

  try {
    const body = await request.json();
    const { voiceBase64, musicUrl } = body;

    if (!voiceBase64 || !musicUrl) {
      return NextResponse.json(
        { success: false, error: "Missing voiceBase64 or musicUrl" },
        { status: 400 }
      );
    }

    const tempDir = join(tmpdir(), "fairytale-mix");
    await mkdir(tempDir, { recursive: true });

    const sessionId = randomUUID();
    const voicePath = join(tempDir, `voice-${sessionId}.mp3`);
    const musicPath = join(tempDir, `music-${sessionId}.mp3`);
    const outputPath = join(tempDir, `output-${sessionId}.mp3`);

    tempFiles.push(voicePath, musicPath, outputPath);

    // Сохраняем голос из base64
    const voiceBuffer = Buffer.from(voiceBase64, "base64");
    await writeFile(voicePath, voiceBuffer);

    // Скачиваем музыку
    const musicResponse = await fetch(musicUrl);
    if (!musicResponse.ok) {
      throw new Error("Failed to download music");
    }
    const musicBuffer = Buffer.from(await musicResponse.arrayBuffer());
    await writeFile(musicPath, musicBuffer);

    // Получаем длительность голосовой дорожки
    const { stdout: durationOutput } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${voicePath}"`
    );
    const voiceDuration = parseFloat(durationOutput.trim());

    // Микшируем: голос на полной громкости, музыка на 25% громкости
    // Музыка зациклена и обрезана по длине голоса
    // Добавляем fade out для музыки в конце
    const ffmpegCommand = `ffmpeg -y \
      -i "${voicePath}" \
      -stream_loop -1 -i "${musicPath}" \
      -filter_complex "\
        [1:a]volume=0.25,afade=t=out:st=${Math.max(0, voiceDuration - 3)}:d=3[music];\
        [0:a][music]amix=inputs=2:duration=first:dropout_transition=2[out]" \
      -map "[out]" \
      -t ${voiceDuration} \
      -codec:a libmp3lame -q:a 2 \
      "${outputPath}"`;

    await execAsync(ffmpegCommand);

    // Читаем результат
    const outputBuffer = await readFile(outputPath);
    const outputBase64 = outputBuffer.toString("base64");

    // Очищаем временные файлы
    await cleanupTempFiles(tempFiles);

    return NextResponse.json({
      success: true,
      audio: {
        base64: outputBase64,
        duration: voiceDuration,
      },
    });

  } catch (error) {
    console.error("Error mixing audio:", error);

    // Очищаем временные файлы при ошибке
    await cleanupTempFiles(tempFiles);

    return NextResponse.json(
      { success: false, error: "Failed to mix audio" },
      { status: 500 }
    );
  }
}

async function cleanupTempFiles(files: string[]) {
  for (const file of files) {
    try {
      await unlink(file);
    } catch {
      // Игнорируем ошибки удаления
    }
  }
}
