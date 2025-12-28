"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { DevelopmentMap } from "@/components/DevelopmentMap";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

// Animated counter component
function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    if (value === null || value === undefined) return;

    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(startValue + (endValue - startValue) * easeOutQuart);

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{displayValue}</>;
}

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
  const [subscriptionType, setSubscriptionType] = useState<string | null>(null);
  const [subscriptionUntil, setSubscriptionUntil] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [freeTrialExpired, setFreeTrialExpired] = useState(false);
  const [freeTrialStoriesUsed, setFreeTrialStoriesUsed] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Fetch credits and check if profile exists
  useEffect(() => {
    async function fetchCredits() {
      if (!user?.email) return;

      try {
        const response = await fetch("/api/user/credits");
        const data = await response.json();

        // If unauthorized (401), profile not found (404), or auth error - sign out and redirect
        if (!data.success && (response.status === 401 || response.status === 404 || data.error === "Profile not found" || data.error === "Authentication required")) {
          console.log("Auth/Profile error, signing out...", response.status, data.error);
          const supabase = createClient();
          await supabase.auth.signOut();
          window.location.href = "/";
          return;
        }

        if (data.success) {
          setCredits(data.credits);
          setCartoonCredits(data.cartoonCredits);
          setSubscriptionType(data.subscriptionType);
          setSubscriptionUntil(data.subscriptionUntil);
          setHasActiveSubscription(data.hasActiveSubscription);
          setFreeTrialExpired(data.freeTrialExpired);
          setFreeTrialStoriesUsed(data.freeTrialStoriesUsed);
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
  }, [user?.email, router]);

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
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
          <div className="glass-card p-6 sm:p-8 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Welcome, {user?.user_metadata?.name || user?.email?.split("@")[0] || "Hero"}! 👋
                </h1>
                <p className="text-gray-600">
                  Manage your stories and account here.
                </p>
              </div>
              {/* Credits Display */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-400 to-purple-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-purple-50 border border-white/50 shadow-lg">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-purple-500 shadow-lg">
                    <img src="/images/icons/star.png" alt="" className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Credits</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-purple-600 bg-clip-text text-transparent">
                      {loadingCredits ? (
                        <span className="inline-block w-12 h-8 bg-gray-200 rounded animate-pulse"></span>
                      ) : (
                        <AnimatedCounter value={(credits ?? 0) + (cartoonCredits ?? 0)} duration={1200} />
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Free Trial Expired Banner */}
          {freeTrialExpired && (
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-[2px]">
                <div className="relative rounded-2xl bg-white p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1">Your Free Trial Has Ended</h3>
                        <p className="text-gray-600 text-sm">
                          You created {freeTrialStoriesUsed} stories during your trial. Subscribe now to continue creating unlimited magical stories!
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="flex-shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
                    >
                      Subscribe for $8/mo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Subscription Banner (never had one) */}
          {!hasActiveSubscription && !freeTrialExpired && !subscriptionType && (
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[2px]">
                <div className="relative rounded-2xl bg-white p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1">Start Your Free Trial</h3>
                        <p className="text-gray-600 text-sm">
                          Try FairyTaleAI free for 7 days! Create up to 3 personalized stories for your child.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="flex-shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
                    >
                      Start Free Trial
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Subscription Info */}
          {hasActiveSubscription && subscriptionType && subscriptionType !== "free_trial" && (
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="glass-card p-4 border-2 border-green-200 bg-green-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {subscriptionType === "monthly" ? "Monthly" : "Yearly"} Subscription Active
                    </p>
                    <p className="text-sm text-gray-600">
                      Valid until {subscriptionUntil ? new Date(subscriptionUntil).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Free Trial Info */}
          {hasActiveSubscription && subscriptionType === "free_trial" && (
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="glass-card p-4 border-2 border-blue-200 bg-blue-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Free Trial Active</p>
                      <p className="text-sm text-gray-600">
                        {freeTrialStoriesUsed}/3 stories used • Expires {subscriptionUntil ? new Date(subscriptionUntil).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg transition-all"
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Buy Cartoon Credits */}
            <Link
              href="/buy-cartoons"
              className="glass-card p-6 hover:shadow-lg transition-shadow group border-2 border-purple-200 block"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <img src="/images/icons/movie.png" alt="" className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Buy Cartoons</h3>
                  <p className="text-gray-600 text-sm">Turn stories into animated videos</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Development Map */}
          <div className="mb-8">
            <DevelopmentMap />
          </div>

          {/* Account Info */}
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="font-bold text-lg text-gray-900 mb-4">Account Info</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Email</span>
                <span className="text-gray-900 font-medium">{user?.email || "—"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Credits</span>
                <span className="text-gray-900 font-medium">
                  {loadingCredits ? "Loading..." : `${(credits ?? 0) + (cartoonCredits ?? 0)} credits`}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Member since</span>
                <span className="text-gray-900 font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          {subscriptionType && (
            <div className="glass-card p-6 mt-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <h2 className="font-bold text-lg text-gray-900 mb-4">Subscription</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Current Plan</span>
                  <span className="text-gray-900 font-medium">
                    {subscriptionType === "free_trial" ? "Free Trial" :
                     subscriptionType === "monthly" ? "Monthly ($29/mo)" :
                     subscriptionType === "yearly" ? "Yearly ($189/yr)" : subscriptionType}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${hasActiveSubscription ? "text-green-600" : "text-red-600"}`}>
                    {hasActiveSubscription ? "Active" : "Expired"}
                  </span>
                </div>
                {subscriptionUntil && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">
                      {hasActiveSubscription ? "Days Remaining" : "Expired On"}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {hasActiveSubscription ? (
                        <>
                          {Math.max(0, Math.ceil((new Date(subscriptionUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
                          <span className="text-gray-500 text-sm ml-2">
                            (until {new Date(subscriptionUntil).toLocaleDateString()})
                          </span>
                        </>
                      ) : (
                        new Date(subscriptionUntil).toLocaleDateString()
                      )}
                    </span>
                  </div>
                )}
                {hasActiveSubscription && subscriptionType !== "free_trial" && (
                  <div className="pt-4">
                    <a
                      href="https://billing.lava.top"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel Subscription
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
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
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">
                {freeTrialExpired || subscriptionType === "free_trial" ? "Upgrade Your Plan" : "Choose Your Plan"}
              </h3>
              <p className="text-gray-600">
                {freeTrialExpired ? "Continue creating magical stories for your child" : "Start creating personalized stories"}
              </p>
            </div>

            {/* Plan Selection */}
            <div className="space-y-3 mb-6">
              {/* Monthly */}
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
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">Monthly</p>
                      {freeTrialExpired && (
                        <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full font-medium">Best value</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Unlimited stories + AI audio</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">$8<span className="text-sm font-normal text-gray-500">/mo</span></p>
                    <p className="text-xs text-gray-500">then $29/mo</p>
                  </div>
                </div>
              </button>

              {/* Yearly */}
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
                    <p className="text-sm text-gray-600">Unlimited stories + AI audio</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">$189<span className="text-sm font-normal text-gray-500">/yr</span></p>
                    <p className="text-xs text-green-600 font-medium">Save 46%</p>
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
