"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("storyPage");
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
  const [musicUrl, setMusicUrl] = useState<string | null>(null);

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
  // Child name for personalization
  const [childName, setChildName] = useState<string>("Hero");


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
    // Load localStorage data immediately (sync)
    loadStoryModeData();

    // Load async data in parallel
    Promise.all([loadStoryData(), checkProgress()]);
  }, [storyId, user?.id]);


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

    // Load generated music URL for read mode
    const savedMusicUrl = localStorage.getItem("storyMusicUrl");
    if (savedMusicUrl) {
      setMusicUrl(savedMusicUrl);
    }

    // Load child name for personalization (per-user)
    if (user?.id) {
      const savedChildInfo = localStorage.getItem(`childInfo_${user.id}`);
      if (savedChildInfo) {
        try {
          const parsed = JSON.parse(savedChildInfo);
          if (parsed.name) {
            setChildName(parsed.name);
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    }
  }

  // AI Audio player controls (also controls background music)
  function toggleAiAudio() {
    if (!aiAudioRef.current) return;

    if (isAiPlaying) {
      aiAudioRef.current.pause();
      // Also pause background music
      if (musicRef.current) {
        musicRef.current.pause();
      }
      setIsAiPlaying(false);
    } else {
      aiAudioRef.current.play();
      // Also play background music at lower volume
      if (musicRef.current && musicUrl) {
        musicRef.current.volume = 0.10; // 10% volume for background
        musicRef.current.play();
      }
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
        // Also stop background music when voice ends
        if (musicRef.current) {
          musicRef.current.pause();
          musicRef.current.currentTime = 0;
        }
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

    // Load story with all related data in one query using joins
    const { data: storyData } = await supabase
      .from("program_stories")
      .select(`
        *,
        program_weeks!inner (
          *,
          program_months!inner (
            *,
            program_blocks!inner (*)
          )
        )
      `)
      .eq("id", storyId)
      .single();

    if (!storyData) {
      setLoading(false);
      return;
    }

    // Extract nested data
    const weekData = storyData.program_weeks;
    const monthData = weekData?.program_months;
    const blockData = monthData?.program_blocks;

    // Set all state
    setStory(storyData);
    if (weekData) setWeek(weekData);
    if (monthData) setMonth(monthData);
    if (blockData) setBlock(blockData);

    // Load questions in parallel (can't join with story)
    const { data: questionsData } = await supabase
      .from("program_questions")
      .select("*")
      .eq("story_id", storyId)
      .order("order_num");

    setQuestions(questionsData || []);
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
      understanding: t("understanding"),
      feeling: t("feeling"),
      practice: t("practice"),
      rule: t("rule"),
      ritual: t("ritual"),
      situation: t("situation"),
      conclusion: t("conclusion"),
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
          <p className="text-gray-600 mb-4">{t("storyNotFound")}</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            {t("backToDashboard")}
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
                <img src="/images/icons/magic-wand.png" alt="" className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl text-gray-800">FairyTaleAI</span>
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              {t("backToDashboard")}
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="glass-card-strong p-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
                <img src="/images/icons/crown.png" alt="" className="w-12 h-12" />
              </div>
              <h1 className="font-display text-2xl font-bold text-gray-900 mb-4">
                {t("subscriptionRequired")}
              </h1>
              <p className="text-gray-600 mb-6">
                {t("subscriptionRequiredText")}
              </p>
              <Link
                href="/#pricing"
                className="block w-full btn-glow py-3 text-center font-semibold text-white mb-3"
              >
                {t("viewSubscriptionPlans")}
              </Link>
              <Link
                href="/dashboard"
                className="block text-gray-500 hover:text-gray-700 text-sm"
              >
                {t("backToDashboard")}
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
                <img src="/images/icons/magic-wand.png" alt="" className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl text-gray-800">FairyTaleAI</span>
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              {t("backToDashboard")}
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="glass-card-strong p-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-6">
                <img src="/images/icons/crown.png" alt="" className="w-12 h-12 opacity-50" />
              </div>
              <h1 className="font-display text-2xl font-bold text-gray-900 mb-4">
                {t("storyLocked")}
              </h1>
              <p className="text-gray-600 mb-6">
                {t("storyLockedText")}
              </p>
              <Link
                href="/dashboard"
                className="block w-full btn-glow py-3 text-center font-semibold text-white"
              >
                {t("backToDashboard")}
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
      <header className="container mx-auto px-4 py-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
              <img src="/images/icons/magic-wand.png" alt="" className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl text-gray-800">FairyTaleAI</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            {t("backToDashboard")}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* Breadcrumb */}
          {block && month && week && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
              <span className={`px-2 py-1 rounded-full bg-gradient-to-r ${block.color} text-white text-xs`}>
                {block.icon} {t("block")} {Math.ceil(month.order_num / 3)}
              </span>
              <span>→</span>
              <span>{t("month")} {month.order_num}: {month.title}</span>
              <span>→</span>
              <span>{t("week")} {week.order_num}</span>
              <span>→</span>
              <span className="font-medium text-gray-700">{t("day")} {story.day_in_week}</span>
            </div>
          )}

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              currentStep === "story" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              <img src="/images/icons/book.png" alt="" className="w-4 h-4" />
              <span className="text-sm font-medium">{t("story")}</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              currentStep === "questions" ? "bg-blue-500 text-white" :
              currentStep === "complete" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              <img src="/images/icons/brain.png" alt="" className="w-4 h-4" />
              <span className="text-sm font-medium">{t("questions")}</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              currentStep === "complete" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              <span>✓</span>
              <span className="text-sm font-medium">{t("done")}</span>
            </div>
          </div>

          {/* Story Step */}
          {currentStep === "story" && (
            <div className="glass-card-strong p-6 sm:p-8">
              {/* Story Header */}
              <div className="text-center mb-8">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${block?.color || "from-blue-400 to-blue-600"} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <img src="/images/icons/book.png" alt="" className="w-12 h-12" />
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {story.title}
                </h1>
                <p className="text-gray-500 text-sm">
                  {t("day")} {story.day_in_week} {t("of")} {t("week")} {week?.order_num}
                </p>
              </div>

              {/* Audio Player - AI Voice with hidden background music, or just Background Music */}
              {storyMode === "ai-voice" && aiAudioBase64 ? (
                <div className="glass-card p-4 mb-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <img src="/images/icons/microphone.png" alt="" className="w-5 h-5" />
                    <span className="text-sm font-medium text-purple-800">{t("aiNarration")}</span>
                    {musicUrl && (
                      <span className="text-xs text-purple-500 ml-auto">{t("plusBackgroundMusic")}</span>
                    )}
                  </div>
                  {/* AI Voice audio */}
                  <audio
                    ref={aiAudioRef}
                    src={`data:audio/mpeg;base64,${aiAudioBase64}`}
                    className="hidden"
                  />
                  {/* Hidden background music that plays with voice */}
                  {musicUrl && (
                    <audio
                      ref={musicRef}
                      src={musicUrl}
                      className="hidden"
                      loop
                    />
                  )}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={toggleAiAudio}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform flex-shrink-0"
                    >
                      {isAiPlaying ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      {/* Equalizer bars when playing */}
                      {isAiPlaying ? (
                        <div className="flex items-end justify-center gap-1 h-8 mb-2">
                          {[...Array(20)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full"
                              style={{
                                height: `${Math.random() * 100}%`,
                                animation: `equalizer 0.${3 + (i % 5)}s ease-in-out infinite alternate`,
                                animationDelay: `${i * 0.05}s`
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-end justify-center gap-1 h-8 mb-2">
                          {[...Array(20)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 bg-purple-200 rounded-full"
                              style={{ height: `${20 + (i % 3) * 15}%` }}
                            />
                          ))}
                        </div>
                      )}
                      {/* Progress bar */}
                      <div
                        className="h-1.5 bg-purple-100 rounded-full overflow-hidden cursor-pointer"
                        onClick={(e) => {
                          if (aiAudioRef.current && aiAudioDuration) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const percent = x / rect.width;
                            aiAudioRef.current.currentTime = percent * aiAudioDuration;
                          }
                        }}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
                          style={{ width: aiAudioDuration ? `${(aiAudioProgress / aiAudioDuration) * 100}%` : "0%" }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-purple-600 mt-1">
                        <span>{formatTime(aiAudioProgress)}</span>
                        <span>{formatTime(aiAudioDuration)}</span>
                      </div>
                    </div>
                  </div>
                  <style jsx>{`
                    @keyframes equalizer {
                      0% { height: 20%; }
                      100% { height: 100%; }
                    }
                  `}</style>
                </div>
              ) : (
                <div className="glass-card p-4 mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <img src="/images/icons/moon.png" alt="" className="w-5 h-5" />
                    <span className="text-sm font-medium text-green-800">
                      {musicUrl ? t("generatedBackgroundMusic") : t("backgroundMusic")}
                    </span>
                  </div>
                  <audio
                    ref={musicRef}
                    src={musicUrl || "/audio/story-music.mp3"}
                    className="hidden"
                    loop
                  />
                  <div className="flex items-center gap-4">
                    <button
                      onClick={toggleMusic}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform flex-shrink-0"
                    >
                      {isMusicPlaying ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      {/* Equalizer bars */}
                      {isMusicPlaying ? (
                        <div className="flex items-end justify-center gap-1 h-8 mb-2">
                          {[...Array(20)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 bg-gradient-to-t from-green-500 to-emerald-400 rounded-full"
                              style={{
                                height: `${Math.random() * 100}%`,
                                animation: `equalizer-green 0.${3 + (i % 5)}s ease-in-out infinite alternate`,
                                animationDelay: `${i * 0.05}s`
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-end justify-center gap-1 h-8 mb-2">
                          {[...Array(20)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 bg-green-200 rounded-full"
                              style={{ height: `${20 + (i % 3) * 15}%` }}
                            />
                          ))}
                        </div>
                      )}
                      {/* Progress bar */}
                      <div
                        className="h-1.5 bg-green-100 rounded-full overflow-hidden cursor-pointer"
                        onClick={(e) => {
                          if (musicRef.current && musicDuration) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const percent = x / rect.width;
                            musicRef.current.currentTime = percent * musicDuration;
                          }
                        }}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-100"
                          style={{ width: musicDuration ? `${(musicProgress / musicDuration) * 100}%` : "0%" }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-green-600 mt-1">
                        <span>{formatTime(musicProgress)}</span>
                        <span>{formatTime(musicDuration)}</span>
                      </div>
                    </div>
                  </div>
                  <style jsx>{`
                    @keyframes equalizer-green {
                      0% { height: 20%; }
                      100% { height: 100%; }
                    }
                  `}</style>
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
                    {story.full_text.replace(/\{childName\}/g, childName)}
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                    <p className="text-amber-800 font-medium mb-3">{t("storyPreview")}</p>
                    <p className="text-gray-700 italic">{story.plot}</p>
                    <p className="text-amber-600 text-sm mt-4">
                      {t("fullTextSoon")}
                    </p>
                  </div>
                )}
              </div>

              {/* Therapeutic Info (collapsible) */}
              <details className="mb-8">
                <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700">
                  {t("forParentsGoals")}
                </summary>
                <div className="mt-4 space-y-3 text-sm">
                  {story.therapeutic_goal && (
                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="font-medium text-purple-800 mb-1">{t("therapeuticGoal")}</p>
                      <p className="text-purple-700">{story.therapeutic_goal}</p>
                    </div>
                  )}
                  {story.methodology && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="font-medium text-blue-800 mb-1">{t("methodology")}</p>
                      <p className="text-blue-700">{story.methodology}</p>
                    </div>
                  )}
                  {story.why_important && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="font-medium text-green-800 mb-1">{t("whyMatters")}</p>
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
                {t("continueToQuestions")}
              </button>
            </div>
          )}

          {/* Questions Step */}
          {currentStep === "questions" && questions.length > 0 && (
            <div className="glass-card-strong p-6 sm:p-8">
              {/* Question Progress */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-gray-500">
                  {t("question")} {currentQuestionIndex + 1} {t("of")} {questions.length}
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
                      <span className="font-medium">{t("hintForParents")}</span> {questions[currentQuestionIndex].hint}
                    </p>
                  </div>
                )}
              </div>

              {/* Discussion prompt */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6 text-center">
                <p className="text-blue-800">
                  {t("discussPrompt")}
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
                  {t("back")}
                </button>
                <button
                  onClick={handleQuestionAnswered}
                  disabled={saving}
                  className="flex-1 btn-glow py-3 text-center font-semibold text-white disabled:opacity-50"
                >
                  {saving ? t("saving") : t("weDiscussedIt")}
                </button>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {currentStep === "complete" && (
            <div className="glass-card-strong p-6 sm:p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <img src="/images/icons/trophy.png" alt="" className="w-14 h-14" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                {t("storyCompleted")}
              </h2>
              <p className="text-gray-600 mb-8">
                {t("completedText")}
              </p>

              {/* Completion Stats */}
              <div className="bg-green-50 rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{questions.length}</p>
                    <p className="text-sm text-green-700">{t("questionsDiscussed")}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{t("day")} {story.day_in_week}</p>
                    <p className="text-sm text-green-700">{t("completed")}</p>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="inline-block btn-glow px-8 py-3 font-semibold text-white"
              >
                {t("backToDashboard")}
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
