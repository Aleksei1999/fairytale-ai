"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";

type Step = 1 | 2;

interface ChildInfo {
  name: string;
  age: string;
  gender: "boy" | "girl" | "";
  interests: string;
}

interface ProgramStory {
  id: number;
  title: string;
  plot: string;
  full_text: string | null;
  therapeutic_goal: string;
  methodology: string;
  why_important: string;
  day_in_week: number;
  week_id: number;
}

function CreatePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [programStory, setProgramStory] = useState<ProgramStory | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);
  const [personalizedText, setPersonalizedText] = useState<string>("");

  // Audio state
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const storyId = searchParams.get("storyId");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Load story from database
  useEffect(() => {
    async function loadStory() {
      if (!storyId) return;

      setLoadingStory(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("program_stories")
        .select("*")
        .eq("id", parseInt(storyId))
        .single();

      if (data && !error) {
        setProgramStory(data);
      }
      setLoadingStory(false);
    }

    loadStory();
  }, [storyId]);

  // Load saved child info from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("childInfo");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setChildInfo(parsed);
      } catch (e) {
        console.error("Error parsing saved child info:", e);
      }
    }
  }, []);

  const [childInfo, setChildInfo] = useState<ChildInfo>({
    name: "",
    age: "",
    gender: "",
    interests: "",
  });

  const canProceedStep1 = childInfo.name && childInfo.age && childInfo.gender;

  // Save child info and go to step 2
  const handleContinue = () => {
    localStorage.setItem("childInfo", JSON.stringify(childInfo));

    // Personalize the story text with child's name
    if (programStory?.full_text) {
      const personalized = programStory.full_text
        .replace(/\{child_name\}/g, childInfo.name)
        .replace(/\{he_she\}/g, childInfo.gender === "boy" ? "he" : "she")
        .replace(/\{his_her\}/g, childInfo.gender === "boy" ? "his" : "her")
        .replace(/\{him_her\}/g, childInfo.gender === "boy" ? "him" : "her");
      setPersonalizedText(personalized);
    } else if (programStory?.plot) {
      // If no full_text, use plot as fallback
      const personalized = programStory.plot
        .replace(/\{child_name\}/g, childInfo.name)
        .replace(/\{he_she\}/g, childInfo.gender === "boy" ? "he" : "she")
        .replace(/\{his_her\}/g, childInfo.gender === "boy" ? "his" : "her")
        .replace(/\{him_her\}/g, childInfo.gender === "boy" ? "him" : "her");
      setPersonalizedText(personalized);
    }

    setStep(2);
  };

  // Generate AI narration
  const generateNarration = async () => {
    if (!personalizedText) return;

    setIsGeneratingAudio(true);
    try {
      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: personalizedText,
          voiceId: "default" // Use default voice
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAudioBase64(data.audio.base64);
      } else {
        alert("Could not generate narration. Please try again.");
      }
    } catch (err) {
      console.error("Audio generation error:", err);
      alert("Connection error. Please try again.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Play/pause audio
  const playAudio = () => {
    if (!audioBase64 || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Audio progress tracking
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Show loading while checking auth
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // No story ID provided
  if (!storyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No story selected</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

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
            <span className="font-display text-xl font-bold text-gray-800">FairyTaleAI</span>
          </Link>

          {/* Progress indicator */}
          <div className="hidden sm:flex items-center gap-2">
            {[1, 2].map((s) => (
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
                {s < 2 && (
                  <div className={`w-8 h-1 mx-1 rounded ${s < step ? "bg-green-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-500">
            Step {step} of 2
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
                Tell Us About Your Child
              </h1>
              <p className="text-gray-600">
                This information will help personalize the story
              </p>
            </div>

            {/* Story Preview */}
            {loadingStory ? (
              <div className="glass-card p-6 mb-6 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : programStory && (
              <div className="glass-card p-6 mb-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📖</span>
                  <h3 className="font-bold text-gray-900">{programStory.title}</h3>
                </div>
                <p className="text-sm text-gray-600 italic">{programStory.plot}</p>
              </div>
            )}

            <div className="glass-card-strong p-8 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What is your child&apos;s name? *
                </label>
                <input
                  type="text"
                  value={childInfo.name}
                  onChange={(e) => setChildInfo({ ...childInfo, name: e.target.value })}
                  placeholder="Name"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-sky-200 focus:border-sky-400 focus:outline-none bg-white/80"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How old? *
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
                  Child&apos;s gender *
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
                    <span>Boy</span>
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
                    <span>Girl</span>
                  </button>
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests and hobbies (optional)
                </label>
                <textarea
                  value={childInfo.interests}
                  onChange={(e) => setChildInfo({ ...childInfo, interests: e.target.value })}
                  placeholder="For example: loves dinosaurs, plays soccer, watches Paw Patrol..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-sky-200 focus:border-sky-400 focus:outline-none bg-white/80 resize-none"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <Link
                href="/dashboard"
                className="btn-secondary px-6 py-3 text-gray-700 font-medium inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                <span>Back</span>
              </Link>
              <button
                onClick={handleContinue}
                disabled={!canProceedStep1}
                className={`btn-glow px-8 py-4 text-white font-semibold text-lg inline-flex items-center gap-2 ${
                  !canProceedStep1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span>Continue to Story</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Story Display */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">📖</div>
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
                {programStory?.title || "Your Story"}
              </h1>
              <p className="text-gray-600">
                A personalized story for {childInfo.name}
              </p>
            </div>

            <div className="glass-card-strong p-8">
              {/* Story Text */}
              <div className="glass-card p-6 mb-6 max-h-[60vh] overflow-y-auto">
                {personalizedText ? (
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line text-lg">
                    {personalizedText}
                  </p>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-amber-600 mb-2">Full story text is not available yet.</p>
                    <p className="text-gray-500 text-sm">
                      Story preview: {programStory?.plot}
                    </p>
                  </div>
                )}
              </div>

              {/* Parent Info Section */}
              {programStory && (
                <details className="mb-6">
                  <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700">
                    For Parents: Learning Goals
                  </summary>
                  <div className="mt-4 space-y-3 text-sm">
                    {programStory.therapeutic_goal && (
                      <div className="bg-purple-50 rounded-xl p-4">
                        <p className="font-medium text-purple-800 mb-1">Therapeutic Goal:</p>
                        <p className="text-purple-700">{programStory.therapeutic_goal}</p>
                      </div>
                    )}
                    {programStory.methodology && (
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="font-medium text-blue-800 mb-1">Methodology:</p>
                        <p className="text-blue-700">{programStory.methodology}</p>
                      </div>
                    )}
                    {programStory.why_important && (
                      <div className="bg-green-50 rounded-xl p-4">
                        <p className="font-medium text-green-800 mb-1">Why It Matters:</p>
                        <p className="text-green-700">{programStory.why_important}</p>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Audio Player (if generated) */}
              {audioBase64 && (
                <div className="glass-card p-6 mb-6">
                  <p className="text-sm text-gray-500 mb-4">🎙️ AI Narration</p>
                  <audio
                    ref={audioRef}
                    src={`data:audio/mpeg;base64,${audioBase64}`}
                    className="hidden"
                  />
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
                        <span>{formatTime(audioProgress)}</span>
                        <span>{formatTime(audioDuration)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {/* Read Myself Button */}
                <Link
                  href={`/story/${storyId}`}
                  className="flex-1 py-4 rounded-2xl font-semibold text-center transition-all bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg hover:opacity-90 inline-flex items-center justify-center gap-2"
                >
                  <span className="text-xl">📖</span>
                  <span>Read It Myself</span>
                </Link>

                {/* Generate AI Narration Button */}
                <button
                  onClick={generateNarration}
                  disabled={isGeneratingAudio || !personalizedText}
                  className={`flex-1 py-4 rounded-2xl font-semibold text-center transition-all inline-flex items-center justify-center gap-2 ${
                    isGeneratingAudio || !personalizedText
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg hover:opacity-90"
                  }`}
                >
                  {isGeneratingAudio ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🎙️</span>
                      <span>Listen with AI Voice</span>
                    </>
                  )}
                </button>
              </div>

              {/* Download button if audio exists */}
              {audioBase64 && (
                <div className="mt-4">
                  <a
                    href={`data:audio/mpeg;base64,${audioBase64}`}
                    download={`${programStory?.title || "story"}.mp3`}
                    className="w-full btn-secondary py-3 font-medium text-gray-700 inline-flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download Audio</span>
                  </a>
                </div>
              )}
            </div>

            {/* Back button */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary px-6 py-3 text-gray-700 font-medium inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                <span>Back</span>
              </button>
              <Link
                href="/dashboard"
                className="btn-secondary px-6 py-3 text-gray-700 font-medium inline-flex items-center gap-2"
              >
                <span>Back to Dashboard</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CreatePageContent />
    </Suspense>
  );
}
