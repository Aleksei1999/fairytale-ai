"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type Step = 1 | 2 | 3 | 4;

interface ChildInfo {
  name: string;
  age: string;
  gender: "boy" | "girl" | "";
  interests: string;
}

interface StorySettings {
  topic: string;
  customTopic: string;
  character: string;
  duration: "short" | "medium" | "long";
}

interface GeneratedStory {
  title: string;
  text: string;
  wordCount: number;
}

interface ClonedVoice {
  voiceId: string;
  name: string;
}

const TOPICS = [
  { id: "teeth", label: "Не хочет чистить зубы", icon: "🪥" },
  { id: "sleep", label: "Не хочет ложиться спать", icon: "😴" },
  { id: "food", label: "Плохо ест / капризничает", icon: "🥦" },
  { id: "fear-dark", label: "Боится темноты", icon: "🌙" },
  { id: "fear-doctor", label: "Боится врачей", icon: "👨‍⚕️" },
  { id: "sharing", label: "Не хочет делиться", icon: "🤝" },
  { id: "toys", label: "Не убирает игрушки", icon: "🧸" },
  { id: "gadgets", label: "Зависимость от гаджетов", icon: "📱" },
  { id: "siblings", label: "Обижает брата/сестру", icon: "👫" },
  { id: "kindergarten", label: "Не хочет в садик", icon: "🏫" },
  { id: "custom", label: "Своя тема...", icon: "✏️" },
];

const CHARACTERS = [
  { id: "dinosaur", label: "Динозавр", icon: "🦕" },
  { id: "unicorn", label: "Единорог", icon: "🦄" },
  { id: "robot", label: "Робот", icon: "🤖" },
  { id: "dragon", label: "Дракон", icon: "🐉" },
  { id: "fairy", label: "Фея", icon: "🧚" },
  { id: "superhero", label: "Супергерой", icon: "🦸" },
  { id: "animal", label: "Лесные звери", icon: "🦊" },
  { id: "space", label: "Космонавт", icon: "👨‍🚀" },
];

function CreatePageContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clonedVoice, setClonedVoice] = useState<ClonedVoice | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [backgroundMusicUrl, setBackgroundMusicUrl] = useState<string | null>(null);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  const [childInfo, setChildInfo] = useState<ChildInfo>({
    name: searchParams.get("name") || "",
    age: "",
    gender: "",
    interests: "",
  });

  const [storySettings, setStorySettings] = useState<StorySettings>({
    topic: "",
    customTopic: "",
    character: "",
    duration: "medium",
  });

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Fake generation progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating && generationProgress < 100) {
      interval = setInterval(() => {
        setGenerationProgress((p) => Math.min(p + Math.random() * 15, 100));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isGenerating, generationProgress]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      alert("Не удалось получить доступ к микрофону. Проверьте разрешения.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const canProceedStep1 = childInfo.name && childInfo.age && childInfo.gender;
  const canProceedStep2 = storySettings.topic && (storySettings.topic !== "custom" || storySettings.customTopic) && storySettings.character;
  const canProceedStep3 = audioBlob || recordingTime >= 30;

  // Клонирование голоса
  const cloneVoice = async () => {
    if (!audioBlob) return null;

    setIsCloning(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice.webm");
      formData.append("name", `Голос для ${childInfo.name}`);

      const response = await fetch("/api/clone-voice", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setClonedVoice(data.voice);
        return data.voice;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Voice cloning error:", err);
      return null;
    } finally {
      setIsCloning(false);
    }
  };

  // Генерация аудио
  const generateAudio = async (text: string, voiceId: string) => {
    setIsGeneratingAudio(true);
    try {
      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId }),
      });

      const data = await response.json();
      if (data.success) {
        setAudioBase64(data.audio.base64);
        return data.audio.base64;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Audio generation error:", err);
      return null;
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Генерация фоновой музыки
  const generateMusic = async (topic: string, duration: string) => {
    setIsGeneratingMusic(true);
    try {
      const response = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, duration }),
      });

      const data = await response.json();
      console.log("Music API response:", data);
      if (data.success && data.music?.url) {
        console.log("Setting background music URL:", data.music.url);
        setBackgroundMusicUrl(data.music.url);
        return data.music.url;
      }
      return null;
    } catch (err) {
      console.error("Music generation error:", err);
      return null;
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  // Воспроизведение аудио с фоновой музыкой
  const playAudio = () => {
    if (!audioBase64 || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (musicRef.current && musicEnabled) {
        musicRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      // Запускаем фоновую музыку
      if (musicRef.current && musicEnabled && backgroundMusicUrl) {
        musicRef.current.volume = 0.15; // Музыка 15% громкости — фон для голоса
        musicRef.current.play().catch(err => {
          console.error("Music play error:", err);
        });
      }
      setIsPlaying(true);
    }
  };

  // Переключение фоновой музыки
  const toggleMusic = () => {
    setMusicEnabled(!musicEnabled);
    if (musicRef.current) {
      if (musicEnabled) {
        musicRef.current.pause();
      } else if (isPlaying && backgroundMusicUrl) {
        musicRef.current.volume = 0.1;
        musicRef.current.play();
      }
    }
  };

  // Обновление прогресса аудио
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      audio.ontimeupdate = () => {
        setAudioProgress(audio.currentTime);
      };

      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setAudioProgress(0);
      };
    }
  }, [audioBase64]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);

    try {
      // Запускаем генерацию музыки параллельно (не ждём результат)
      const musicPromise = generateMusic(storySettings.topic, storySettings.duration);

      // Шаг 1: Клонируем голос (если есть запись)
      let voice: ClonedVoice | null = null;
      if (audioBlob) {
        setGenerationProgress(10);
        voice = await cloneVoice();
        if (!voice) {
          // Если клонирование не удалось, продолжаем без голоса
          console.warn("Voice cloning failed, continuing without voice");
        }
        setGenerationProgress(30);
      }

      // Шаг 2: Генерируем сказку
      setGenerationProgress(40);
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: childInfo.name,
          childAge: childInfo.age,
          childGender: childInfo.gender,
          childInterests: childInfo.interests,
          topic: storySettings.topic,
          customTopic: storySettings.customTopic,
          character: storySettings.character,
          duration: storySettings.duration,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Ошибка генерации");
      }

      const story = {
        title: data.story.title,
        text: data.story.text,
        wordCount: data.story.wordCount,
      };
      setGeneratedStory(story);
      setGenerationProgress(70);

      // Шаг 3: Генерируем озвучку (если есть клонированный голос)
      if (voice) {
        setGenerationProgress(80);
        await generateAudio(story.text, voice.voiceId);
        setGenerationProgress(90);
      }

      // Ждём завершения генерации музыки (она шла параллельно)
      setGenerationProgress(95);
      await musicPromise;

      setGenerationProgress(100);
      setTimeout(() => {
        setStep(4);
        setIsGenerating(false);
      }, 500);

    } catch (err) {
      setError("Не удалось создать сказку. Попробуйте ещё раз.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-sky-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/4 w-80 h-80 bg-sky-100/40 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-6 py-6">
        <nav className="glass-card px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">✨</span>
            </div>
            <span className="font-display text-xl font-bold text-gray-800">СказкаAI</span>
          </Link>

          {/* Progress indicator */}
          <div className="hidden sm:flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    s === step
                      ? "bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg"
                      : s < step
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {s < step ? "✓" : s}
                </div>
                {s < 4 && (
                  <div className={`w-8 h-1 mx-1 rounded ${s < step ? "bg-green-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-500">
            Шаг {step} из 4
          </div>
        </nav>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-8">
        {/* Step 1: Child Info */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">👶</div>
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
                Расскажите о ребёнке
              </h1>
              <p className="text-gray-600">
                Эта информация поможет создать персональную сказку
              </p>
            </div>

            <div className="glass-card-strong p-8 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Как зовут ребёнка? *
                </label>
                <input
                  type="text"
                  value={childInfo.name}
                  onChange={(e) => setChildInfo({ ...childInfo, name: e.target.value })}
                  placeholder="Имя"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-sky-200 focus:border-sky-400 focus:outline-none bg-white/80"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сколько лет? *
                </label>
                <div className="flex gap-2 flex-wrap">
                  {["2", "3", "4", "5", "6", "7", "8", "9", "10+"].map((age) => (
                    <button
                      key={age}
                      onClick={() => setChildInfo({ ...childInfo, age })}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        childInfo.age === age
                          ? "bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg"
                          : "bg-white/80 text-gray-600 hover:bg-white border border-sky-200"
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Пол ребёнка *
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setChildInfo({ ...childInfo, gender: "boy" })}
                    className={`flex-1 py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
                      childInfo.gender === "boy"
                        ? "bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg"
                        : "bg-white/80 text-gray-600 hover:bg-white border border-sky-200"
                    }`}
                  >
                    <span className="text-2xl">👦</span>
                    <span>Мальчик</span>
                  </button>
                  <button
                    onClick={() => setChildInfo({ ...childInfo, gender: "girl" })}
                    className={`flex-1 py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
                      childInfo.gender === "girl"
                        ? "bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg"
                        : "bg-white/80 text-gray-600 hover:bg-white border border-sky-200"
                    }`}
                  >
                    <span className="text-2xl">👧</span>
                    <span>Девочка</span>
                  </button>
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Интересы и увлечения (опционально)
                </label>
                <textarea
                  value={childInfo.interests}
                  onChange={(e) => setChildInfo({ ...childInfo, interests: e.target.value })}
                  placeholder="Например: любит динозавров, играет в футбол, смотрит Щенячий патруль..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-sky-200 focus:border-sky-400 focus:outline-none bg-white/80 resize-none"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className={`btn-glow px-8 py-4 text-white font-semibold text-lg inline-flex items-center gap-2 ${
                  !canProceedStep1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span>Далее</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Story Settings */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🎯</div>
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
                Выберите тему сказки
              </h1>
              <p className="text-gray-600">
                Какую ситуацию хотите проработать с {childInfo.name}?
              </p>
            </div>

            <div className="glass-card-strong p-8 space-y-6">
              {/* Topics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Тема воспитания *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setStorySettings({ ...storySettings, topic: topic.id })}
                      className={`p-4 rounded-2xl text-left transition-all ${
                        storySettings.topic === topic.id
                          ? "bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg"
                          : "bg-white/80 text-gray-700 hover:bg-white border border-sky-200"
                      }`}
                    >
                      <span className="text-2xl mr-2">{topic.icon}</span>
                      <span className="text-sm font-medium">{topic.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom topic */}
              {storySettings.topic === "custom" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Опишите ситуацию
                  </label>
                  <textarea
                    value={storySettings.customTopic}
                    onChange={(e) => setStorySettings({ ...storySettings, customTopic: e.target.value })}
                    placeholder="Например: ребёнок боится оставаться у бабушки..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-sky-200 focus:border-sky-400 focus:outline-none bg-white/80 resize-none"
                  />
                </div>
              )}

              {/* Character */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Выберите персонажа-помощника *
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {CHARACTERS.map((char) => (
                    <button
                      key={char.id}
                      onClick={() => setStorySettings({ ...storySettings, character: char.id })}
                      className={`p-4 rounded-2xl text-center transition-all ${
                        storySettings.character === char.id
                          ? "bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg"
                          : "bg-white/80 text-gray-700 hover:bg-white border border-sky-200"
                      }`}
                    >
                      <div className="text-3xl mb-1">{char.icon}</div>
                      <div className="text-xs font-medium">{char.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Длительность сказки
                </label>
                <div className="flex gap-3">
                  {[
                    { id: "short", label: "Короткая", time: "~2 мин" },
                    { id: "medium", label: "Средняя", time: "~4 мин" },
                    { id: "long", label: "Длинная", time: "~7 мин" },
                  ].map((dur) => (
                    <button
                      key={dur.id}
                      onClick={() => setStorySettings({ ...storySettings, duration: dur.id as "short" | "medium" | "long" })}
                      className={`flex-1 py-3 rounded-2xl text-center transition-all ${
                        storySettings.duration === dur.id
                          ? "bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg"
                          : "bg-white/80 text-gray-700 hover:bg-white border border-sky-200"
                      }`}
                    >
                      <div className="font-medium">{dur.label}</div>
                      <div className="text-xs opacity-70">{dur.time}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary px-6 py-3 text-gray-700 font-medium inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                <span>Назад</span>
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className={`btn-glow px-8 py-4 text-white font-semibold text-lg inline-flex items-center gap-2 ${
                  !canProceedStep2 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span>Далее</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Voice Recording */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🎙️</div>
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
                Запишите свой голос
              </h1>
              <p className="text-gray-600">
                Прочитайте текст ниже — мы клонируем ваш голос для озвучки
              </p>
            </div>

            <div className="glass-card-strong p-8 space-y-6">
              {/* Text to read */}
              <div className="glass-card p-6 bg-sky-50/50">
                <p className="text-sm text-gray-500 mb-2">Прочитайте этот текст вслух:</p>
                <p className="text-gray-800 leading-relaxed">
                  «Давным-давно, в одном волшебном королевстве, жил маленький {childInfo.gender === "boy" ? "мальчик" : "девочка"} по имени {childInfo.name}.
                  Каждый день {childInfo.gender === "boy" ? "он" : "она"} просыпался с улыбкой и отправлялся на поиски приключений.
                  Птицы пели весёлые песни, а солнце светило ярко-ярко.
                  И вот однажды случилось нечто удивительное, что изменило всё вокруг...»
                </p>
              </div>

              {/* Recording UI */}
              <div className="text-center py-8">
                {!isRecording && !audioBlob && (
                  <button
                    onClick={startRecording}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-xl hover:scale-110 transition-transform flex items-center justify-center mx-auto"
                  >
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                  </button>
                )}

                {isRecording && (
                  <div>
                    <button
                      onClick={stopRecording}
                      className="w-24 h-24 rounded-full bg-red-500 text-white shadow-xl hover:scale-110 transition-transform flex items-center justify-center mx-auto animate-pulse"
                    >
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    </button>
                    <div className="mt-4 text-2xl font-bold text-gray-900">
                      {formatTime(recordingTime)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Записываем... (минимум 30 секунд)
                    </p>
                    {/* Fake waveform */}
                    <div className="flex items-center justify-center gap-1 h-12 mt-4">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-sky-400 rounded-full animate-pulse"
                          style={{
                            height: `${20 + Math.random() * 20}px`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {audioBlob && !isRecording && (
                  <div>
                    <div className="w-24 h-24 rounded-full bg-green-500 text-white shadow-xl flex items-center justify-center mx-auto">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="mt-4 text-lg font-semibold text-gray-900">
                      Запись готова! ({formatTime(recordingTime)})
                    </p>
                    <button
                      onClick={() => {
                        setAudioBlob(null);
                        setRecordingTime(0);
                      }}
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      Записать заново
                    </button>
                  </div>
                )}

                {!isRecording && !audioBlob && (
                  <p className="mt-4 text-sm text-gray-500">
                    Нажмите на микрофон, чтобы начать запись
                  </p>
                )}
              </div>

              {/* Skip option */}
              <div className="text-center">
                <button
                  onClick={() => setStep(4)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Пропустить и использовать стандартный голос →
                </button>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="btn-secondary px-6 py-3 text-gray-700 font-medium inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                <span>Назад</span>
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn-glow px-8 py-4 text-white font-semibold text-lg inline-flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span>Генерируем...</span>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </>
                ) : (
                  <>
                    <span>Создать сказку</span>
                    <span className="text-xl">✨</span>
                  </>
                )}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-6 glass-card p-4 bg-red-50 border border-red-200">
                <p className="text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Generation progress */}
            {isGenerating && (
              <div className="mt-6 glass-card p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Создаём волшебство...</span>
                  <span className="text-sm font-medium text-gray-900">{Math.round(generationProgress)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-blue-600 transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <div className="mt-3 text-xs text-gray-500 text-center">
                  {generationProgress < 30 && (isCloning ? "🎙️ Клонируем ваш голос..." : "📝 Подготовка...")}
                  {generationProgress >= 30 && generationProgress < 70 && "📝 Пишем сказку..."}
                  {generationProgress >= 70 && generationProgress < 90 && "🎙️ Озвучиваем историю вашим голосом..."}
                  {generationProgress >= 90 && generationProgress < 95 && "🎵 Создаём фоновую музыку..."}
                  {generationProgress >= 95 && "✨ Финальные штрихи..."}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Result */}
        {step === 4 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🎉</div>
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
                Сказка готова!
              </h1>
              <p className="text-gray-600">
                Персональная история для {childInfo.name}
              </p>
            </div>

            <div className="glass-card-strong p-8">
              {/* Story card */}
              <div className="text-center mb-6">
                <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center shadow-lg mb-4">
                  <span className="text-6xl">
                    {CHARACTERS.find((c) => c.id === storySettings.character)?.icon || "📖"}
                  </span>
                </div>
                <h2 className="font-display text-xl font-bold text-gray-900">
                  {generatedStory?.title || `${childInfo.name} и ${CHARACTERS.find((c) => c.id === storySettings.character)?.label}`}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {generatedStory?.wordCount ? `${generatedStory.wordCount} слов` : ""} • {TOPICS.find((t) => t.id === storySettings.topic)?.label}
                </p>
              </div>

              {/* Story text */}
              <div className="glass-card p-6 mb-6 max-h-80 overflow-y-auto">
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {generatedStory?.text || "Сказка загружается..."}
                </p>
              </div>

              {/* Audio player */}
              <div className="glass-card p-6 mb-6">
                {audioBase64 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-500">🎙️ Озвучка вашим голосом</p>
                      {/* Music toggle */}
                      {backgroundMusicUrl && (
                        <button
                          onClick={toggleMusic}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            musicEnabled
                              ? "bg-sky-100 text-sky-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <span>🎵</span>
                          <span>{musicEnabled ? "Музыка вкл" : "Музыка выкл"}</span>
                        </button>
                      )}
                    </div>
                    <audio
                      ref={audioRef}
                      src={`data:audio/mpeg;base64,${audioBase64}`}
                      className="hidden"
                    />
                    {/* Background music audio element */}
                    {backgroundMusicUrl && (
                      <audio
                        ref={musicRef}
                        src={backgroundMusicUrl}
                        loop
                        preload="auto"
                        className="hidden"
                      />
                    )}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={playAudio}
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                      >
                        {isPlaying ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="h-2 bg-sky-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-sky-400 to-blue-600 transition-all"
                            style={{ width: audioDuration ? `${(audioProgress / audioDuration) * 100}%` : "0%" }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>{formatTime(Math.floor(audioProgress))}</span>
                          <span>{formatTime(Math.floor(audioDuration))}</span>
                        </div>
                      </div>
                    </div>
                    {isGeneratingMusic && (
                      <p className="text-xs text-gray-400 text-center mt-3">
                        🎵 Генерируем фоновую музыку...
                      </p>
                    )}
                  </>
                ) : isGeneratingAudio ? (
                  <div className="text-center py-4">
                    <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Генерируем озвучку...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 text-center mb-4">🎙️ Озвучка недоступна</p>
                    <p className="text-xs text-gray-400 text-center">
                      Запишите голос на шаге 3, чтобы получить озвучку вашим голосом
                    </p>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {audioBase64 ? (
                  <a
                    href={`data:audio/mpeg;base64,${audioBase64}`}
                    download={`${generatedStory?.title || "сказка"}.mp3`}
                    className="flex-1 btn-secondary py-3 font-medium text-gray-700 inline-flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Скачать MP3</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex-1 btn-secondary py-3 font-medium text-gray-400 inline-flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Скачать MP3</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    if (navigator.share && generatedStory) {
                      navigator.share({
                        title: generatedStory.title,
                        text: generatedStory.text.substring(0, 200) + "...",
                      });
                    }
                  }}
                  className="flex-1 btn-secondary py-3 font-medium text-gray-700 inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Поделиться</span>
                </button>
              </div>
            </div>

            {/* Create another */}
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setStep(1);
                  setAudioBlob(null);
                  setRecordingTime(0);
                }}
                className="btn-glow px-8 py-4 text-white font-semibold text-lg inline-flex items-center gap-2"
              >
                <span>Создать ещё одну сказку</span>
                <span className="text-xl">✨</span>
              </button>
              <p className="mt-4 text-sm text-gray-500">
                У вас осталось 2 бесплатных сказки
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Загрузка...</div>}>
      <CreatePageContent />
    </Suspense>
  );
}
