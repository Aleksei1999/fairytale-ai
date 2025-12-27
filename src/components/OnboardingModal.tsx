"use client";

import { useState } from "react";

interface ChildInfo {
  name: string;
  age: string;
  gender: "boy" | "girl" | "";
  interests: string;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (childInfo: ChildInfo) => void;
  onSkip: () => void;
}

export function OnboardingModal({ isOpen, onComplete, onSkip }: OnboardingModalProps) {
  const [childInfo, setChildInfo] = useState<ChildInfo>({
    name: "",
    age: "",
    gender: "",
    interests: "",
  });

  const canProceed = childInfo.name && childInfo.age && childInfo.gender;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative glass-card-strong p-6 sm:p-8 max-w-lg w-full mx-2 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">✨</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Let&apos;s Personalize the Magic!
          </h3>
          <p className="text-gray-600 text-sm">
            Tell us about your child so we can create stories just for them
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Child&apos;s name *
            </label>
            <input
              type="text"
              value={childInfo.name}
              onChange={(e) => setChildInfo({ ...childInfo, name: e.target.value })}
              placeholder="Enter name"
              className="w-full px-4 py-3 rounded-xl border-2 border-sky-200 focus:border-sky-400 focus:outline-none text-gray-700 bg-white/80"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age *
            </label>
            <div className="flex gap-2 flex-wrap">
              {["2", "3", "4", "5", "6", "7", "8"].map((age) => (
                <button
                  key={age}
                  type="button"
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
              Gender *
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setChildInfo({ ...childInfo, gender: "boy" })}
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  childInfo.gender === "boy"
                    ? "bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg"
                    : "bg-white/80 text-gray-600 hover:bg-white border border-sky-200"
                }`}
              >
                <span className="text-xl">👦</span>
                <span>Boy</span>
              </button>
              <button
                type="button"
                onClick={() => setChildInfo({ ...childInfo, gender: "girl" })}
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  childInfo.gender === "girl"
                    ? "bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg"
                    : "bg-white/80 text-gray-600 hover:bg-white border border-sky-200"
                }`}
              >
                <span className="text-xl">👧</span>
                <span>Girl</span>
              </button>
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interests (optional)
            </label>
            <textarea
              value={childInfo.interests}
              onChange={(e) => setChildInfo({ ...childInfo, interests: e.target.value })}
              placeholder="Dinosaurs, space, princesses, cars..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border-2 border-sky-200 focus:border-sky-400 focus:outline-none text-gray-700 bg-white/80 resize-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => canProceed && onComplete(childInfo)}
            disabled={!canProceed}
            className={`w-full btn-glow py-3 text-center font-semibold text-white ${
              !canProceed ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Continue to Registration
          </button>
          <button
            onClick={onSkip}
            className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
          >
            Skip for now
          </button>
        </div>

        {/* Note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          You can always update this information later in settings
        </p>
      </div>
    </div>
  );
}
