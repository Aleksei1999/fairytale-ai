"use client";

import { useState } from "react";
import Link from "next/link";

interface Story {
  id: number;
  title: string;
  available: boolean;
}

interface Month {
  id: number;
  title: string;
  themes: string;
  plot: string;
  stories: Story[];
}

interface Block {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  goal: string;
  months: Month[];
}

const YEAR_PROGRAM: Block[] = [
  {
    id: 1,
    title: "Me & My Emotions",
    subtitle: "EQ Foundation",
    icon: "💛",
    color: "from-amber-400 to-yellow-500",
    goal: "Teach the child to understand what's happening inside them and not to fear their feelings.",
    months: [
      {
        id: 1,
        title: "Meeting Emotions",
        themes: "Joy, Sadness, Anger, Fear",
        plot: "The Hero finds the \"Emotion Map\" and learns to name what they feel.",
        stories: [
          { id: 1, title: "The Magic Emotion Map", available: true },
          { id: 2, title: "When Joy Visits", available: false },
          { id: 3, title: "Sadness Is My Friend Too", available: false },
        ],
      },
      {
        id: 2,
        title: "Taming Anger (Self-Regulation)",
        themes: "What to do when you want to hit? Pause technique, breathing, safe outlet for aggression.",
        plot: "The Hero turns into a dragon when angry and learns to \"put out the fire\" inside.",
        stories: [
          { id: 4, title: "The Little Dragon Inside", available: false },
          { id: 5, title: "The Magic Pause", available: false },
          { id: 6, title: "Breathing Like a Dragon", available: false },
        ],
      },
      {
        id: 3,
        title: "Fighting Fears",
        themes: "Darkness, monsters under the bed, fear of mom leaving (separation).",
        plot: "The Hero turns on the \"Magic Light\" (CBT technique) and sees reality.",
        stories: [
          { id: 7, title: "The Magic Light", available: false },
          { id: 8, title: "Monsters Are Not Real", available: false },
          { id: 9, title: "Mom Always Returns", available: false },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Me & Others",
    subtitle: "Socialization",
    icon: "💙",
    color: "from-blue-400 to-cyan-500",
    goal: "Teach ecological communication, boundaries, and friendship.",
    months: [
      {
        id: 4,
        title: "Personal Boundaries & \"No\"",
        themes: "My body, my toys. How to politely refuse and accept refusal.",
        plot: "The Hero builds a fence around their house and teaches guests to knock.",
        stories: [
          { id: 10, title: "My Magic Fence", available: false },
          { id: 11, title: "The Power of No", available: false },
          { id: 12, title: "When Others Say No", available: false },
        ],
      },
      {
        id: 5,
        title: "Empathy & Kindness",
        themes: "What does the other person feel? How to comfort? Why you shouldn't hurt the weak.",
        plot: "The Hero helps a chick that fell from the nest and feels warmth in their chest.",
        stories: [
          { id: 13, title: "The Little Chick", available: false },
          { id: 14, title: "Feeling Others' Hearts", available: false },
          { id: 15, title: "The Warmth of Kindness", available: false },
        ],
      },
      {
        id: 6,
        title: "Conflict Resolution",
        themes: "Sharing toys, sandbox fights, making up and apologizing.",
        plot: "Two animals pull a rope until they understand they can play together.",
        stories: [
          { id: 16, title: "The Tug of War", available: false },
          { id: 17, title: "The Magic Words", available: false },
          { id: 18, title: "Playing Together", available: false },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Me & My Actions",
    subtitle: "Independence & Discipline",
    icon: "💚",
    color: "from-green-400 to-emerald-500",
    goal: "Development of Executive Functions (brain's executive functions).",
    months: [
      {
        id: 7,
        title: "Routine & Hygiene (Without Tears)",
        themes: "Brushing teeth, potty, sleep, tidying toys.",
        plot: "Turning boring tasks into adventures (toothbrush is a teeth rescuer).",
        stories: [
          { id: 19, title: "The Teeth Rescuer", available: false },
          { id: 20, title: "The Sleepy Adventure", available: false },
          { id: 21, title: "Toy Kingdom Clean-Up", available: false },
        ],
      },
      {
        id: 8,
        title: "Independence",
        themes: "\"I can do it myself!\", getting dressed, helping parents.",
        plot: "The Hero ties their shoelaces by themselves (even if not right away) and feels proud.",
        stories: [
          { id: 22, title: "The Shoelace Challenge", available: false },
          { id: 23, title: "Little Helper", available: false },
          { id: 24, title: "I Can Do It!", available: false },
        ],
      },
      {
        id: 9,
        title: "Patience & Persistence",
        themes: "Waiting in line, long trips, finishing things.",
        plot: "We plant a seed and wait for the flower to grow (delayed gratification lesson).",
        stories: [
          { id: 25, title: "The Magic Seed", available: false },
          { id: 26, title: "The Waiting Game", available: false },
          { id: 27, title: "Never Give Up", available: false },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Me — A Person",
    subtitle: "Leadership & Thinking",
    icon: "💜",
    color: "from-purple-400 to-violet-500",
    goal: "Forming the core of personality and preparing for school/world.",
    months: [
      {
        id: 10,
        title: "Growth Mindset",
        themes: "Making mistakes is normal. The power of the word \"Yet\".",
        plot: "The Hero falls off the bike, gets up and says: \"I'll try again\".",
        stories: [
          { id: 28, title: "The Bike and Me", available: false },
          { id: 29, title: "The Magic Word Yet", available: false },
          { id: 30, title: "Mistakes Make Me Stronger", available: false },
        ],
      },
      {
        id: 11,
        title: "Honesty & Responsibility",
        themes: "Why lying is bad? What is a promise? Admitting guilt.",
        plot: "The Hero broke a vase, told the truth, and wasn't punished but praised for courage.",
        stories: [
          { id: 31, title: "The Broken Vase", available: false },
          { id: 32, title: "The Promise", available: false },
          { id: 33, title: "The Courage of Truth", available: false },
        ],
      },
      {
        id: 12,
        title: "Gratitude & Confidence",
        themes: "What do I love about this world? My superpowers (talents).",
        plot: "Final adventure where the Hero looks back and sees what a big journey they've made.",
        stories: [
          { id: 34, title: "My Superpowers", available: false },
          { id: 35, title: "Thank You, World", available: false },
          { id: 36, title: "The Hero's Journey Complete", available: false },
        ],
      },
    ],
  },
];

export function DevelopmentMap() {
  const [selectedBlock, setSelectedBlock] = useState<Block>(YEAR_PROGRAM[0]);
  const [selectedMonth, setSelectedMonth] = useState<Month>(YEAR_PROGRAM[0].months[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="mb-4">
          <h2 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>🗺️</span> The Hero&apos;s Grand Journey
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            12 months that will change everything. 3 stories per week (every other day).
          </p>
        </div>

        {/* Block Pills */}
        <div className="flex flex-wrap gap-2">
          {YEAR_PROGRAM.map((block) => (
            <button
              key={block.id}
              onClick={() => {
                setSelectedBlock(block);
                setSelectedMonth(block.months[0]);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedBlock.id === block.id
                  ? `bg-gradient-to-r ${block.color} text-white shadow-lg`
                  : "bg-white/50 text-gray-700 hover:bg-white"
              }`}
            >
              <span className="mr-1">{block.icon}</span>
              Block {block.id}
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
                Months {selectedBlock.months[0].id}-{selectedBlock.months[selectedBlock.months.length - 1].id}
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
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {selectedBlock.months.map((month) => (
            <button
              key={month.id}
              onClick={() => setSelectedMonth(month)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedMonth.id === month.id
                  ? "bg-gray-900 text-white shadow-lg"
                  : "bg-white/70 text-gray-700 hover:bg-white"
              }`}
            >
              Month {month.id}
            </button>
          ))}
        </div>

        {/* Selected Month Content */}
        <div className="bg-white/50 rounded-2xl p-5 mb-6">
          <h4 className="font-bold text-lg text-gray-900 mb-2">
            Month {selectedMonth.id}: {selectedMonth.title}
          </h4>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Themes:</span> {selectedMonth.themes}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Story:</span> <span className="italic">{selectedMonth.plot}</span>
            </p>
          </div>
        </div>

        {/* Stories Grid */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <span>📚</span> Week Stories (every other day):
          </p>
          {selectedMonth.stories.map((story, index) => (
            <div
              key={story.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                story.available
                  ? "bg-white border-green-200 hover:border-green-300"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Day Badge */}
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs ${
                  story.available
                    ? `bg-gradient-to-br ${selectedBlock.color} text-white shadow-md`
                    : "bg-gray-200 text-gray-500"
                }`}>
                  <span>Day</span>
                  <span className="text-lg">{index * 2 + 1}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h5 className={`font-semibold ${story.available ? "text-gray-900" : "text-gray-500"}`}>
                    {story.title}
                  </h5>
                  <p className="text-xs text-gray-500">
                    Story {index + 1} of 3 this week
                  </p>
                </div>

                {/* Action */}
                {story.available ? (
                  <Link
                    href={`/create?story=${story.id}&month=${selectedMonth.id}`}
                    className={`px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${selectedBlock.color} text-white hover:opacity-90 shadow-md transition-all`}
                  >
                    Create Story
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <span>🔒</span>
                    <span>Locked</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Cartoon Reward */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
              🎬
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-purple-900">Week Complete Reward!</h4>
              <p className="text-sm text-purple-600">Finish all 3 stories to unlock a personalized cartoon</p>
            </div>
            <button
              disabled
              className="px-4 py-3 rounded-xl bg-gray-300 text-gray-500 font-bold text-sm cursor-not-allowed"
            >
              🏆 Complete Week First
            </button>
          </div>
        </div>
      </div>

      {/* Program Overview */}
      <div className="glass-card p-6">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📋</span> Program Overview
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          {YEAR_PROGRAM.map((block) => (
            <div
              key={block.id}
              className={`p-4 rounded-xl border-2 ${
                selectedBlock.id === block.id ? "border-gray-300 bg-white" : "border-gray-100 bg-white/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{block.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Block {block.id}: {block.title}</p>
                  <p className="text-xs text-gray-500">Months {block.months[0].id}-{block.months[block.months.length - 1].id}</p>
                </div>
              </div>
              <ul className="space-y-1 text-xs text-gray-600">
                {block.months.map((month) => (
                  <li key={month.id} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    Month {month.id}: {month.title}
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
