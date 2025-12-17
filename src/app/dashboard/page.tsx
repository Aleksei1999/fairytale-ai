"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [cartoonCredits, setCartoonCredits] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Fetch credits
  useEffect(() => {
    async function fetchCredits() {
      if (!user?.email) return;

      try {
        const response = await fetch(`/api/user/credits?email=${encodeURIComponent(user.email)}`);
        const data = await response.json();
        if (data.success) {
          setCredits(data.credits);
          setCartoonCredits(data.cartoonCredits);
        } else {
          setCredits(0);
          setCartoonCredits(0);
        }
      } catch (error) {
        console.error("Error fetching credits:", error);
        setCredits(0);
        setCartoonCredits(0);
      } finally {
        setLoadingCredits(false);
      }
    }

    if (user?.email) {
      fetchCredits();
    }
  }, [user?.email]);

  const handleBuyCredits = async () => {
    if (!user?.email) return;

    setPaymentLoading(true);
    setPaymentError("");

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          plan: selectedPlan
        }),
      });
      const data = await response.json();

      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setPaymentError(data.error || "Payment creation error");
      }
    } catch {
      setPaymentError("Connection error. Please try again.");
    } finally {
      setPaymentLoading(false);
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
            href="/"
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="glass-card p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Welcome, {user.user_metadata?.name || user.email?.split("@")[0]}! 👋
                </h1>
                <p className="text-gray-600">
                  Manage your stories and account here.
                </p>
              </div>
              {/* Credits Badges */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-100 border border-amber-200">
                  <span className="text-2xl">📖</span>
                  <div>
                    <p className="text-xs text-amber-700 font-medium">Story Credits</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {loadingCredits ? "..." : credits ?? 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200">
                  <span className="text-2xl">🎬</span>
                  <div>
                    <p className="text-xs text-purple-700 font-medium">Cartoon Credits</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {loadingCredits ? "..." : cartoonCredits ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Create Story */}
            <Link
              href="/create"
              className="glass-card p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  ✨
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Create Story</h3>
                  <p className="text-gray-600 text-sm">Generate a new personalized fairy tale</p>
                </div>
              </div>
            </Link>

            {/* Buy Story Credits */}
            <button
              onClick={() => setShowPaymentModal(true)}
              className="glass-card p-6 hover:shadow-lg transition-shadow group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  📖
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Get Story Credits</h3>
                  <p className="text-gray-600 text-sm">Subscribe for more stories</p>
                </div>
              </div>
            </button>

            {/* Buy Cartoon Credits */}
            <Link
              href="/buy-cartoons"
              className="glass-card p-6 hover:shadow-lg transition-shadow group border-2 border-purple-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🎬
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Buy Cartoons</h3>
                  <p className="text-gray-600 text-sm">Turn stories into animated videos</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Account Info */}
          <div className="glass-card p-6">
            <h2 className="font-bold text-lg text-gray-900 mb-4">Account Info</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Email</span>
                <span className="text-gray-900 font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Story Credits</span>
                <span className="text-gray-900 font-medium">
                  {loadingCredits ? "Loading..." : `${credits ?? 0} credits`}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Cartoon Credits</span>
                <span className="text-gray-900 font-medium">
                  {loadingCredits ? "Loading..." : `${cartoonCredits ?? 0} credits`}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Member since</span>
                <span className="text-gray-900 font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPaymentModal(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative glass-card-strong p-6 sm:p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl">📖</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">
                Get Story Credits
              </h3>
              <p className="text-gray-600">
                Subscribe to create magical personalized stories
              </p>
            </div>

            {/* Plan Selection */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setSelectedPlan("monthly")}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedPlan === "monthly"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">Monthly</p>
                    <p className="text-sm text-gray-600">5 stories per month</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">$29/mo</p>
                </div>
              </button>

              <button
                onClick={() => setSelectedPlan("yearly")}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedPlan === "yearly"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">Yearly</p>
                    <p className="text-sm text-gray-600">60 stories per year</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">$249/yr</p>
                    <p className="text-xs text-green-600 font-medium">Save 28%</p>
                  </div>
                </div>
              </button>
            </div>

            {paymentError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm mb-4">
                {paymentError}
              </div>
            )}

            <button
              onClick={handleBuyCredits}
              disabled={paymentLoading}
              className="w-full btn-glow py-3 text-center font-semibold text-white disabled:opacity-50"
            >
              {paymentLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                "Subscribe Now"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
