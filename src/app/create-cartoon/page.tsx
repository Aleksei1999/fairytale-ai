"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

type Gender = "boy" | "girl";

interface CharacterOptions {
  gender: Gender;
  hairColor: string;
  eyeColor: string;
  skinColor: string;
}

const hairColors = [
  { id: "blonde", name: "Blonde", color: "#F4D03F" },
  { id: "brown", name: "Brown", color: "#8B4513" },
  { id: "black", name: "Black", color: "#1C1C1C" },
  { id: "red", name: "Red", color: "#C0392B" },
  { id: "auburn", name: "Auburn", color: "#A52A2A" },
  { id: "gray", name: "Gray", color: "#808080" },
];

const eyeColors = [
  { id: "blue", name: "Blue", color: "#3498DB" },
  { id: "green", name: "Green", color: "#27AE60" },
  { id: "brown", name: "Brown", color: "#8B4513" },
  { id: "hazel", name: "Hazel", color: "#9A7B4F" },
  { id: "gray", name: "Gray", color: "#7F8C8D" },
  { id: "amber", name: "Amber", color: "#FFBF00" },
];

const skinColors = [
  { id: "fair", name: "Fair", color: "#FDEBD0" },
  { id: "light", name: "Light", color: "#F5CBA7" },
  { id: "medium", name: "Medium", color: "#D4A574" },
  { id: "olive", name: "Olive", color: "#C9A86C" },
  { id: "tan", name: "Tan", color: "#A67B5B" },
  { id: "dark", name: "Dark", color: "#6F4E37" },
];

export default function CreateCartoonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekId = searchParams.get("weekId");
  const { user, loading: authLoading } = useAuth();

  const [character, setCharacter] = useState<CharacterOptions>({
    gender: "boy",
    hairColor: "brown",
    eyeColor: "blue",
    skinColor: "light",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cartoonCredits, setCartoonCredits] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchCredits() {
      if (!user?.email) return;
      try {
        const response = await fetch("/api/user/credits");
        const data = await response.json();
        if (data.success) {
          setCartoonCredits(data.cartoonCredits ?? 0);
        }
      } catch (err) {
        console.error("Error fetching credits:", err);
      }
    }
    if (user?.email) {
      fetchCredits();
    }
  }, [user?.email]);

  const handleGenerate = async () => {
    if (!user?.email) return;

    if (cartoonCredits !== null && cartoonCredits < 1) {
      setError("You need cartoon credits to generate a character. Please purchase credits first.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/cartoon/generate-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...character,
          weekId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedImage(data.imageUrl);
        setCartoonCredits((prev) => (prev !== null ? prev - 1 : null));
      } else {
        setError(data.error || "Failed to generate character");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError("Connection error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const selectedHair = hairColors.find((h) => h.id === character.hairColor);
  const selectedEyes = eyeColors.find((e) => e.id === character.eyeColor);
  const selectedSkin = skinColors.find((s) => s.id === character.skinColor);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
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
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-xl">
              <span className="text-4xl">🎬</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Create Your Character
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Design your unique Disney-style 3D character for your personalized cartoon!
            </p>
            {cartoonCredits !== null && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700">
                <span>🎬</span>
                <span className="font-medium">{cartoonCredits} cartoon credit{cartoonCredits !== 1 ? "s" : ""} available</span>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Customization Panel */}
            <div className="glass-card-strong p-6 sm:p-8">
              <h2 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                <span>🎨</span> Customize Character
              </h2>

              {/* Gender Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Character Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCharacter({ ...character, gender: "boy" })}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      character.gender === "boy"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <span className="text-4xl">👦</span>
                    <span className={`font-medium ${character.gender === "boy" ? "text-blue-700" : "text-gray-700"}`}>
                      Boy
                    </span>
                  </button>
                  <button
                    onClick={() => setCharacter({ ...character, gender: "girl" })}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      character.gender === "girl"
                        ? "border-pink-500 bg-pink-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <span className="text-4xl">👧</span>
                    <span className={`font-medium ${character.gender === "girl" ? "text-pink-700" : "text-gray-700"}`}>
                      Girl
                    </span>
                  </button>
                </div>
              </div>

              {/* Hair Color */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Hair Color
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {hairColors.map((hair) => (
                    <button
                      key={hair.id}
                      onClick={() => setCharacter({ ...character, hairColor: hair.id })}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        character.hairColor === hair.id
                          ? "border-purple-500 bg-purple-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full shadow-inner border border-gray-200"
                        style={{ backgroundColor: hair.color }}
                      />
                      <span className="text-xs font-medium text-gray-600">{hair.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Eye Color */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Eye Color
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {eyeColors.map((eye) => (
                    <button
                      key={eye.id}
                      onClick={() => setCharacter({ ...character, eyeColor: eye.id })}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        character.eyeColor === eye.id
                          ? "border-purple-500 bg-purple-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full shadow-inner border border-gray-200"
                        style={{ backgroundColor: eye.color }}
                      />
                      <span className="text-xs font-medium text-gray-600">{eye.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Color */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Skin Tone
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {skinColors.map((skin) => (
                    <button
                      key={skin.id}
                      onClick={() => setCharacter({ ...character, skinColor: skin.id })}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        character.skinColor === skin.id
                          ? "border-purple-500 bg-purple-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full shadow-inner border border-gray-200"
                        style={{ backgroundColor: skin.color }}
                      />
                      <span className="text-xs font-medium text-gray-600">{skin.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="glass-card-strong p-6 sm:p-8">
              <h2 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                <span>👀</span> Preview
              </h2>

              {/* Character Preview */}
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 flex items-center justify-center mb-6 border-2 border-purple-200 overflow-hidden">
                {generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Generated character"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6">
                    <div className="text-8xl mb-4">
                      {character.gender === "boy" ? "👦" : "👧"}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: selectedHair?.color }}
                        />
                        <span>{selectedHair?.name} hair</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: selectedEyes?.color }}
                        />
                        <span>{selectedEyes?.name} eyes</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: selectedSkin?.color }}
                        />
                        <span>{selectedSkin?.name} skin</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-4">
                      Click &quot;Generate Character&quot; to create your 3D avatar
                    </p>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm mb-4">
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (cartoonCredits !== null && cartoonCredits < 1)}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating Magic...
                  </span>
                ) : cartoonCredits !== null && cartoonCredits < 1 ? (
                  "No Credits Available"
                ) : (
                  <>🎬 Generate Character</>
                )}
              </button>

              {cartoonCredits !== null && cartoonCredits < 1 && (
                <Link
                  href="/buy-cartoons"
                  className="mt-4 block w-full py-3 rounded-xl font-medium text-center text-purple-600 bg-purple-100 hover:bg-purple-200 transition-colors"
                >
                  Buy Cartoon Credits
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
