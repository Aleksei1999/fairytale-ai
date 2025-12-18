"use client";

import { useState } from "react";
import Link from "next/link";

interface Topic {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface Month {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  goal: string;
  topics: Topic[];
  locked: boolean;
}

const YEAR_PROGRAM: Month[] = [
  {
    id: 1,
    title: "Me & Myself",
    subtitle: "Self-Awareness",
    icon: "🪞",
    color: "from-violet-400 to-purple-500",
    goal: "Child understands who they are, what they feel, what they want",
    locked: false,
    topics: [
      { id: 1, title: "Who am I beyond my name", description: "Discover your uniqueness and special qualities", completed: false },
      { id: 2, title: "My strengths", description: "Recognize and embrace your talents", completed: false },
      { id: 3, title: "My weaknesses are okay", description: "Accept imperfection as part of being human", completed: false },
      { id: 4, title: "I can make mistakes", description: "Mistakes are the path to growth", completed: false },
      { id: 5, title: "When I'm angry — what to do", description: "Managing anger and aggression", completed: false },
      { id: 6, title: "When I'm sad", description: "Accepting sadness and ways to cope", completed: false },
      { id: 7, title: "I can enjoy small things", description: "Gratitude and positive thinking", completed: false },
      { id: 8, title: "I don't have to be like everyone", description: "The value of individuality", completed: false },
      { id: 9, title: "My body is my friend", description: "Healthy relationship with your body", completed: false },
      { id: 10, title: "My opinion matters", description: "Confidence in your thoughts", completed: false },
      { id: 11, title: "I can say 'no'", description: "Setting personal boundaries", completed: false },
      { id: 12, title: "I can ask for help", description: "Strength in acknowledging your needs", completed: false },
      { id: 13, title: "I am valuable just as I am", description: "Unconditional self-worth", completed: false },
      { id: 14, title: "I learn every day", description: "Love of learning new things", completed: false },
      { id: 15, title: "I grow and change", description: "Accepting change as part of life", completed: false },
    ],
  },
  {
    id: 2,
    title: "Me & Family",
    subtitle: "Close Relationships",
    icon: "👨‍👩‍👧",
    color: "from-pink-400 to-rose-500",
    goal: "Understanding family role and building warm relationships",
    locked: true,
    topics: [],
  },
  {
    id: 3,
    title: "Me & Friends",
    subtitle: "Friendship & Communication",
    icon: "🤝",
    color: "from-amber-400 to-orange-500",
    goal: "Friendship skills, communication and conflict resolution",
    locked: true,
    topics: [],
  },
  {
    id: 4,
    title: "Me & Others' Emotions",
    subtitle: "Empathy",
    icon: "💗",
    color: "from-red-400 to-pink-500",
    goal: "Understanding feelings of others",
    locked: true,
    topics: [],
  },
  {
    id: 5,
    title: "Me & Rules",
    subtitle: "Discipline",
    icon: "📋",
    color: "from-blue-400 to-indigo-500",
    goal: "Understanding and accepting rules",
    locked: true,
    topics: [],
  },
  {
    id: 6,
    title: "Me & Goals",
    subtitle: "Determination",
    icon: "🎯",
    color: "from-green-400 to-emerald-500",
    goal: "Setting and achieving goals",
    locked: true,
    topics: [],
  },
  {
    id: 7,
    title: "Me & Challenges",
    subtitle: "Resilience",
    icon: "🏔️",
    color: "from-slate-400 to-gray-500",
    goal: "Overcoming obstacles",
    locked: true,
    topics: [],
  },
  {
    id: 8,
    title: "Me & The World",
    subtitle: "Curiosity",
    icon: "🌍",
    color: "from-cyan-400 to-teal-500",
    goal: "Interest in the world around",
    locked: true,
    topics: [],
  },
  {
    id: 9,
    title: "Me & Creativity",
    subtitle: "Creative Expression",
    icon: "🎨",
    color: "from-fuchsia-400 to-purple-500",
    goal: "Unlocking creative potential",
    locked: true,
    topics: [],
  },
  {
    id: 10,
    title: "Me & Responsibility",
    subtitle: "Independence",
    icon: "⚖️",
    color: "from-yellow-400 to-amber-500",
    goal: "Taking responsibility for your actions",
    locked: true,
    topics: [],
  },
  {
    id: 11,
    title: "Me & Team",
    subtitle: "Collaboration",
    icon: "👥",
    color: "from-sky-400 to-blue-500",
    goal: "Teamwork and leadership",
    locked: true,
    topics: [],
  },
  {
    id: 12,
    title: "I Am a Leader",
    subtitle: "Influence & Guidance",
    icon: "👑",
    color: "from-yellow-400 to-orange-500",
    goal: "Leadership qualities and influencing others",
    locked: true,
    topics: [],
  },
];

export function DevelopmentMap() {
  const [selectedMonth, setSelectedMonth] = useState<Month | null>(YEAR_PROGRAM[0]);
  const [expandedMap, setExpandedMap] = useState(false);

  const completedTopics = selectedMonth?.topics.filter(t => t.completed).length || 0;
  const totalTopics = selectedMonth?.topics.length || 0;
  const progress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>🗺️</span> Yearly Development Map
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              12 months of systematic growth: from self-discovery to leadership
            </p>
          </div>
          <button
            onClick={() => setExpandedMap(!expandedMap)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {expandedMap ? "Collapse" : "Show all months"}
          </button>
        </div>

        {/* Month Pills */}
        <div className={`flex gap-2 ${expandedMap ? "flex-wrap" : "overflow-x-auto pb-2"}`}>
          {YEAR_PROGRAM.map((month) => (
            <button
              key={month.id}
              onClick={() => !month.locked && setSelectedMonth(month)}
              disabled={month.locked}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedMonth?.id === month.id
                  ? `bg-gradient-to-r ${month.color} text-white shadow-lg`
                  : month.locked
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white/50 text-gray-700 hover:bg-white"
              }`}
            >
              <span className="mr-1">{month.icon}</span>
              {month.id}. {month.title}
              {month.locked && <span className="ml-1">🔒</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Month Details */}
      {selectedMonth && !selectedMonth.locked && (
        <div className="glass-card-strong p-6">
          {/* Month Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedMonth.color} flex items-center justify-center text-3xl shadow-lg`}>
              {selectedMonth.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-display text-2xl font-bold text-gray-900">
                Month {selectedMonth.id}: {selectedMonth.title}
              </h3>
              <p className="text-gray-600">{selectedMonth.subtitle}</p>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-medium">Goal:</span> {selectedMonth.goal}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">{completedTopics} of {totalTopics} topics</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${selectedMonth.color} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Topics Grid with Weekly Rewards */}
          <div className="grid gap-3">
            {selectedMonth.topics.map((topic, index) => {
              // Define week boundaries: Week 1 (1-4), Week 2 (5-8), Week 3 (9-12), Week 4 (13-15)
              const weekEndIndices = [3, 7, 11, 14]; // 0-indexed: after topics 4, 8, 12, 15
              const isWeekEnd = weekEndIndices.includes(index);
              const weekNumber = index <= 3 ? 1 : index <= 7 ? 2 : index <= 11 ? 3 : 4;

              return (
                <div key={topic.id}>
                  {/* Topic Card */}
                  <div
                    className={`p-4 rounded-xl border-2 transition-all ${
                      topic.completed
                        ? "bg-green-50 border-green-200"
                        : "bg-white/50 border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Number */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        topic.completed
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {topic.completed ? "✓" : index + 1}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{topic.title}</h4>
                        <p className="text-sm text-gray-500">{topic.description}</p>
                      </div>

                      {/* Action */}
                      <Link
                        href={`/create?topic=${encodeURIComponent(topic.title)}&month=${selectedMonth.id}`}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          topic.completed
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:opacity-90 shadow-md"
                        }`}
                      >
                        {topic.completed ? "Repeat" : "Create Story"}
                      </Link>
                    </div>
                  </div>

                  {/* Weekly Reward Button */}
                  {isWeekEnd && (
                    <div className="my-4 relative">
                      {/* Decorative line */}
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-dashed border-purple-200"></div>
                      </div>

                      {/* Reward Card */}
                      <div className="relative flex justify-center">
                        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-200 rounded-2xl p-4 shadow-lg max-w-md w-full">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                              🎬
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-purple-900">Week {weekNumber} Complete!</h4>
                              <p className="text-sm text-purple-600">Reward your child with a personalized cartoon</p>
                            </div>
                            <Link
                              href={`/buy-cartoons?week=${weekNumber}&month=${selectedMonth.id}`}
                              className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
                            >
                              <span>🏆</span>
                              <span>Create Cartoon</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Month Message */}
      {selectedMonth && selectedMonth.locked && (
        <div className="glass-card p-8 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
            Month {selectedMonth.id}: {selectedMonth.title}
          </h3>
          <p className="text-gray-600 mb-4">
            This month will unlock after completing previous stages
          </p>
          <p className="text-sm text-gray-500">
            Complete the current month to unlock the next one
          </p>
        </div>
      )}

      {/* Journey Info */}
      <div className="glass-card p-6">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>💡</span> About the Program
        </h4>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0">1</div>
            <div>
              <p className="font-medium text-gray-900">Months 1-4</p>
              <p className="text-gray-600">I discover myself</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">2</div>
            <div>
              <p className="font-medium text-gray-900">Months 5-8</p>
              <p className="text-gray-600">I interact with the world</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">3</div>
            <div>
              <p className="font-medium text-gray-900">Months 9-12</p>
              <p className="text-gray-600">I influence and lead</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
