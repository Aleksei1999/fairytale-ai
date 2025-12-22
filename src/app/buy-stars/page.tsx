"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

const STAR_PACKAGES = [
  {
    id: "starter",
    stars: 10,
    price: 14.90,
    priceDisplay: "$14.90",
    pricePerStar: "$1.49",
    description: "10 Audio OR 2 Cartoons",
    popular: false,
    emoji: "⭐",
  },
  {
    id: "popular",
    stars: 30,
    price: 39.90,
    priceDisplay: "$39.90",
    pricePerStar: "$1.33",
    description: "Full month: 12 Audio + 3 Cartoons",
    popular: true,
    emoji: "🌟",
  },
  {
    id: "bigpack",
    stars: 50,
    price: 59.90,
    priceDisplay: "$59.90",
    pricePerStar: "$1.19",
    description: "Best value — stock up!",
    popular: false,
    emoji: "💫",
  },
];

export default function BuyStars() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [userStars, setUserStars] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Fetch star balance
  useEffect(() => {
    async function fetchStars() {
      if (!user?.email) return;
      try {
        const response = await fetch(`/api/user/credits?email=${encodeURIComponent(user.email)}`);
        const data = await response.json();
        if (data.success) {
          setUserStars(data.credits || 0);
        }
      } catch (error) {
        console.error("Error fetching stars:", error);
      }
    }
    if (user?.email) {
      fetchStars();
    }
  }, [user?.email]);

  const handlePurchase = async (packageId: string) => {
    if (!user?.email) return;

    setPaymentLoading(true);
    setSelectedPackage(packageId);

    try {
      const response = await fetch("/api/payment/create-stars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          packageId,
        }),
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || "Payment error");
      }
    } catch {
      alert("Connection error");
    } finally {
      setPaymentLoading(false);
      setSelectedPackage(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 mb-6">
              <span className="text-xl">⭐</span>
              <span className="text-sm font-medium text-amber-700">
                {userStars !== null ? `You have ${userStars} stars` : "Loading..."}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Get More <span className="gradient-text">Stars</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Stars unlock AI voice narration and cartoon generation for your fairy tales
            </p>
          </div>

          {/* What stars do */}
          <div className="glass-card p-6 mb-8">
            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <span>✨</span> What can you do with stars?
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
                  🎙️
                </div>
                <div>
                  <p className="font-medium text-gray-900">AI Voice Narration</p>
                  <p className="text-sm text-gray-600">Professional narrator reads your story</p>
                  <p className="text-sm font-semibold text-blue-600 mt-1">1 star per story</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl flex-shrink-0">
                  🎬
                </div>
                <div>
                  <p className="font-medium text-gray-900">Animated Cartoon</p>
                  <p className="text-sm text-gray-600">Turn your story into a video</p>
                  <p className="text-sm font-semibold text-purple-600 mt-1">5 stars per cartoon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Packages */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            {STAR_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`glass-card p-6 relative ${
                  pkg.popular ? "border-2 border-amber-400 shadow-lg" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{pkg.emoji}</div>
                  <h3 className="font-bold text-xl text-gray-900">
                    {pkg.stars} Stars
                  </h3>
                  <p className="text-sm text-gray-500">{pkg.description}</p>
                </div>

                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900">{pkg.priceDisplay}</div>
                  <p className="text-sm text-gray-500">{pkg.pricePerStar} per star</p>
                </div>

                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={paymentLoading}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    pkg.popular
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:opacity-90"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  } disabled:opacity-50`}
                >
                  {paymentLoading && selectedPackage === pkg.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Buy Now"
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="glass-card p-6 text-center">
            <p className="text-gray-600 text-sm">
              <span className="font-semibold text-gray-900">Note:</span> Stars never expire!
              Use them anytime for AI voice narration or cartoon generation.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
