"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface Question {
  id: number;
  question_type: string;
  question_text: string;
  hint: string;
  order_num: number;
}

interface Story {
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

interface Week {
  id: number;
  title: string;
  order_num: number;
  month_id: number;
}

interface Month {
  id: number;
  title: string;
  order_num: number;
  block_id: number;
}

interface Block {
  id: number;
  title: string;
  icon: string;
  color: string;
}

export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const storyId = Number(params.id);

  const [story, setStory] = useState<Story | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [week, setWeek] = useState<Week | null>(null);
  const [month, setMonth] = useState<Month | null>(null);
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<"story" | "questions" | "complete">("story");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Story mode and audio state
  const [storyMode, setStoryMode] = useState<"read" | "ai-voice">("read");
  const [personalizedText, setPersonalizedText] = useState<string>("");
  const [aiAudioBase64, setAiAudioBase64] = useState<string | null>(null);

  // AI Audio player state
  const [isAiPlaying, setIsAiPlaying] = useState(false);
  const [aiAudioProgress, setAiAudioProgress] = useState(0);
  const [aiAudioDuration, setAiAudioDuration] = useState(0);
  const aiAudioRef = useRef<HTMLAudioElement | null>(null);

  // Background music player state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicProgress, setMusicProgress] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  // Subscription check
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  // Story unlock check
  const [isStoryUnlocked, setIsStoryUnlocked] = useState<boolean | null>(null);

  // Check subscription status and story unlock
  useEffect(() => {
    async function checkAccess() {
      if (!user?.email) return;

      const supabase = createClient();

      // Check subscription
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_until")
        .eq("email", user.email)
        .single();

      if (profile?.subscription_until) {
        const subEnd = new Date(profile.subscription_until);
        setHasSubscription(subEnd > new Date());
      } else {
        setHasSubscription(false);
      }

      // Check if story is unlocked
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return;

      // Get all user progress
      const { data: progressData } = await supabase
        .from("user_story_progress")
        .select("story_id, completed_at")
        .eq("user_id", currentUser.user.id);

      const completedStories = progressData?.map(p => p.story_id) || [];
      const completionTimes: Record<number, string> = {};
      progressData?.forEach(p => {
        completionTimes[p.story_id] = p.completed_at;
      });

      // If this story is already completed, it's accessible
      if (completedStories.includes(storyId)) {
        setIsStoryUnlocked(true);
        return;
      }

      // Load story and week info
      const { data: storyData } = await supabase
        .from("program_stories")
        .select("*, program_weeks!inner(order_num)")
        .eq("id", storyId)
        .single();

      if (!storyData) {
        setIsStoryUnlocked(false);
        return;
      }

      const weekOrderNum = storyData.program_weeks.order_num;

      // First story of first week is always available
      if (storyData.day_in_week === 1 && weekOrderNum === 1) {
        setIsStoryUnlocked(true);
        return;
      }

      // Get all stories in the same week
      const { data: weekStories } = await supabase
        .from("program_stories")
        .select("id, day_in_week, week_id")
        .eq("week_id", storyData.week_id)
        .order("day_in_week");

      // Find previous story
      let previousStoryId: number | null = null;

      if (storyData.day_in_week === 1) {
        // First story of a new week - need previous week's last story
        const { data: allWeeks } = await supabase
          .from("program_weeks")
          .select("id, order_num")
          .order("order_num");

        const currentWeekIndex = allWeeks?.findIndex(w => w.id === storyData.week_id) ?? -1;
        if (currentWeekIndex > 0) {
          const prevWeek = allWeeks![currentWeekIndex - 1];
          const { data: prevWeekStories } = await supabase
            .from("program_stories")
            .select("id")
            .eq("week_id", prevWeek.id)
            .order("day_in_week", { ascending: false })
            .limit(1);

          previousStoryId = prevWeekStories?.[0]?.id || null;
        }
      } else {
        // Find previous story in same week (day 1 -> day 3, day 3 -> day 5)
        const prevStory = weekStories?.find(s => s.day_in_week === storyData.day_in_week - 2);
        previousStoryId = prevStory?.id || null;
      }

      // If no previous story, it's available
      if (!previousStoryId) {
        setIsStoryUnlocked(true);
        return;
      }

      // Check if previous story is completed
      if (!completedStories.includes(previousStoryId)) {
        setIsStoryUnlocked(false);
        return;
      }

      // Check 24-hour timer
      const completionTime = completionTimes[previousStoryId];
      if (!completionTime) {
        setIsStoryUnlocked(true);
        return;
      }

      const timeSinceCompletion = new Date().getTime() - new Date(completionTime).getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      setIsStoryUnlocked(timeSinceCompletion >= twentyFourHours);
    }

    checkAccess();
  }, [user?.email, storyId]);

  useEffect(() => {
    loadStoryData();
    checkProgress();
    loadStoryModeData();
  }, [storyId]);

  // Load story mode and data from localStorage
  function loadStoryModeData() {
    const mode = localStorage.getItem("storyMode") as "read" | "ai-voice" | null;
    if (mode) {
      setStoryMode(mode);
    }

    const savedPersonalizedText = localStorage.getItem("storyPersonalizedText");
    if (savedPersonalizedText) {
      setPersonalizedText(savedPersonalizedText);
    }

    const savedAudio = localStorage.getItem("storyAudio");
    if (savedAudio) {
      setAiAudioBase64(savedAudio);
    }
  }

  // AI Audio player controls
  function toggleAiAudio() {
    if (!aiAudioRef.current) return;

    if (isAiPlaying) {
      aiAudioRef.current.pause();
      setIsAiPlaying(false);
    } else {
      aiAudioRef.current.play();
      setIsAiPlaying(true);
    }
  }

  // Background music controls
  function toggleMusic() {
    if (!musicRef.current) return;

    if (isMusicPlaying) {
      musicRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      musicRef.current.play();
      setIsMusicPlaying(true);
    }
  }

  // AI Audio progress tracking
  useEffect(() => {
    if (aiAudioRef.current) {
      const audio = aiAudioRef.current;

      audio.ontimeupdate = () => setAiAudioProgress(audio.currentTime);
      audio.onloadedmetadata = () => setAiAudioDuration(audio.duration);
      audio.onended = () => {
        setIsAiPlaying(false);
        setAiAudioProgress(0);
      };
    }
  }, [aiAudioBase64]);

  // Music progress tracking
  useEffect(() => {
    if (musicRef.current) {
      const audio = musicRef.current;

      audio.ontimeupdate = () => setMusicProgress(audio.currentTime);
      audio.onloadedmetadata = () => setMusicDuration(audio.duration);
      audio.onended = () => {
        // Loop music
        audio.currentTime = 0;
        audio.play();
      };
    }
  }, []);

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push("/");
      }
    };
    checkAuth();
  }, [router]);

  async function loadStoryData() {
    const supabase = createClient();

    // Load story
    const { data: storyData } = await supabase
      .from("program_stories")
      .select("*")
      .eq("id", storyId)
      .single();

    if (!storyData) {
      setLoading(false);
      return;
    }

    setStory(storyData);

    // Load questions
    const { data: questionsData } = await supabase
      .from("program_questions")
      .select("*")
      .eq("story_id", storyId)
      .order("order_num");

    setQuestions(questionsData || []);

    // Load week
    const { data: weekData } = await supabase
      .from("program_weeks")
      .select("*")
      .eq("id", storyData.week_id)
      .single();

    if (weekData) {
      setWeek(weekData);

      // Load month
      const { data: monthData } = await supabase
        .from("program_months")
        .select("*")
        .eq("id", weekData.month_id)
        .single();

      if (monthData) {
        setMonth(monthData);

        // Load block
        const { data: blockData } = await supabase
          .from("program_blocks")
          .select("*")
          .eq("id", monthData.block_id)
          .single();

        setBlock(blockData);
      }
    }

    setLoading(false);
  }

  async function checkProgress() {
    const supabase = createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (currentUser) {
      const { data } = await supabase
        .from("user_story_progress")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("story_id", storyId)
        .single();

      if (data) {
        setIsCompleted(true);
        setCurrentStep("complete");
      }
    }
  }

  async function markAsCompleted() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (currentUser) {
      try {
        await supabase
          .from("user_story_progress")
          .upsert({
            user_id: currentUser.id,
            story_id: storyId,
            questions_answered: answeredQuestions,
          });
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    }

    // Always mark as complete, even if not logged in
    setIsCompleted(true);
    setCurrentStep("complete");
    setSaving(false);
  }

  function handleQuestionAnswered() {
    setAnsweredQuestions([...answeredQuestions, questions[currentQuestionIndex].id]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      markAsCompleted();
    }
  }

  function getQuestionTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      understanding: "Understanding",
      feeling: "Feeling",
      practice: "Practice",
      rule: "Rule",
      ritual: "Ritual",
      situation: "Situation",
      conclusion: "Conclusion",
    };
    return labels[type] || type;
  }

  function getQuestionTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      understanding: "🧠",
      feeling: "💭",
      practice: "🎯",
      rule: "📜",
      ritual: "🔮",
      situation: "🎭",
      conclusion: "✨",
    };
    return icons[type] || "❓";
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Story not found</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Subscription required paywall
  if (hasSubscription === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <span className="font-display font-bold text-xl text-gray-800">FairyTaleAI</span>
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="glass-card-strong p-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl mx-auto mb-6">
                🔒
              </div>
              <h1 className="font-display text-2xl font-bold text-gray-900 mb-4">
                Subscription Required
              </h1>
              <p className="text-gray-600 mb-6">
                To access stories and the full program, you need an active subscription.
              </p>
              <Link
                href="/pricing"
                className="block w-full btn-glow py-3 text-center font-semibold text-white mb-3"
              >
                View Subscription Plans
              </Link>
              <Link
                href="/dashboard"
                className="block text-gray-500 hover:text-gray-700 text-sm"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Story locked - not yet unlocked based on progress
  if (isStoryUnlocked === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <span className="font-display font-bold text-xl text-gray-800">FairyTaleAI</span>
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="glass-card-strong p-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-4xl mx-auto mb-6">
                🔒
              </div>
              <h1 className="font-display text-2xl font-bold text-gray-900 mb-4">
                Story Locked
              </h1>
              <p className="text-gray-600 mb-6">
                This story is not yet available. Complete the previous stories to unlock it.
              </p>
              <Link
                href="/dashboard"
                className="block w-full btn-glow py-3 text-center font-semibold text-white"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <span className="font-display font-bold text-xl text-gray-800">FairyTaleAI</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          {block && month && week && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
              <span className={`px-2 py-1 rounded-full bg-gradient-to-r ${block.color} text-white text-xs`}>
                {block.icon} Block {Math.ceil(month.order_num / 3)}
              </span>
              <span>→</span>
              <span>Month {month.order_num}: {month.title}</span>
              <span>→</span>
              <span>Week {week.order_num}</span>
              <span>→</span>
              <span className="font-medium text-gray-700">Day {story.day_in_week}</span>
            </div>
          )}

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              currentStep === "story" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              <span>📖</span>
              <span className="text-sm font-medium">Story</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              currentStep === "questions" ? "bg-blue-500 text-white" :
              currentStep === "complete" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              <span>💬</span>
              <span className="text-sm font-medium">Questions</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              currentStep === "complete" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              <span>✓</span>
              <span className="text-sm font-medium">Done</span>
            </div>
          </div>

          {/* Story Step */}
          {currentStep === "story" && (
            <div className="glass-card-strong p-6 sm:p-8">
              {/* Story Header */}
              <div className="text-center mb-8">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${block?.color || "from-blue-400 to-blue-600"} flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg`}>
                  📖
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {story.title}
                </h1>
                <p className="text-gray-500 text-sm">
                  Day {story.day_in_week} of Week {week?.order_num}
                </p>
              </div>

              {/* Audio Player - AI Voice or Background Music */}
              {storyMode === "ai-voice" && aiAudioBase64 ? (
                <div className="glass-card p-4 mb-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🎙️</span>
                    <span className="text-sm font-medium text-purple-800">AI Narration</span>
                  </div>
                  <audio
                    ref={aiAudioRef}
                    src={`data:audio/mpeg;base64,${aiAudioBase64}`}
                    className="hidden"
                  />
                  <div className="flex items-center gap-4">
                    <button
                      onClick={toggleAiAudio}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                    >
                      {isAiPlaying ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                          style={{ width: aiAudioDuration ? `${(aiAudioProgress / aiAudioDuration) * 100}%` : "0%" }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-purple-600 mt-1">
                        <span>{formatTime(aiAudioProgress)}</span>
                        <span>{formatTime(aiAudioDuration)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-4 mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🎵</span>
                    <span className="text-sm font-medium text-green-800">Background Music</span>
                  </div>
                  <audio
                    ref={musicRef}
                    src="/audio/story-music.mp3"
                    className="hidden"
                    loop
                  />
                  <div className="flex items-center gap-4">
                    <button
                      onClick={toggleMusic}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                    >
                      {isMusicPlaying ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                          style={{ width: musicDuration ? `${(musicProgress / musicDuration) * 100}%` : "0%" }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-green-600 mt-1">
                        <span>{formatTime(musicProgress)}</span>
                        <span>{formatTime(musicDuration)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mt-2 text-center">
                    Play relaxing music while reading the story
                  </p>
                </div>
              )}

              {/* Story Content */}
              <div className="prose prose-lg max-w-none mb-6">
                {personalizedText ? (
                  <div className="bg-white/50 rounded-2xl p-6 text-gray-700 leading-relaxed whitespace-pre-line">
                    {personalizedText}
                  </div>
                ) : story.full_text ? (
                  <div className="bg-white/50 rounded-2xl p-6 text-gray-700 leading-relaxed whitespace-pre-line">
                    {story.full_text}
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                    <p className="text-amber-800 font-medium mb-3">Story Preview:</p>
                    <p className="text-gray-700 italic">{story.plot}</p>
                    <p className="text-amber-600 text-sm mt-4">
                      Full story text will be available soon!
                    </p>
                  </div>
                )}
              </div>

              {/* Therapeutic Info (collapsible) */}
              <details className="mb-8">
                <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700">
                  For Parents: Learning Goals
                </summary>
                <div className="mt-4 space-y-3 text-sm">
                  {story.therapeutic_goal && (
                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="font-medium text-purple-800 mb-1">Therapeutic Goal:</p>
                      <p className="text-purple-700">{story.therapeutic_goal}</p>
                    </div>
                  )}
                  {story.methodology && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="font-medium text-blue-800 mb-1">Methodology:</p>
                      <p className="text-blue-700">{story.methodology}</p>
                    </div>
                  )}
                  {story.why_important && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="font-medium text-green-800 mb-1">Why It Matters:</p>
                      <p className="text-green-700">{story.why_important}</p>
                    </div>
                  )}
                </div>
              </details>

              {/* Continue Button */}
              <button
                onClick={() => setCurrentStep("questions")}
                className="w-full btn-glow py-4 text-center font-semibold text-white text-lg"
              >
                Continue to Discussion Questions →
              </button>
            </div>
          )}

          {/* Questions Step */}
          {currentStep === "questions" && questions.length > 0 && (
            <div className="glass-card-strong p-6 sm:p-8">
              {/* Question Progress */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className="flex gap-1">
                  {questions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-full ${
                        idx < currentQuestionIndex
                          ? "bg-green-500"
                          : idx === currentQuestionIndex
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Current Question */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{getQuestionTypeIcon(questions[currentQuestionIndex].question_type)}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    questions[currentQuestionIndex].question_type === "understanding" ? "bg-purple-100 text-purple-700" :
                    questions[currentQuestionIndex].question_type === "feeling" ? "bg-pink-100 text-pink-700" :
                    "bg-green-100 text-green-700"
                  }`}>
                    {getQuestionTypeLabel(questions[currentQuestionIndex].question_type)}
                  </span>
                </div>

                <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  {questions[currentQuestionIndex].question_text}
                </h2>

                {questions[currentQuestionIndex].hint && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">Hint for parents:</span> {questions[currentQuestionIndex].hint}
                    </p>
                  </div>
                )}
              </div>

              {/* Discussion prompt */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6 text-center">
                <p className="text-blue-800">
                  Discuss this question with your child, then tap "We Discussed It" to continue.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (currentQuestionIndex > 0) {
                      setCurrentQuestionIndex(currentQuestionIndex - 1);
                    } else {
                      setCurrentStep("story");
                    }
                  }}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleQuestionAnswered}
                  disabled={saving}
                  className="flex-1 btn-glow py-3 text-center font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "We Discussed It ✓"}
                </button>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {currentStep === "complete" && (
            <div className="glass-card-strong p-6 sm:p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg">
                🎉
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Story Completed!
              </h2>
              <p className="text-gray-600 mb-8">
                Great job! You and your child have completed "{story.title}".
                The next story will be available soon.
              </p>

              {/* Completion Stats */}
              <div className="bg-green-50 rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{questions.length}</p>
                    <p className="text-sm text-green-700">Questions Discussed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">Day {story.day_in_week}</p>
                    <p className="text-sm text-green-700">Completed</p>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="inline-block btn-glow px-8 py-3 font-semibold text-white"
              >
                Back to Dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
