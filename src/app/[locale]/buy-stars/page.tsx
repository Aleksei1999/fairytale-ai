"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { trackInitiateCheckout, trackViewContent } from "@/lib/facebook-pixel";
import { ThemeToggle } from "@/components/ThemeToggle";

const STAR_PACKAGES = [
  {
    id: "starter",
    stars: 10,
    price: 14.90,
    priceDisplay: "$14.90",
    pricePerStar: "$1.49",
    description: "10 Audio OR 2 Cartoons",
    popular: false,
    icon: "/images/icons/star.png",
  },
  {
    id: "popular",
    stars: 30,
    price: 39.90,
    priceDisplay: "$39.90",
    pricePerStar: "$1.33",
    description: "Full month: 12 Audio + 3 Cartoons",
    popular: true,
    icon: "/images/icons/sparkle.png",
  },
  {
    id: "bigpack",
    stars: 50,
    price: 59.90,
    priceDisplay: "$59.90",
    pricePerStar: "$1.19",
    description: "Best value — stock up!",
    popular: false,
    icon: "/images/icons/trophy.png",
  },
];

export default function BuyStars() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("buyStarsPage");
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
        const response = await fetch("/api/user/credits");
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

  // Track page view for Facebook Pixel
  useEffect(() => {
    if (user?.email) {
      trackViewContent({
        contentName: "Buy Stars Page",
        contentCategory: "stars",
      });
    }
  }, [user?.email]);

  const handlePurchase = async (packageId: string) => {
    if (!user?.email) return;

    // Find the package to get price info
    const pkg = STAR_PACKAGES.find(p => p.id === packageId);
    if (pkg) {
      // Track InitiateCheckout event
      trackInitiateCheckout({
        value: pkg.price,
        currency: "USD",
        contentName: `${pkg.stars} Stars Pack`,
        contentCategory: "stars",
      });
    }

    setPaymentLoading(true);
    setSelectedPackage(packageId);

    try {
      const response = await fetch("/api/payment/create-stars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
        }),
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || t("paymentError"));
      }
    } catch {
      alert(t("connectionError"));
    } finally {
      setPaymentLoading(false);
      setSelectedPackage(null);
    }
  };

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 dark:from-[#1a1a1a] dark:via-[#1a1a1a] dark:to-[#242424]">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
              <img src="/images/icons/magic-wand.png" alt="" className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl text-gray-800 dark:text-gray-200">FairyTaleAI</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              {t("backToDashboard")}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50 border border-amber-200 dark:border-amber-700 mb-6">
              <img src="/images/icons/star.png" alt="" className="w-5 h-5" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                {userStars !== null ? t("youHaveStars", { count: userStars }) : t("loading")}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t("getMore")} <span className="gradient-text">{t("stars")}</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              {t("starsUnlock")}
            </p>
          </div>

          {/* What stars do */}
          <div className="glass-card p-6 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <img src="/images/icons/sparkle.png" alt="" className="w-5 h-5" /> {t("whatCanYouDo")}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0">
                  <img src="/images/icons/microphone.png" alt="" className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{t("aiVoiceNarration")}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("aiVoiceDesc")}</p>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">{t("starPerStory")}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center flex-shrink-0">
                  <img src="/images/icons/movie.png" alt="" className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{t("animatedCartoon")}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("animatedCartoonDesc")}</p>
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mt-1">{t("starsPerCartoon")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Packages */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            {STAR_PACKAGES.map((pkg, index) => (
              <div
                key={pkg.id}
                className={`glass-card p-6 relative animate-fade-in-up ${
                  pkg.popular ? "border-2 border-amber-400 shadow-lg" : ""
                }`}
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
                    {t("mostPopular")}
                  </div>
                )}

                <div className="text-center mb-4">
                  <div className="flex justify-center mb-2">
                    <img src={pkg.icon} alt="" className="w-12 h-12" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                    {pkg.stars} {t("starsLabel")}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t(`${pkg.id}Desc`)}</p>
                </div>

                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{pkg.priceDisplay}</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{pkg.pricePerStar} {t("perStar")}</p>
                </div>

                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={paymentLoading}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    pkg.popular
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:opacity-90"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600"
                  } disabled:opacity-50`}
                >
                  {paymentLoading && selectedPackage === pkg.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t("processing")}
                    </span>
                  ) : (
                    t("buyNow")
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="glass-card p-6 text-center animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              <span className="font-semibold text-gray-900 dark:text-gray-100">{t("note")}</span> {t("starsNeverExpire")}
              {" "}{t("useAnytime")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
