"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Story {
  id: number;
  title: string;
  plot: string;
  day_in_week: number;
  order_num: number;
}

interface Week {
  id: number;
  title: string;
  task: string;
  order_num: number;
  stories: Story[];
}

interface Month {
  id: number;
  title: string;
  metaphor: string;
  story_arc: string;
  order_num: number;
  weeks: Week[];
}

interface Block {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  goal: string;
  order_num: number;
  months: Month[];
}

export function DevelopmentMap() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Month | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedStories, setCompletedStories] = useState<number[]>([]);
  const [storyCompletionTimes, setStoryCompletionTimes] = useState<Record<number, string>>({});
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadProgramData();
    loadUserProgress();

    // Update current time every minute for timer display
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  async function loadProgramData() {
    const supabase = createClient();

    // Load blocks
    const { data: blocksData } = await supabase
      .from("program_blocks")
      .select("*")
      .order("order_num");

    // Load months
    const { data: monthsData } = await supabase
      .from("program_months")
      .select("*")
      .order("order_num");

    // Load weeks
    const { data: weeksData } = await supabase
      .from("program_weeks")
      .select("*")
      .order("order_num");

    // Load stories
    const { data: storiesData } = await supabase
      .from("program_stories")
      .select("*")
      .order("order_num");

    if (blocksData && monthsData && weeksData && storiesData) {
      // Build nested structure
      const structuredBlocks: Block[] = blocksData.map((block) => ({
        ...block,
        months: monthsData
          .filter((m) => m.block_id === block.id)
          .map((month) => ({
            ...month,
            weeks: weeksData
              .filter((w) => w.month_id === month.id)
              .map((week) => ({
                ...week,
                stories: storiesData.filter((s) => s.week_id === week.id),
              })),
          })),
      }));

      setBlocks(structuredBlocks);
      if (structuredBlocks.length > 0) {
        setSelectedBlock(structuredBlocks[0]);
        if (structuredBlocks[0].months.length > 0) {
          setSelectedMonth(structuredBlocks[0].months[0]);
          if (structuredBlocks[0].months[0].weeks.length > 0) {
            setSelectedWeek(structuredBlocks[0].months[0].weeks[0]);
          }
        }
      }
    }
    setLoading(false);
  }

  async function loadUserProgress() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("user_story_progress")
        .select("story_id, completed_at")
        .eq("user_id", user.id);

      if (data) {
        setCompletedStories(data.map((d) => d.story_id));
        // Store completion times for timer calculation
        const times: Record<number, string> = {};
        data.forEach((d) => {
          times[d.story_id] = d.completed_at;
        });
        setStoryCompletionTimes(times);
      }
    }
  }

  function getTimeUntilUnlock(story: Story, weekStories: Story[]): { available: boolean; hoursLeft: number; minutesLeft: number } {
    // First story of week 1 is always available
    if (story.day_in_week === 1 && story.order_num === 1) {
      return { available: true, hoursLeft: 0, minutesLeft: 0 };
    }

    // Find previous story (day 1 -> day 3 -> day 5, or last story of previous week)
    let previousStory: Story | undefined;
    if (story.day_in_week === 1) {
      // First story of a new week - need previous week's last story
      // For simplicity, check if any story was completed in last 24h
      const allCompletedTimes = Object.values(storyCompletionTimes);
      if (allCompletedTimes.length === 0) {
        return { available: true, hoursLeft: 0, minutesLeft: 0 };
      }
      const lastCompletedTime = allCompletedTimes.reduce((latest, time) =>
        new Date(time) > new Date(latest) ? time : latest
      );
      const timeSinceCompletion = currentTime.getTime() - new Date(lastCompletedTime).getTime();
      const hoursLeft = Math.max(0, 24 - Math.floor(timeSinceCompletion / (1000 * 60 * 60)));
      const minutesLeft = Math.max(0, 60 - Math.floor((timeSinceCompletion % (1000 * 60 * 60)) / (1000 * 60)));

      if (timeSinceCompletion >= 24 * 60 * 60 * 1000) {
        return { available: true, hoursLeft: 0, minutesLeft: 0 };
      }
      return { available: false, hoursLeft, minutesLeft: minutesLeft % 60 };
    } else {
      // Day 3 or Day 5 - find previous story in same week
      previousStory = weekStories.find(
        (s) => s.day_in_week === story.day_in_week - 2
      );
    }

    if (!previousStory) {
      return { available: true, hoursLeft: 0, minutesLeft: 0 };
    }

    // Check if previous story is completed
    if (!completedStories.includes(previousStory.id)) {
      return { available: false, hoursLeft: -1, minutesLeft: 0 }; // -1 means locked (not timer)
    }

    // Check 24-hour timer
    const completionTime = storyCompletionTimes[previousStory.id];
    if (!completionTime) {
      return { available: true, hoursLeft: 0, minutesLeft: 0 };
    }

    const timeSinceCompletion = currentTime.getTime() - new Date(completionTime).getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (timeSinceCompletion >= twentyFourHours) {
      return { available: true, hoursLeft: 0, minutesLeft: 0 };
    }

    const timeLeft = twentyFourHours - timeSinceCompletion;
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return { available: false, hoursLeft, minutesLeft };
  }

  function getWeekProgress(week: Week): number {
    const completed = week.stories.filter((s) => completedStories.includes(s.id)).length;
    return Math.round((completed / week.stories.length) * 100);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!selectedBlock || !selectedMonth || !selectedWeek) {
    return (
      <div className="text-center py-12 text-gray-500">
        Program data not available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="mb-4">
          <h2 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>🗺️</span> The Hero&apos;s Grand Journey
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            12 months, 48 weeks, 144 stories. 3 stories per week (every other day).
          </p>
        </div>

        {/* Block Pills */}
        <div className="flex flex-wrap gap-2">
          {blocks.map((block) => (
            <button
              key={block.id}
              onClick={() => {
                setSelectedBlock(block);
                setSelectedMonth(block.months[0]);
                setSelectedWeek(block.months[0]?.weeks[0] || null);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedBlock.id === block.id
                  ? `bg-gradient-to-r ${block.color} text-white shadow-lg`
                  : "bg-white/50 text-gray-700 hover:bg-white"
              }`}
            >
              <span className="mr-1">{block.icon}</span>
              Block {block.order_num}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Block Details */}
      <div className="glass-card-strong p-6">
        {/* Block Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedBlock.color} flex items-center justify-center text-3xl shadow-lg`}>
            {selectedBlock.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${selectedBlock.color} text-white`}>
                Months {selectedBlock.months[0]?.order_num}-{selectedBlock.months[selectedBlock.months.length - 1]?.order_num}
              </span>
            </div>
            <h3 className="font-display text-2xl font-bold text-gray-900">
              {selectedBlock.title}
            </h3>
            <p className="text-gray-600">{selectedBlock.subtitle}</p>
            <p className="text-sm text-gray-500 mt-2 italic">
              {selectedBlock.goal}
            </p>
          </div>
        </div>

        {/* Month Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {selectedBlock.months.map((month) => (
            <button
              key={month.id}
              onClick={() => {
                setSelectedMonth(month);
                setSelectedWeek(month.weeks[0] || null);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedMonth.id === month.id
                  ? "bg-gray-900 text-white shadow-lg"
                  : "bg-white/70 text-gray-700 hover:bg-white"
              }`}
            >
              Month {month.order_num}
            </button>
          ))}
        </div>

        {/* Selected Month Info */}
        <div className="bg-white/50 rounded-2xl p-5 mb-4">
          <h4 className="font-bold text-lg text-gray-900 mb-2">
            {selectedMonth.title}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium text-gray-800">Metaphor:</span> {selectedMonth.metaphor}
          </p>
          <p className="text-sm text-gray-600 italic">
            {selectedMonth.story_arc}
          </p>

          {/* Progress Bar */}
          {(() => {
            const totalStories = selectedMonth.weeks.reduce((acc, w) => acc + w.stories.length, 0);
            const completedCount = selectedMonth.weeks.reduce(
              (acc, w) => acc + w.stories.filter((s) => completedStories.includes(s.id)).length,
              0
            );
            const progressPercent = totalStories > 0 ? Math.round((completedCount / totalStories) * 100) : 0;

            return (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-600">{completedCount} of {totalStories} stories</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${selectedBlock.color} transition-all duration-500`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })()}
        </div>

        {/* Week Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {selectedMonth.weeks.map((week) => {
            const progress = getWeekProgress(week);
            return (
              <button
                key={week.id}
                onClick={() => setSelectedWeek(week)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${
                  selectedWeek?.id === week.id
                    ? `bg-gradient-to-r ${selectedBlock.color} text-white shadow-lg`
                    : "bg-white/70 text-gray-700 hover:bg-white"
                }`}
              >
                Week {week.order_num}
                {progress > 0 && progress < 100 && (
                  <span className="ml-2 text-xs opacity-75">{progress}%</span>
                )}
                {progress === 100 && (
                  <span className="ml-1">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Week Content */}
        <div className="bg-white/30 rounded-2xl p-5 mb-6">
          <h4 className="font-bold text-lg text-gray-900 mb-1">
            Week {selectedWeek.order_num}: {selectedWeek.title}
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            {selectedWeek.task}
          </p>

          {/* Stories Grid */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span>📚</span> This Week&apos;s Stories (every other day):
            </p>
            {selectedWeek.stories.map((story) => {
              const timeInfo = getTimeUntilUnlock(story, selectedWeek.stories);
              const isAvailable = timeInfo.available;
              const isCompleted = completedStories.includes(story.id);
              const hasTimer = !isAvailable && timeInfo.hoursLeft >= 0;

              return (
                <div
                  key={story.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isCompleted
                      ? "bg-green-50 border-green-300"
                      : isAvailable
                      ? "bg-white border-green-200 hover:border-green-300"
                      : hasTimer
                      ? "bg-amber-50 border-amber-200"
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Day Badge */}
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs ${
                      isCompleted
                        ? "bg-green-500 text-white shadow-md"
                        : isAvailable
                        ? `bg-gradient-to-br ${selectedBlock.color} text-white shadow-md`
                        : hasTimer
                        ? "bg-amber-400 text-white shadow-md"
                        : "bg-gray-200 text-gray-500"
                    }`}>
                      {isCompleted ? (
                        <span className="text-xl">✓</span>
                      ) : hasTimer ? (
                        <span className="text-lg">⏳</span>
                      ) : (
                        <>
                          <span>Day</span>
                          <span className="text-lg">{story.day_in_week}</span>
                        </>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isAvailable || isCompleted ? "text-gray-900" : hasTimer ? "text-amber-800" : "text-gray-500"}`}>
                        {story.title}
                      </h5>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {story.plot}
                      </p>
                    </div>

                    {/* Action */}
                    {isCompleted ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <span>✓</span>
                        <span>Done</span>
                      </div>
                    ) : isAvailable ? (
                      <Link
                        href={`/create?storyId=${story.id}`}
                        className={`px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${selectedBlock.color} text-white hover:opacity-90 shadow-md transition-all`}
                      >
                        Create Story
                      </Link>
                    ) : hasTimer ? (
                      <div className="flex flex-col items-center text-amber-600 text-sm font-medium">
                        <span className="text-xs text-amber-500">Available in</span>
                        <span className="font-bold">{timeInfo.hoursLeft}h {timeInfo.minutesLeft}m</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <span>🔒</span>
                        <span>Locked</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Cartoon Reward */}
        {(() => {
          const weekProgress = getWeekProgress(selectedWeek);
          const isUnlocked = weekProgress === 100;

          return (
            <div className={`p-4 rounded-2xl border-2 ${
              isUnlocked
                ? "bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 border-purple-300"
                : "bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-purple-200"
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0 ${
                  isUnlocked
                    ? "bg-gradient-to-br from-purple-500 to-pink-500"
                    : "bg-gray-300"
                }`}>
                  🎬
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold ${isUnlocked ? "text-purple-900" : "text-gray-600"}`}>
                    Weekly Cartoon Reward!
                  </h4>
                  <p className={`text-sm ${isUnlocked ? "text-purple-600" : "text-gray-500"}`}>
                    {isUnlocked
                      ? "Congratulations! Your personalized cartoon is ready!"
                      : `Complete all 3 stories to unlock (${weekProgress}% done)`
                    }
                  </p>
                </div>
                <button
                  disabled={!isUnlocked}
                  className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    isUnlocked
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isUnlocked ? "🎬 Watch Cartoon" : "🔒 Complete Week"}
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Program Overview */}
      <div className="glass-card p-6">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📋</span> Program Overview
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          {blocks.map((block) => (
            <div
              key={block.id}
              onClick={() => {
                setSelectedBlock(block);
                setSelectedMonth(block.months[0]);
                setSelectedWeek(block.months[0]?.weeks[0] || null);
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                selectedBlock.id === block.id ? "border-gray-300 bg-white" : "border-gray-100 bg-white/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{block.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Block {block.order_num}: {block.title}</p>
                  <p className="text-xs text-gray-500">
                    {block.months.length} months, {block.months.reduce((acc, m) => acc + m.weeks.length, 0)} weeks
                  </p>
                </div>
              </div>
              <ul className="space-y-1 text-xs text-gray-600">
                {block.months.map((month) => (
                  <li key={month.id} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    Month {month.order_num}: {month.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
