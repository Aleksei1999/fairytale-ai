"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/AuthProvider";
import { AuthModal } from "@/components/AuthModal";
import { OnboardingModal } from "@/components/OnboardingModal";
import { useScrollAnimations } from "@/components/ScrollAnimations";
import { MagneticLink, MagneticButton } from "@/components/MagneticButton";
import { AnimatedText, AnimatedWords, AnimatedLine } from "@/components/AnimatedText";
import { ThemeToggle } from "@/components/ThemeToggle";
// import { LanguageSwitcher } from "@/components/LanguageSwitcher"; // временно отключено

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const t = useTranslations();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openProgramBlock, setOpenProgramBlock] = useState<number | null>(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");
  const [pendingPaymentPlan, setPendingPaymentPlan] = useState<"week" | "monthly" | "yearly" | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"week" | "monthly" | "yearly">("monthly");
  const [paymentEmail, setPaymentEmail] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [navigatingToDashboard, setNavigatingToDashboard] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [pendingChildInfo, setPendingChildInfo] = useState<{name: string; age: string; gender: "boy" | "girl" | ""; interests: string} | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize GSAP scroll animations
  useScrollAnimations();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setAudioProgress(audio.currentTime);
    const updateDuration = () => setAudioDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const navigateToDashboard = () => {
    setNavigatingToDashboard(true);
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    router.push("/dashboard");
  };

  // Scroll to pricing section, but show auth modal first if not logged in
  const scrollToPricing = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      // Not authorized - show auth modal first (signup mode for CTA)
      setAuthModalMode("signup");
      setShowAuthModal(true);
      return;
    }
    // Authorized - scroll to pricing
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const openPaymentModal = (plan: "week" | "monthly" | "yearly") => {
    // Free Trial (week) = first show onboarding, then registration
    if (plan === "week") {
      if (!user) {
        // Not authorized - show onboarding modal first to collect child info
        setShowOnboardingModal(true);
      } else {
        // Already authorized - redirect to dashboard (they already have or had trial)
        window.location.href = "/dashboard";
      }
      return;
    }

    if (!user) {
      // Not authorized - save plan and show auth modal (signup mode)
      setPendingPaymentPlan(plan);
      setAuthModalMode("signup");
      setShowAuthModal(true);
      return;
    }
    // Authorized - go directly to payment (skip modal)
    if (user.email) {
      handlePaymentDirect(plan);
    } else {
      // Fallback if no email - show modal
      setSelectedPlan(plan);
      setPaymentEmail("");
      setPaymentError("");
      setShowPaymentModal(true);
    }
  };

  const handleAuthSuccess = () => {
    // After successful auth, save pending plan and child info to localStorage and reload
    if (pendingPaymentPlan) {
      localStorage.setItem("pendingPaymentPlan", pendingPaymentPlan);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      // Save child info if available
      if (pendingChildInfo) {
        localStorage.setItem("pendingChildInfo", JSON.stringify(pendingChildInfo));
      }
      // No pending payment - redirect to dashboard
      window.location.href = "/dashboard";
    }
  };

  // Handle onboarding completion - save child info and show auth modal
  const handleOnboardingComplete = (childInfo: {name: string; age: string; gender: "boy" | "girl" | ""; interests: string}) => {
    setPendingChildInfo(childInfo);
    localStorage.setItem("pendingChildInfo", JSON.stringify(childInfo));
    setShowOnboardingModal(false);
    // Now show auth modal for registration
    setPendingPaymentPlan(null);
    setAuthModalMode("signup");
    setShowAuthModal(true);
  };

  // Handle onboarding skip - just show auth modal
  const handleOnboardingSkip = () => {
    setShowOnboardingModal(false);
    setPendingPaymentPlan(null);
    setAuthModalMode("signup");
    setShowAuthModal(true);
  };

  // Check for pending payment on mount (after auth redirect)
  useEffect(() => {
    const savedPlan = localStorage.getItem("pendingPaymentPlan") as "week" | "monthly" | "yearly" | null;
    if (savedPlan && user?.email) {
      localStorage.removeItem("pendingPaymentPlan");
      handlePaymentDirect(savedPlan);
    }
  }, [user]);

  const handlePaymentDirect = async (plan: "week" | "monthly" | "yearly") => {
    setPaymentLoading(true);
    setPaymentError("");

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setPaymentError(data.error || "Payment creation error");
        setShowPaymentModal(true);
      }
    } catch {
      setPaymentError("Connection error. Please try again later.");
      setShowPaymentModal(true);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!user?.email) {
      setPaymentError("Please sign in first");
      return;
    }

    setPaymentLoading(true);
    setPaymentError("");

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
        }),
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        // Redirect to Lava Top payment page
        window.location.href = data.paymentUrl;
      } else {
        setPaymentError(data.error || "Payment creation error");
      }
    } catch {
      setPaymentError("Connection error. Please try again later.");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Full screen loading overlay */}
      {navigatingToDashboard && (
        <div className="fixed inset-0 z-[100] bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      )}

      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-sky-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/4 w-80 h-80 bg-sky-100/40 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-50 container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <nav className="glass-card px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg">
              <img src="/images/icons/magic-wand.png" alt="" className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="font-display text-lg sm:text-xl font-bold text-gray-800">FairyTaleAI</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="#problems" className="text-gray-600 hover:text-blue-600 transition-colors hidden md:block">
              {t("nav.problems")}
            </a>
            <a href="#how" className="text-gray-600 hover:text-blue-600 transition-colors hidden md:block">
              {t("nav.howItWorks")}
            </a>
            <a href="#pricing" onClick={scrollToPricing} className="text-gray-600 hover:text-blue-600 transition-colors hidden md:block">
              {t("nav.pricing")}
            </a>
            {/* Language switcher - временно отключено */}
            {/* <LanguageSwitcher /> */}
            {/* Auth button */}
            {!authLoading && (
              user ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {user.user_metadata?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 glass-card-strong p-2 shadow-lg z-50">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.user_metadata?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={navigateToDashboard}
                        disabled={navigatingToDashboard}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg mt-1 flex items-center gap-2 disabled:opacity-50"
                      >
                        {navigatingToDashboard ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Loading...
                          </>
                        ) : (
                          <>
                            <img src="/images/icons/book.png" alt="" className="w-4 h-4 inline" /> {t("nav.myStories")}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => { signOut(); setShowUserMenu(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        {t("nav.signOut")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <MagneticButton
                  onClick={() => { setAuthModalMode("signin"); setShowAuthModal(true); }}
                  className="btn-glow px-4 sm:px-6 py-2 sm:py-2.5 text-white font-medium text-sm sm:text-base hidden sm:block"
                  strength={0.3}
                >
                  {t("nav.signIn")}
                </MagneticButton>
              )
            )}
            {/* Day/Night toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/50 text-gray-700"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 glass-card p-4 flex flex-col gap-3">
            <a href="#problems" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 py-2 px-4 rounded-xl hover:bg-white/50 transition-colors">
              {t("nav.problems")}
            </a>
            <a href="#how" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 py-2 px-4 rounded-xl hover:bg-white/50 transition-colors">
              {t("nav.howItWorks")}
            </a>
            <a href="#pricing" onClick={(e) => { setMobileMenuOpen(false); scrollToPricing(e); }} className="text-gray-700 py-2 px-4 rounded-xl hover:bg-white/50 transition-colors">
              {t("nav.pricing")}
            </a>
            {/* Day/Night toggle for mobile */}
            <div className="py-2 px-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">Night Mode</span>
              <ThemeToggle />
            </div>
            {/* Language switcher - временно отключено */}
            {/* <div className="py-2 px-4">
              <LanguageSwitcher />
            </div> */}
            {user ? (
              <div className="pt-2 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-medium">
                    {user.user_metadata?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user.user_metadata?.name || "User"}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={navigateToDashboard}
                    disabled={navigatingToDashboard}
                    className="flex-1 py-2 px-4 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {navigatingToDashboard ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        <img src="/images/icons/book.png" alt="" className="w-4 h-4 inline" /> {t("nav.myStories")}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                    className="py-2 px-4 text-red-600 text-sm font-medium"
                  >
                    {t("nav.signOut")}
                  </button>
                </div>
              </div>
            ) : (
              <MagneticButton
                onClick={() => { setAuthModalMode("signin"); setShowAuthModal(true); setMobileMenuOpen(false); }}
                className="btn-glow px-6 py-3 text-white font-medium mt-2"
                strength={0.3}
              >
                {t("nav.signIn")}
              </MagneticButton>
            )}
          </div>
        )}
      </header>

      {/* ===== БЛОК 1: HERO ===== */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-12 sm:pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Left: Text content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 glass-card px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs sm:text-sm text-gray-600">{t("hero.badge")}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
              <AnimatedText text={t("hero.titlePart1")} delay={0.2} />
              <br className="sm:hidden" />
              <span className="sm:inline"> </span>
              <AnimatedText text={t("hero.titlePart2")} className="gradient-text" delay={0.8} />
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
              {t("hero.subtitle")}
            </p>

            {/* CTA */}
            <div className="flex flex-col gap-3 max-w-md mx-auto lg:mx-0">
              <MagneticLink
                href="#pricing"
                onClick={scrollToPricing}
                className="btn-glow px-6 sm:px-8 py-3 sm:py-4 text-white font-semibold text-base sm:text-lg inline-flex items-center justify-center gap-2 whitespace-nowrap"
                strength={0.4}
              >
                <span>{t("hero.cta")}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </MagneticLink>
              <div className="flex items-center gap-1.5 sm:gap-2 justify-center text-xs sm:text-sm text-gray-500">
                <span className="text-blue-500">✓</span>
                <span>{t("hero.ctaHint")}</span>
              </div>
            </div>
          </div>

          {/* Right: Hero illustration */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[280px] sm:max-w-none">
              {/* Blue glow behind photo */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-300/50 to-blue-500/30 rounded-full blur-3xl scale-110" />
              {/* Hero image */}
              <img
                src="/images/hero-photo.jpg"
                alt="FairyTale AI"
                className="relative w-full sm:w-[400px] md:w-[500px] lg:w-[550px] h-auto rounded-2xl sm:rounded-3xl shadow-2xl"
              />

              {/* Floating labels */}
              <div className="absolute -top-4 -left-8 glass-card px-3 py-2 floating hidden md:block" style={{ animationDelay: "1s" }}>
                <span className="text-sm flex items-center gap-1"><img src="/images/icons/microphone.png" alt="" className="w-4 h-4" /> {t("hero.floatingVoice")}</span>
              </div>
              <div className="absolute top-20 -right-12 glass-card px-3 py-2 floating hidden md:block" style={{ animationDelay: "2s" }}>
                <span className="text-sm flex items-center gap-1"><img src="/images/icons/brain.png" alt="" className="w-4 h-4" /> {t("hero.floatingAI")}</span>
              </div>
              <div className="absolute bottom-20 -left-16 glass-card px-3 py-2 floating hidden lg:block" style={{ animationDelay: "3s" }}>
                <span className="text-sm">💜 {t("hero.floatingTherapy")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOCK 2: PROBLEMS ===== */}
      {/* TEMPORARILY HIDDEN
      <section id="problems" className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            <AnimatedWords text="Sound" scrollTrigger /> <AnimatedWords text="familiar?" className="gradient-text" scrollTrigger />
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            You genuinely want to give your child the best. But in the endless stream of tasks and exhaustion, parenting often takes a back seat, giving way to chaos:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          <div className="glass-card p-5 sm:p-6 hover:scale-[1.02] transition-transform duration-300 group overflow-hidden">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
              <span className="text-2xl">📺</span>
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-2 text-base sm:text-lg">Useless Screen Time</h3>
            <p className="text-gray-600 text-sm">
              Kids spend hours watching YouTube that doesn&apos;t develop them — it &quot;zombifies&quot; them. You see their curiosity fading, but don&apos;t know what to replace the tablet with that would be equally engaging.
            </p>
          </div>

          <div className="glass-card p-5 sm:p-6 hover:scale-[1.02] transition-transform duration-300 group overflow-hidden">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
              <span className="text-2xl">📉</span>
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-2 text-base sm:text-lg">Chaos Instead of System</h3>
            <p className="text-gray-600 text-sm">
              You buy educational toys, try different classes, but give up. There&apos;s no clear plan: how exactly to develop ambition and leadership qualities in your child.
            </p>
          </div>

          <div className="glass-card p-5 sm:p-6 hover:scale-[1.02] transition-transform duration-300 group overflow-hidden">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
              <span className="text-2xl">💔</span>
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-2 text-base sm:text-lg">The &quot;I&apos;ll Have Time&quot; Illusion</h3>
            <p className="text-gray-600 text-sm">
              It seems like your child will be little forever. But science says otherwise — there&apos;s almost no time left. The window for forming core values is closing fast.
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 max-w-3xl mx-auto">
          <div className="glass-card-strong p-5 sm:p-8 text-center">
            <p className="text-base sm:text-lg text-gray-700 mb-3 sm:mb-4">
              <span className="font-bold text-gray-900">Kids don&apos;t hear lectures.</span> Their brains are wired to learn through play and imagery.
            </p>
            <p className="text-blue-600 font-semibold text-sm sm:text-base">
              Yelling is useless — you need to tell stories.
            </p>
          </div>
        </div>
      </section>
      END TEMPORARILY HIDDEN */}

      {/* Why Now Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden glass-card-strong p-6 sm:p-10 md:p-12 border-2 border-sky-200">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-10 left-10 w-32 h-32 bg-sky-300/30 rounded-full blur-3xl floating" />
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-300/30 rounded-full blur-3xl floating" style={{ animationDelay: "1s" }} />
              <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-cyan-300/20 rounded-full blur-2xl floating" style={{ animationDelay: "2s" }} />
            </div>

            {/* Header */}
            <div className="relative text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-100 to-blue-100 px-4 py-2 rounded-full mb-4 border border-sky-200">
                <span className="text-xl">⏰</span>
                <span className="text-blue-700 text-sm font-medium">{t("criticalWindow.badge")}</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {t.rich("criticalWindow.title", {
                  highlight: (chunks) => <span className="gradient-text">{chunks}</span>
                })}
              </h3>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                {t.rich("criticalWindow.subtitle", {
                  bold: (chunks) => <span className="font-bold text-gray-900">{chunks}</span>
                })}
              </p>
            </div>

            {/* Facts Grid */}
            <div className="relative grid md:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {/* Fact 1 - Harvard */}
              <div className="group glass-card p-5 sm:p-6 hover:shadow-lg transition-all hover:scale-105 duration-300 border border-sky-100">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform mx-auto sm:mx-0">
                  <span className="text-3xl">🧒</span>
                </div>
                <div className="text-center sm:text-left">
                  <div className="inline-flex items-center gap-1 bg-sky-100 px-2 py-1 rounded-full mb-2">
                    <span className="text-xs text-sky-700 font-medium">{t("criticalWindow.fact1Badge")}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">{t("criticalWindow.fact1Title")}</h4>
                  <p className="text-gray-600 text-sm">
                    {t.rich("criticalWindow.fact1Text", {
                      bold: (chunks) => <span className="text-gray-900 font-semibold">{chunks}</span>,
                      highlight: (chunks) => <span className="text-blue-600 font-semibold">{chunks}</span>
                    })}
                  </p>
                </div>
              </div>

              {/* Fact 2 - Attachment */}
              <div className="group glass-card p-5 sm:p-6 hover:shadow-lg transition-all hover:scale-105 duration-300 border border-sky-100">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform mx-auto sm:mx-0">
                  <span className="text-3xl">🔐</span>
                </div>
                <div className="text-center sm:text-left">
                  <div className="inline-flex items-center gap-1 bg-cyan-100 px-2 py-1 rounded-full mb-2">
                    <span className="text-xs text-cyan-700 font-medium">{t("criticalWindow.fact2Badge")}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">{t("criticalWindow.fact2Title")}</h4>
                  <p className="text-gray-600 text-sm">
                    {t.rich("criticalWindow.fact2Text", {
                      bold: (chunks) => <span className="text-gray-900 font-semibold">{chunks}</span>,
                      danger: (chunks) => <span className="text-red-500 font-semibold">{chunks}</span>
                    })}
                  </p>
                </div>
              </div>

              {/* Fact 3 - Bitter Truth */}
              <div className="group glass-card p-5 sm:p-6 hover:shadow-lg transition-all hover:scale-105 duration-300 border border-sky-100">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform mx-auto sm:mx-0">
                  <span className="text-3xl">⚠️</span>
                </div>
                <div className="text-center sm:text-left">
                  <div className="inline-flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-full mb-2">
                    <span className="text-xs text-amber-700 font-medium">{t("criticalWindow.fact3Badge")}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">{t("criticalWindow.fact3Title")}</h4>
                  <p className="text-gray-600 text-sm">
                    {t.rich("criticalWindow.fact3Text", {
                      danger: (chunks) => <span className="text-red-500 font-semibold">{chunks}</span>
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="relative text-center">
              <p className="text-gray-700 text-base sm:text-lg font-medium mb-4">
                {t.rich("criticalWindow.ctaText", {
                  highlight: (chunks) => <span className="gradient-text font-bold">{chunks}</span>
                })}
              </p>
              <MagneticLink
                href="#pricing"
                onClick={scrollToPricing}
                className="btn-glow px-6 sm:px-8 py-3 sm:py-4 text-white font-bold text-base sm:text-lg inline-flex items-center gap-2"
                strength={0.4}
              >
                <span>{t("criticalWindow.ctaButton")}</span>
                <span className="text-xl">💙</span>
              </MagneticLink>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOCK: THE SOLUTION ===== */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main headline */}
            <div className="mb-8 sm:mb-12">
              <div className="inline-block mb-4">
                <span className="text-5xl sm:text-6xl md:text-7xl drop-shadow-lg">🏰</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                {t("solution.title")}
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                {t.rich("solution.subtitle", {
                  highlight: (chunks) => <span className="font-bold text-blue-600">{chunks}</span>
                })}
              </p>
            </div>

            {/* Features as floating cards */}
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16">
              {/* Feature 1 */}
              <div className="glass-card p-5 sm:p-6 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 text-center">
                <div className="mb-3 flex justify-center"><img src="/images/icons/book.png" alt="Book" className="w-12 h-12 sm:w-14 sm:h-14" /></div>
                <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">{t("solution.feature1Title")}</h3>
                <p className="text-gray-600 text-sm">
                  {t("solution.feature1Text")}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-card p-5 sm:p-6 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 sm:mt-8 text-center">
                <div className="mb-3 flex justify-center"><img src="/images/icons/magic-wand.png" alt="" className="w-12 h-12 sm:w-14 sm:h-14" /></div>
                <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">{t("solution.feature2Title")}</h3>
                <p className="text-gray-600 text-sm">
                  {t.rich("solution.feature2Text", {
                    highlight: (chunks) => <span className="font-bold text-amber-600">{chunks}</span>
                  })}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass-card p-5 sm:p-6 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 text-center">
                <div className="mb-3 flex justify-center"><img src="/images/icons/brain.png" alt="" className="w-12 h-12 sm:w-14 sm:h-14" /></div>
                <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">{t("solution.feature3Title")}</h3>
                <p className="text-gray-600 text-sm">
                  {t.rich("solution.feature3Text", {
                    highlight: (chunks) => <span className="font-semibold">{chunks}</span>
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOCK: HOW FAIRYTALE AI WORKS ===== */}
      <section className="relative z-10 py-16 sm:py-24 bg-gradient-to-b from-white via-amber-50/30 to-white dark:from-[#1a1a1a] dark:via-[#1f1f1f] dark:to-[#1a1a1a]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              <AnimatedLine text={t("howItWorks.title1")} scrollTrigger /> <AnimatedLine text={t("howItWorks.title2")} className="gradient-text" scrollTrigger />
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
              {t("howItWorks.subtitle")}
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {/* Step 1: Create Hero Profile */}
              <div className="glass-card-strong p-6 sm:p-8 relative group hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                  1
                </div>
                {/* Image placeholder for step 1 */}
                <div className="w-full h-32 sm:h-40 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl mb-4 mt-4 flex items-center justify-center overflow-hidden">
                  <img src="/images/steps/step1-profile.png" alt="Create Hero Profile" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-5xl">👤</span>'; }} />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {t("howItWorks.step1Title")}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {t("howItWorks.step1Text")}
                </p>
              </div>

              {/* Step 2: Get Weekly Script */}
              <div className="glass-card-strong p-6 sm:p-8 relative group hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                  2
                </div>
                {/* Image placeholder for step 2 */}
                <div className="w-full h-32 sm:h-40 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl mb-4 mt-4 flex items-center justify-center overflow-hidden">
                  <img src="/images/steps/step2-script.png" alt="Get Weekly Script" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-5xl">📜</span>'; }} />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {t("howItWorks.step2Title")}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {t("howItWorks.step2Text")}
                </p>
              </div>

              {/* Step 3: Read & Connect Screen-Free */}
              <div className="glass-card-strong p-6 sm:p-8 relative group hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                  3
                </div>
                {/* Image placeholder for step 3 */}
                <div className="w-full h-32 sm:h-40 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl mb-4 mt-4 flex items-center justify-center overflow-hidden">
                  <img src="/images/steps/step3-reading.png" alt="Read & Connect" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-5xl">📖</span>'; }} />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {t("howItWorks.step3Title")}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {t("howItWorks.step3Text")}
                </p>
              </div>

              {/* Step 4: Watch the Transformation */}
              <div className="glass-card-strong p-6 sm:p-8 relative group hover:shadow-xl transition-all duration-300 border-2 border-emerald-200">
                <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                  4
                </div>
                {/* Image placeholder for step 4 */}
                <div className="w-full h-32 sm:h-40 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl mb-4 mt-4 flex items-center justify-center overflow-hidden">
                  <img src="/images/steps/step4-dashboard.png" alt="Watch Transformation" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-5xl">📊</span>'; }} />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {t("howItWorks.step4Title")}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {t("howItWorks.step4Text")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOCK: PARENT VALUE (Partnership with Parent) ===== */}
      <section className="relative z-10 py-16 sm:py-24 bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-[#1a1a1a] dark:via-[#1f1f1f] dark:to-[#1a1a1a]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10 sm:mb-16">
              <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-4">
                <span className="text-xl">🤝</span>
                <span className="text-sm text-gray-600 font-medium">{t("partnership.badge")}</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t("partnership.title1")} <br className="hidden sm:block" />
                {t("partnership.title2")} <span className="gradient-text">{t("partnership.title3")}</span>.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {/* Card 1: Full Transparency (Dashboard) */}
              <div className="glass-card-strong p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center mb-5 shadow-lg">
                  <img src="/images/icons/chart.png" alt="" className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  {t("partnership.transparencyTitle")}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mb-5">
                  {t.rich("partnership.transparencyText", {
                    highlight: (chunks) => <span className="font-semibold text-gray-900">{chunks}</span>
                  })}
                </p>

                {/* Dashboard Mock */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl">
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                        <img src="/images/icons/magic-wand.png" alt="" className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-medium">{t("partnership.progressTitle")}</p>
                        <p className="text-slate-400 text-[10px]">{t("partnership.progressWeek")}</p>
                      </div>
                    </div>
                    <div className="text-[10px] text-emerald-400 bg-emerald-400/20 px-2 py-0.5 rounded-full">● {t("partnership.live")}</div>
                  </div>

                  {/* Circular Progress Charts */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                    {/* Empathy */}
                    <div className="text-center">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-1">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#374151" strokeWidth="4" />
                          <circle
                            cx="50%" cy="50%" r="45%" fill="none"
                            stroke="url(#empathyGradient)" strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray="283"
                            strokeDashoffset="70"
                            className="transition-all duration-1000"
                          />
                          <defs>
                            <linearGradient id="empathyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#f472b6" />
                              <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs sm:text-sm font-bold">75%</span>
                        </div>
                      </div>
                      <p className="text-slate-300 text-[10px] sm:text-xs">{t("partnership.empathy")}</p>
                      <p className="text-pink-400 text-[10px] font-semibold">+15%</p>
                    </div>

                    {/* Confidence */}
                    <div className="text-center">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-1">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#374151" strokeWidth="4" />
                          <circle
                            cx="50%" cy="50%" r="45%" fill="none"
                            stroke="url(#confidenceGradient)" strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray="283"
                            strokeDashoffset="42"
                            className="transition-all duration-1000"
                          />
                          <defs>
                            <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#60a5fa" />
                              <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs sm:text-sm font-bold">85%</span>
                        </div>
                      </div>
                      <p className="text-slate-300 text-[10px] sm:text-xs">{t("partnership.confidence")}</p>
                      <p className="text-indigo-400 text-[10px] font-semibold">+20%</p>
                    </div>

                    {/* Socialization */}
                    <div className="text-center">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-1">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#374151" strokeWidth="4" />
                          <circle
                            cx="50%" cy="50%" r="45%" fill="none"
                            stroke="url(#socialGradient)" strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray="283"
                            strokeDashoffset="113"
                            className="transition-all duration-1000"
                          />
                          <defs>
                            <linearGradient id="socialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#34d399" />
                              <stop offset="100%" stopColor="#14b8a6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs sm:text-sm font-bold">60%</span>
                        </div>
                      </div>
                      <p className="text-slate-300 text-[10px] sm:text-xs">{t("partnership.social")}</p>
                      <p className="text-teal-400 text-[10px] font-semibold">+10%</p>
                    </div>
                  </div>

                  {/* Current Focus */}
                  <div className="bg-slate-700/50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                      <p className="text-slate-300 text-[10px] uppercase tracking-wider">{t("partnership.currentlyWorkingOn")}</p>
                    </div>
                    <p className="text-white text-xs sm:text-sm font-medium">{t("partnership.currentTask")}</p>
                  </div>
                </div>

                <p className="text-sm text-indigo-600 font-medium mt-4">
                  {t("partnership.dashboardNote")}
                </p>
              </div>

              {/* Card 2: Foundation of Friendship */}
              <div className="glass-card-strong p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-5 shadow-lg">
                  <span className="text-2xl sm:text-3xl">💛</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  {t("partnership.friendshipTitle")}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mb-5">
                  {t.rich("partnership.friendshipText", {
                    highlight: (chunks) => <span className="font-semibold text-gray-900">{chunks}</span>
                  })}
                </p>

                {/* Visual representation */}
                <div className="glass-card p-5 text-center">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-3xl shadow-md">
                      👧
                    </div>
                    <div className="text-3xl text-amber-400">💛</div>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-3xl shadow-md">
                      👩
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {t.rich("partnership.friendshipNote", {
                      highlight: (chunks) => <span className="text-amber-600 font-semibold">{chunks}</span>
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOCK: 12-MONTH PROGRAM JOURNEY ===== */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-4">
            <span className="text-xl">🗺</span>
            <span className="text-sm text-gray-600 font-medium">{t("program.badge")}</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            <AnimatedText text={t("program.title1")} scrollTrigger type="fade" /><AnimatedText text={t("program.title2")} className="gradient-text" scrollTrigger type="chars" />
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            {t("program.subtitle")}
          </p>
        </div>

        {/* Program Blocks Accordion */}
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Block 1: EQ Foundation */}
          <div className="glass-card-strong overflow-hidden">
            <button
              onClick={() => setOpenProgramBlock(openProgramBlock === 0 ? null : 0)}
              className="w-full p-5 sm:p-6 flex items-center gap-4 text-left hover:bg-white/50 transition-colors"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-2xl sm:text-3xl shadow-lg flex-shrink-0">
                🟡
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">{t("program.block1.months")}</span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900">{t("program.block1.title")}</h3>
                <p className="text-sm text-gray-600 hidden sm:block">{t("program.block1.shortDesc")}</p>
              </div>
              <span className={`text-gray-400 accordion-arrow flex-shrink-0 ${openProgramBlock === 0 ? "open" : ""}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            <div className={`accordion-content ${openProgramBlock === 0 ? "open" : ""}`}>
              <div className="accordion-inner">
                <div className="px-5 sm:px-6 pb-6 border-t border-gray-100">
                <div className="pt-5 space-y-4">
                  {/* Goal statement */}
                  <div className="glass-card p-4 bg-amber-50/50 border border-amber-100">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">{t("program.block1.whyMatters")}</span> {t("program.block1.whyMattersText")}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-semibold">{t("program.block1.ourGoal")}</span> {t("program.block1.ourGoalText")}
                    </p>
                  </div>
                  {/* Months */}
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-amber-600 mb-2">Month 1</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{t("program.block1.month1Title")}</h4>
                      <p className="text-xs text-gray-600 mb-2">{t("program.block1.month1Text")}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t("program.block1.month1Tag")}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-amber-600 mb-2">Month 2</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{t("program.block1.month2Title")}</h4>
                      <p className="text-xs text-gray-600 mb-2">{t("program.block1.month2Text")}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t("program.block1.month2Tag")}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-amber-600 mb-2">Month 3</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{t("program.block1.month3Title")}</h4>
                      <p className="text-xs text-gray-600 mb-2">{t("program.block1.month3Text")}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t("program.block1.month3Tag")}</span>
                    </div>
                  </div>
                  {/* Results */}
                  <div className="glass-card p-4 bg-green-50/50 border border-green-100">
                    <p className="text-xs font-semibold text-green-800 mb-3 flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> {t("program.block1.resultsTitle")}</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm text-green-700">
                        <span className="flex-shrink-0 mt-0.5">✅</span>
                        <span>{t("program.block1.result1")}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-green-700">
                        <span className="flex-shrink-0 mt-0.5">✅</span>
                        <span>{t("program.block1.result2")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Block 2: Social Intelligence */}
          <div className="glass-card-strong overflow-hidden">
            <button
              onClick={() => setOpenProgramBlock(openProgramBlock === 1 ? null : 1)}
              className="w-full p-5 sm:p-6 flex items-center gap-4 text-left hover:bg-white/50 transition-colors"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-2xl sm:text-3xl shadow-lg flex-shrink-0">
                🔵
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{t("program.block2.months")}</span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900">{t("program.block2.title")}</h3>
                <p className="text-sm text-gray-600 hidden sm:block">{t("program.block2.shortDesc")}</p>
              </div>
              <span className={`text-gray-400 accordion-arrow flex-shrink-0 ${openProgramBlock === 1 ? "open" : ""}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            <div className={`accordion-content ${openProgramBlock === 1 ? "open" : ""}`}>
              <div className="accordion-inner">
                <div className="px-5 sm:px-6 pb-6 border-t border-gray-100">
                  <div className="pt-5 space-y-4">
                    <div className="glass-card p-4 bg-blue-50/50 border border-blue-100">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">{t("program.block2.challenge")}</span> {t("program.block2.challengeText")}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-semibold">{t("program.block2.ourGoal")}</span> {t("program.block2.ourGoalText")}
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-blue-600 mb-2">Month 4</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{t("program.block2.month4Title")}</h4>
                      <p className="text-xs text-gray-600 mb-2">{t("program.block2.month4Text")}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t("program.block2.month4Tag")}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-blue-600 mb-2">Month 5</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{t("program.block2.month5Title")}</h4>
                      <p className="text-xs text-gray-600 mb-2">{t("program.block2.month5Text")}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t("program.block2.month5Tag")}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-blue-600 mb-2">Month 6</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{t("program.block2.month6Title")}</h4>
                      <p className="text-xs text-gray-600 mb-2">{t("program.block2.month6Text")}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t("program.block2.month6Tag")}</span>
                    </div>
                  </div>
                  <div className="glass-card p-4 bg-green-50/50 border border-green-100">
                    <p className="text-xs font-semibold text-green-800 mb-3 flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> {t("program.block2.resultsTitle")}</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm text-green-700">
                        <span className="flex-shrink-0 mt-0.5">✅</span>
                        <span>{t("program.block2.result1")}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-green-700">
                        <span className="flex-shrink-0 mt-0.5">✅</span>
                        <span>{t("program.block2.result2")}</span>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Block 3: Discipline & Will */}
          <div className="glass-card-strong overflow-hidden">
            <button
              onClick={() => setOpenProgramBlock(openProgramBlock === 2 ? null : 2)}
              className="w-full p-5 sm:p-6 flex items-center gap-4 text-left hover:bg-white/50 transition-colors"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-2xl sm:text-3xl shadow-lg flex-shrink-0">
                🟢
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">{t("program.block3.months")}</span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900">{t("program.block3.title")}</h3>
                <p className="text-sm text-gray-600 hidden sm:block">{t("program.block3.shortDesc")}</p>
              </div>
              <span className={`text-gray-400 accordion-arrow flex-shrink-0 ${openProgramBlock === 2 ? "open" : ""}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            <div className={`accordion-content ${openProgramBlock === 2 ? "open" : ""}`}>
              <div className="accordion-inner">
                <div className="px-5 sm:px-6 pb-6 border-t border-gray-100">
                  <div className="pt-5 space-y-4">
                    <div className="glass-card p-4 bg-green-50/50 border border-green-100">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">{t("program.block3.battle")}</span> {t("program.block3.battleText")}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-semibold">{t("program.block3.ourGoal")}</span> {t("program.block3.ourGoalText")}
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-green-600 mb-2">Month 7</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{t("program.block3.month7Title")}</h4>
                      <p className="text-xs text-gray-600 mb-2">{t("program.block3.month7Text")}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t("program.block3.month7Tag")}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-green-600 mb-2">Month 8</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{t("program.block3.month8Title")}</h4>
                      <p className="text-xs text-gray-600 mb-2">{t("program.block3.month8Text")}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t("program.block3.month8Tag")}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-green-600 mb-2">Month 9</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{t("program.block3.month9Title")}</h4>
                      <p className="text-xs text-gray-600 mb-2">{t("program.block3.month9Text")}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t("program.block3.month9Tag")}</span>
                    </div>
                  </div>
                  <div className="glass-card p-4 bg-green-50/50 border border-green-100">
                    <p className="text-xs font-semibold text-green-800 mb-3 flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> {t("program.block3.resultsTitle")}</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm text-green-700">
                        <span className="flex-shrink-0 mt-0.5">✅</span>
                        <span>{t("program.block3.result1")}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-green-700">
                        <span className="flex-shrink-0 mt-0.5">✅</span>
                        <span>{t("program.block3.result2")}</span>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Block 4: Leadership & Character */}
          <div className="glass-card-strong overflow-hidden">
            <button
              onClick={() => setOpenProgramBlock(openProgramBlock === 3 ? null : 3)}
              className="w-full p-5 sm:p-6 flex items-center gap-4 text-left hover:bg-white/50 transition-colors"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-2xl sm:text-3xl shadow-lg flex-shrink-0">
                🟣
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">{t("program.block4.months")}</span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900">{t("program.block4.title")}</h3>
                <p className="text-sm text-gray-600 hidden sm:block">{t("program.block4.shortDesc")}</p>
              </div>
              <span className={`text-gray-400 accordion-arrow flex-shrink-0 ${openProgramBlock === 3 ? "open" : ""}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            <div className={`accordion-content ${openProgramBlock === 3 ? "open" : ""}`}>
              <div className="accordion-inner">
                <div className="px-5 sm:px-6 pb-6 border-t border-gray-100">
                  <div className="pt-5 space-y-4">
                    <div className="glass-card p-4 bg-purple-50/50 border border-purple-100">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">{t("program.block4.prep")}</span> {t("program.block4.prepText")}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-semibold">{t("program.block4.ourGoal")}</span> {t("program.block4.ourGoalText")}
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-purple-600 mb-2">Month 10</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{t("program.block4.month10Title")}</h4>
                      <p className="text-xs text-gray-600 mb-2">{t("program.block4.month10Text")}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t("program.block4.month10Tag")}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-purple-600 mb-2">Month 11</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{t("program.block4.month11Title")}</h4>
                      <p className="text-xs text-gray-600 mb-2">{t("program.block4.month11Text")}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t("program.block4.month11Tag")}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-purple-600 mb-2">Month 12</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{t("program.block4.month12Title")}</h4>
                      <p className="text-xs text-gray-600 mb-2">{t("program.block4.month12Text")}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t("program.block4.month12Tag")}</span>
                    </div>
                  </div>
                  <div className="glass-card p-4 bg-green-50/50 border border-green-100">
                    <p className="text-xs font-semibold text-green-800 mb-3 flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> {t("program.block4.resultsTitle")}</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm text-green-700">
                        <span className="flex-shrink-0 mt-0.5">✅</span>
                        <span>{t("program.block4.result1")}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-green-700">
                        <span className="flex-shrink-0 mt-0.5">✅</span>
                        <span>{t("program.block4.result2")}</span>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Year Summary */}
        <div className="max-w-4xl mx-auto mt-8 sm:mt-12">
          <div className="glass-card-strong p-6 sm:p-8 text-center bg-gradient-to-r from-amber-50 via-purple-50 to-blue-50">
            <div className="mb-4"><img src="/images/icons/trophy.png" alt="" className="w-12 h-12 mx-auto" /></div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              {t("program.yearSummaryTitle")}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              {t.rich("program.yearSummaryText", {
                highlight: (chunks) => <span className="font-semibold">{chunks}</span>
              })}
            </p>
          </div>
        </div>
      </section>

      {/* ===== BLOCK: CURRICULUM (Topics of the Year) ===== */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-4">
            <img src="/images/icons/book.png" alt="" className="w-6 h-6" />
            <span className="text-sm text-gray-600 font-medium">{t("curriculum.badge")}</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.rich("curriculum.title", {
              highlight: (chunks) => <span className="gradient-text">{chunks}</span>
            })}
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            {t("curriculum.subtitle")}
          </p>
        </div>

        {/* 5 Topics Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {/* Topic 1: Emotional Intelligence */}
          <div className="glass-card-strong p-5 sm:p-6 text-center hover:scale-105 hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <img src="/images/icons/mask.png" alt="" className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h3 className="font-display font-bold text-gray-900 text-base sm:text-lg mb-2">
              {t("curriculum.topic1Title")}
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              {t("curriculum.topic1Text")}
            </p>
          </div>

          {/* Topic 2: Personal Boundaries */}
          <div className="glass-card-strong p-5 sm:p-6 text-center hover:scale-105 hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-3xl sm:text-4xl">🛡️</span>
            </div>
            <h3 className="font-display font-bold text-gray-900 text-base sm:text-lg mb-2">
              {t("curriculum.topic2Title")}
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              {t("curriculum.topic2Text")}
            </p>
          </div>

          {/* Topic 3: Socialization */}
          <div className="glass-card-strong p-5 sm:p-6 text-center hover:scale-105 hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-3xl sm:text-4xl">👫</span>
            </div>
            <h3 className="font-display font-bold text-gray-900 text-base sm:text-lg mb-2">
              {t("curriculum.topic3Title")}
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              {t("curriculum.topic3Text")}
            </p>
          </div>

          {/* Topic 4: Goal Setting */}
          <div className="glass-card-strong p-5 sm:p-6 text-center hover:scale-105 hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <img src="/images/icons/target.png" alt="" className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h3 className="font-display font-bold text-gray-900 text-base sm:text-lg mb-2">
              {t("curriculum.topic4Title")}
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              {t("curriculum.topic4Text")}
            </p>
          </div>

          {/* Topic 5: Overcoming Fears */}
          <div className="glass-card-strong p-5 sm:p-6 text-center hover:scale-105 hover:-translate-y-2 transition-all duration-300 group sm:col-span-2 lg:col-span-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <img src="/images/icons/lion.png" alt="" className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h3 className="font-display font-bold text-gray-900 text-base sm:text-lg mb-2">
              {t("curriculum.topic5Title")}
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              {t("curriculum.topic5Text")}
            </p>
          </div>
        </div>

        {/* Bottom insight */}
        <div className="mt-10 sm:mt-12 max-w-3xl mx-auto">
          <div className="glass-card p-5 sm:p-6 text-center bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
            <p className="text-gray-700 text-sm sm:text-base">
              {t.rich("curriculum.bottomNote", {
                bold: (chunks) => <span className="font-bold text-gray-900">{chunks}</span>,
                highlight: (chunks) => <span className="gradient-text font-bold">{chunks}</span>
              })}
            </p>
          </div>
        </div>
      </section>

      {/* ===== BLOCK: TRANSFORM RESULTS ===== */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card-strong p-6 sm:p-10 md:p-12">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                {t.rich("transform.title", {
                  highlight: (chunks) => <span className="gradient-text">{chunks}</span>
                })}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                {t("transform.subtitle")}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
              {/* Benefit 1 */}
              <div className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">
                  🌿
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{t("transform.benefit1Title")}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {t("transform.benefit1Text")}
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">
                  🌊
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{t("transform.benefit2Title")}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {t("transform.benefit2Text")}
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">
                  🕊️
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{t("transform.benefit3Title")}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {t("transform.benefit3Text")}
                  </p>
                </div>
              </div>

              {/* Benefit 4 */}
              <div className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <img src="/images/icons/rocket.png" alt="" className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{t("transform.benefit4Title")}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {t("transform.benefit4Text")}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50">
              <div className="text-center">
                <p className="text-2xl sm:text-4xl font-bold gradient-text">{t("transform.stat1Value")}</p>
                <p className="text-xs sm:text-sm text-gray-600">{t("transform.stat1Label")}</p>
              </div>
              <div className="text-center border-x border-gray-200">
                <p className="text-2xl sm:text-4xl font-bold gradient-text">{t("transform.stat2Value")}</p>
                <p className="text-xs sm:text-sm text-gray-600">{t("transform.stat2Label")}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-4xl font-bold gradient-text">{t("transform.stat3Value")}</p>
                <p className="text-xs sm:text-sm text-gray-600">{t("transform.stat3Label")}</p>
              </div>
            </div>

            {/* Final CTA within block */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                {t("transform.ctaText")}
              </p>
              <MagneticLink
                href="#pricing"
                onClick={scrollToPricing}
                className="btn-glow px-8 py-4 text-white font-semibold text-base sm:text-lg inline-flex items-center gap-2"
                strength={0.4}
              >
                <span>{t("transform.ctaButton")}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </MagneticLink>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOCK 9: DEMO ===== */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            {t.rich("demo.title", {
              highlight: (chunks) => <span className="gradient-text">{chunks}</span>
            })}
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            {t("demo.subtitle")}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="glass-card-strong p-4 sm:p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-start">
              {/* Left: Illustration and context */}
              <div className="relative">
                {/* Story illustration */}
                <div className="aspect-square rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-100 via-purple-50 to-sky-100 flex items-center justify-center overflow-hidden mb-4">
                  <div className="text-center p-4 sm:p-6">
                    <div className="mb-3 sm:mb-4"><img src="/images/icons/sparkle.png" alt="" className="w-16 h-16 sm:w-24 sm:h-24 mx-auto" /></div>
                    <p className="text-sm sm:text-base font-semibold text-gray-700">{t("demo.storyTitle")}</p>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-400 mb-4">
                  {t("demo.illustrationNote")}
                </p>

                {/* Case study context */}
                <div className="glass-card p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold text-sm">⚡</span>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">{t("demo.challenge")}</span>
                      <p className="text-sm font-medium text-gray-800">{t("demo.challengeText")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold text-sm">🎯</span>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">{t("demo.therapeuticGoal")}</span>
                      <p className="text-sm font-medium text-gray-800">{t("demo.therapeuticGoalText")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Player and text */}
              <div>
                {/* Audio player - premium design */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 sm:p-6 mb-5 shadow-2xl">
                  {/* Hidden audio element */}
                  <audio ref={audioRef} src="/audio/dictor.MP3" preload="metadata" />

                  {/* Voice label - premium */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="py-2 px-4 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg inline-flex items-center gap-2">
                      <span className="text-lg">🎙️</span> {t("demo.listenButton")}
                    </span>
                    <div className="text-[10px] text-emerald-400 bg-emerald-400/20 px-2 py-0.5 rounded-full">● LIVE</div>
                  </div>

                  {/* Play button and progress */}
                  <div className="flex items-center gap-3 sm:gap-4 mb-3">
                    <button
                      onClick={togglePlay}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform flex-shrink-0"
                    >
                      {isPlaying ? (
                        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      {/* Progress bar */}
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                          style={{ width: audioDuration ? `${(audioProgress / audioDuration) * 100}%` : "0%" }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>{formatTime(audioProgress)}</span>
                        <span>{formatTime(audioDuration || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Subtext about voice cloning */}
                  <p className="text-xs text-slate-400 italic text-center">
                    {t("demo.listenSubtext")}
                  </p>
                </div>

                {/* Story excerpt - premium card */}
                <div className="glass-card p-4 sm:p-5 mb-5 border-l-4 border-indigo-400">
                  <p className="text-gray-700 text-sm sm:text-base italic leading-relaxed whitespace-pre-line">
                    {t("demo.storyExcerpt")}
                  </p>
                </div>

                {/* Feature cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">✨</span>
                      <h4 className="font-semibold text-gray-900 text-sm">{t("demo.feature1Title")}</h4>
                    </div>
                    <p className="text-xs text-gray-600">{t("demo.feature1Text")}</p>
                  </div>
                  <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">😴</span>
                      <h4 className="font-semibold text-gray-900 text-sm">{t("demo.feature2Title")}</h4>
                    </div>
                    <p className="text-xs text-gray-600">{t("demo.feature2Text")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOCK 5: SAFETY & TRUST ===== */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            {t.rich("safety.title", {
              highlight: (chunks) => <span className="gradient-text">{chunks}</span>
            })}
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            {t("safety.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
          {/* Trust 1 */}
          <div className="glass-card-strong p-5 sm:p-8 text-center hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <span className="text-2xl sm:text-3xl">🛡️</span>
            </div>
            <h3 className="font-display text-base sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              {t("safety.trust1Title")}
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              {t("safety.trust1Text")}
            </p>
          </div>

          {/* Trust 2 */}
          <div className="glass-card-strong p-5 sm:p-8 text-center hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <img src="/images/icons/brain.png" alt="" className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h3 className="font-display text-base sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              {t("safety.trust2Title")}
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              {t("safety.trust2Text")}
            </p>
          </div>

          {/* Trust 3 */}
          <div className="glass-card-strong p-5 sm:p-8 text-center hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <span className="text-2xl sm:text-3xl">👁️</span>
            </div>
            <h3 className="font-display text-base sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              {t("safety.trust3Title")}
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              {t("safety.trust3Text")}
            </p>
          </div>
        </div>

        {/* Testimonials preview */}
        <div className="mt-8 sm:mt-16 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="glass-card p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-sky-200 to-sky-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg sm:text-xl">👩</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">{t("safety.testimonial1Name")}</p>
                  <div className="flex text-yellow-400 text-xs sm:text-sm">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm italic">
                {t("safety.testimonial1Text")}
              </p>
            </div>

            <div className="glass-card p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg sm:text-xl">👨</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">{t("safety.testimonial2Name")}</p>
                  <div className="flex text-yellow-400 text-xs sm:text-sm">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm italic">
                {t("safety.testimonial2Text")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOCK 6: HERO JOURNEY CTA ===== */}
      <section id="pricing" className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Main CTA Card */}
          <div className="glass-card-strong p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5">
              <div className="absolute top-10 left-10 text-8xl">✨</div>
              <div className="absolute bottom-10 right-10 text-8xl">🌟</div>
            </div>

            <div className="relative z-10">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t.rich("finalCta.title", {
                  highlight: (chunks) => <span className="gradient-text">{chunks}</span>
                })}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
                {t("finalCta.subtitle")}
              </p>

              {/* Feature Grid */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8 text-left max-w-2xl mx-auto">
                <div className="bg-white/60 rounded-2xl p-4 border border-white/80">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🪄</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{t("finalCta.feature1Title")}</h4>
                      <p className="text-xs text-gray-600 mt-1">{t("finalCta.feature1Text")}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/60 rounded-2xl p-4 border border-white/80">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📚</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{t("finalCta.feature2Title")}</h4>
                      <p className="text-xs text-gray-600 mt-1">{t("finalCta.feature2Text")}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/60 rounded-2xl p-4 border border-white/80">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{t("finalCta.feature3Title")}</h4>
                      <p className="text-xs text-gray-600 mt-1">{t("finalCta.feature3Text")}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/60 rounded-2xl p-4 border border-white/80">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{t("finalCta.feature4Title")}</h4>
                      <p className="text-xs text-gray-600 mt-1">{t("finalCta.feature4Text")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <MagneticButton
                onClick={() => openPaymentModal("week")}
                className="btn-glow px-8 sm:px-12 py-4 text-white font-bold text-base sm:text-lg inline-block"
                strength={0.3}
              >
                {t("finalCta.button")}
              </MagneticButton>

              {/* Disclaimer */}
              <p className="text-xs text-gray-500 mt-4">
                {t("finalCta.disclaimer")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== OLD BLOCK 6: PRICING (SAVED) =====
      <section id="pricing-old" className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            <AnimatedWords text={t("pricing.title1")} scrollTrigger /> <AnimatedText text={t("pricing.title2")} className="gradient-text" scrollTrigger />
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          <div className="glass-card p-5 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="mb-2"><img src="/images/icons/magic-wand.png" alt="" className="w-10 h-10 mx-auto" /></div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-1">{t("pricing.freeTrial.name")}</h3>
              <p className="text-xs text-gray-500 mb-3">{t("pricing.freeTrial.subtitle")}</p>
              <div className="text-3xl sm:text-4xl font-bold text-green-600">{t("pricing.freeTrial.price")}</div>
              <p className="text-gray-500 text-xs mt-1">{t("pricing.freeTrial.period")}</p>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("pricing.features.program")}</span>
                <span className="text-gray-900 font-medium">{t("pricing.features.week1")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("pricing.features.stories")}</span>
                <span className="text-green-600 font-medium">✓ {t("pricing.features.threeStories")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("pricing.features.aiAudio")}</span>
                <span className="text-gray-400">{t("pricing.features.notIncluded")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("pricing.features.aiCartoon")}</span>
                <span className="text-gray-400">{t("pricing.features.notIncluded")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("pricing.features.methodology")}</span>
                <span className="text-gray-900 text-xs">{t("pricing.features.questionsBasic")}</span>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("pricing.features.analytics")}</span>
                <span className="text-gray-900 text-xs text-right flex items-center gap-1"><img src="/images/icons/chart.png" alt="" className="w-4 h-4" /> {t("pricing.features.weeklyReport")}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">{t("pricing.features.bonuses")}</span>
                <span className="text-gray-400">{t("pricing.features.noBonuses")}</span>
              </div>
            </div>

            <MagneticButton
              onClick={() => openPaymentModal("week")}
              className="block w-full btn-secondary py-3 text-center font-semibold text-gray-700 text-sm"
              strength={0.3}
            >
              {t("pricing.freeTrial.button")}
            </MagneticButton>
          </div>

          <div className="glass-card-strong p-5 sm:p-6 relative border-2 border-sky-300">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
              {t("pricing.monthly.popular")}
            </div>

            <div className="text-center mb-4 sm:mb-6 mt-2">
              <div className="mb-2"><img src="/images/icons/rocket.png" alt="" className="w-10 h-10 mx-auto" /></div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-1">{t("pricing.monthly.name")}</h3>
              <p className="text-xs text-gray-500 mb-3">{t("pricing.monthly.subtitle")}</p>
              <div className="text-3xl sm:text-4xl font-bold gradient-text">{t("pricing.monthly.price")}<span className="text-base text-gray-500 font-normal">{t("pricing.monthly.period")}</span></div>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("pricing.features.program")}</span>
                <span className="text-gray-900 font-medium">{t("pricing.features.fullMonth")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("pricing.features.stories")}</span>
                <span className="text-green-600 font-medium">✓ {t("pricing.features.unlimited")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("pricing.features.aiAudio")}</span>
                <span className="text-amber-600 font-medium flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> {t("pricing.features.extraStars")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("pricing.features.aiCartoon")}</span>
                <span className="text-amber-600 font-medium flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> {t("pricing.features.extraStars")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("pricing.features.methodology")}</span>
                <span className="text-gray-900 text-xs">{t("pricing.features.questionsFull")}</span>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("pricing.features.analytics")}</span>
                <span className="text-gray-900 text-xs text-right flex items-center gap-1"><img src="/images/icons/chart.png" alt="" className="w-4 h-4" /> {t("pricing.features.monthlyReport")}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">{t("pricing.features.bonuses")}</span>
                <span className="text-gray-400">{t("pricing.features.noBonuses")}</span>
              </div>
            </div>

            <MagneticButton
              onClick={() => openPaymentModal("monthly")}
              className="block w-full btn-glow py-3 text-center font-semibold text-white text-sm"
              strength={0.3}
            >
              {t("pricing.monthly.button")} <span className="line-through opacity-70">$29</span> $8
            </MagneticButton>
            <p className="text-center text-xs text-gray-400 mt-2">{t("pricing.monthly.firstMonth")}</p>
          </div>

          <div className="glass-card-strong p-5 sm:p-6 relative bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
              {t("pricing.yearly.bestValue")}
            </div>

            <div className="text-center mb-4 sm:mb-6 mt-2">
              <div className="mb-2"><img src="/images/icons/crown.png" alt="" className="w-10 h-10 mx-auto" /></div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-1">{t("pricing.yearly.name")}</h3>
              <p className="text-xs text-gray-500 mb-3">{t("pricing.yearly.subtitle")}</p>
              <div className="text-3xl sm:text-4xl font-bold text-amber-600">{t("pricing.yearly.price")}<span className="text-base text-gray-500 font-normal">{t("pricing.yearly.period")}</span></div>
              <p className="text-gray-500 text-xs mt-1">{t("pricing.yearly.savings")}</p>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-gray-600">{t("pricing.features.program")}</span>
                <span className="text-gray-900 font-medium">{t("pricing.features.fullYear")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-gray-600">{t("pricing.features.stories")}</span>
                <span className="text-green-600 font-medium">✓ {t("pricing.features.unlimited")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-gray-600">{t("pricing.features.aiAudio")}</span>
                <span className="text-amber-600 font-medium flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> {t("pricing.features.extraStars")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-gray-600">{t("pricing.features.aiCartoon")}</span>
                <span className="text-amber-600 font-medium flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> {t("pricing.features.extraStars")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-gray-600">{t("pricing.features.methodology")}</span>
                <span className="text-gray-900 text-xs">{t("pricing.features.questionsFull")}</span>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-amber-100">
                <span className="text-gray-600">{t("pricing.features.analytics")}</span>
                <span className="text-gray-900 text-xs text-right flex items-center gap-1"><img src="/images/icons/chart.png" alt="" className="w-4 h-4" /> {t("pricing.features.fullReports")}</span>
              </div>
              <div className="py-2">
                <span className="text-gray-600 block mb-2">{t("pricing.features.bonuses")}:</span>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-amber-700">
                    <img src="/images/icons/gift.png" alt="" className="w-4 h-4" />
                    <span>{t("pricing.features.certificate")}</span>
                  </div>
                </div>
              </div>
            </div>

            <MagneticButton
              onClick={() => openPaymentModal("yearly")}
              className="block w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 py-3 px-4 rounded-full text-center font-semibold text-white text-sm shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
              strength={0.3}
            >
              {t("pricing.yearly.button")} — $189
            </MagneticButton>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs sm:text-sm mt-6 sm:mt-8">
          All plans include full methodology based on SEL, CBT & Positive Discipline
        </p>
      </section>
      ===== END OLD PRICING BLOCK ===== */}

      {/* ===== BLOCK 7: FAQ ===== */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            {t("faq.title1")} <span className="gradient-text">{t("faq.title2")}</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {[
            { q: t("faq.q1"), a: t("faq.a1") },
            { q: t("faq.q2"), a: t("faq.a2") },
            { q: t("faq.q3"), a: t("faq.a3") },
            { q: t("faq.q4"), a: t("faq.a4") },
            { q: t("faq.q5"), a: t("faq.a5") },
            { q: t("faq.q6"), a: t("faq.a6") },
            { q: t("faq.q7"), a: t("faq.a7") }
          ].map((item, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left gap-3"
              >
                <span className="font-semibold text-gray-900 text-sm sm:text-base">{item.q}</span>
                <span className={`text-blue-500 accordion-arrow flex-shrink-0 ${openFaq === i ? "open" : ""}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div className={`accordion-content ${openFaq === i ? "open" : ""}`}>
                <div className="accordion-inner">
                  <div className="px-4 sm:px-6 pb-3 sm:pb-4 text-gray-600 text-sm sm:text-base whitespace-pre-line">
                    {item.a}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="glass-card p-4 sm:p-8">
          <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                <img src="/images/icons/magic-wand.png" alt="" className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-gray-800">FairyTaleAI</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
              <Link href="/policy" className="hover:text-blue-600 transition-colors">{t("footer.privacy")}</Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">{t("footer.terms")}</Link>
              <Link href="/offer" className="hover:text-blue-600 transition-colors">{t("footer.offer")}</Link>
              <a href="mailto:support@fairytaleaitech.com" className="hover:text-blue-600 transition-colors">{t("footer.contact")}</a>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={() => setShowPaymentModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative glass-card-strong p-6 sm:p-8 max-w-md w-full mx-2 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${
                selectedPlan === "week"
                  ? "bg-gradient-to-br from-gray-400 to-gray-600"
                  : selectedPlan === "yearly"
                    ? "bg-gradient-to-br from-amber-400 to-yellow-500"
                    : "bg-gradient-to-br from-sky-400 to-blue-600"
              }`}>
                <img
                  src={selectedPlan === "week" ? "/images/icons/magic-wand.png" : selectedPlan === "yearly" ? "/images/icons/trophy.png" : "/images/icons/rocket.png"}
                  alt=""
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {selectedPlan === "week"
                  ? t("paymentModal.freeTrialTitle")
                  : selectedPlan === "yearly"
                    ? t("paymentModal.yearlyTitle")
                    : t("paymentModal.monthlyTitle")}
              </h3>
              <p className="text-gray-500 text-sm mb-3">
                {selectedPlan === "week"
                  ? t("paymentModal.freeTrialSubtitle")
                  : selectedPlan === "yearly"
                    ? t("paymentModal.yearlySubtitle")
                    : t("paymentModal.monthlySubtitle")}
              </p>
              <div className={`text-2xl sm:text-3xl font-bold ${
                selectedPlan === "week" ? "text-green-600" : selectedPlan === "yearly" ? "text-amber-600" : "gradient-text"
              }`}>
                {selectedPlan === "week" ? "$0" : selectedPlan === "yearly" ? "$189" : "$8"}
                <span className="text-base sm:text-lg text-gray-500 font-normal">
                  {selectedPlan === "week" ? "" : selectedPlan === "yearly" ? t("paymentModal.perYear") : t("paymentModal.perFirstMonth")}
                </span>
              </div>
              {selectedPlan === "monthly" && (
                <p className="text-gray-500 text-sm mt-1">{t("paymentModal.thenMonthly")}</p>
              )}
              {selectedPlan === "yearly" && (
                <p className="text-green-600 text-sm mt-1">{t("paymentModal.saveYearly")}</p>
              )}
            </div>

            {/* Plan switcher */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSelectedPlan("week")}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-medium transition-all ${
                  selectedPlan === "week"
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-white/50 text-gray-600 hover:bg-white"
                }`}
              >
                {t("paymentModal.freeTrialBtn")}
              </button>
              <button
                onClick={() => setSelectedPlan("monthly")}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-medium transition-all ${
                  selectedPlan === "monthly"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white/50 text-gray-600 hover:bg-white"
                }`}
              >
                {t("paymentModal.monthlyBtn")}
              </button>
              <button
                onClick={() => setSelectedPlan("yearly")}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-medium transition-all ${
                  selectedPlan === "yearly"
                    ? "bg-amber-500 text-white shadow-lg"
                    : "bg-white/50 text-gray-600 hover:bg-white"
                }`}
              >
                {t("paymentModal.yearlyBtn")}
              </button>
            </div>

            {/* Email input - only show if not logged in */}
            {!user?.email && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("paymentModal.emailLabel")}
                </label>
                <input
                  type="email"
                  placeholder={t("paymentModal.emailPlaceholder")}
                  value={paymentEmail}
                  onChange={(e) => setPaymentEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-sky-200 focus:border-sky-400 focus:outline-none text-gray-700 bg-white/80"
                />
              </div>
            )}

            {/* Error message */}
            {paymentError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                {paymentError}
              </div>
            )}

            {/* Features based on plan */}
            <div className="space-y-3 mb-6 text-sm">
              {selectedPlan === "week" && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t("paymentModal.programAccess")}</span>
                    <span className="font-medium">{t("paymentModal.week1")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t("paymentModal.storiesLabel")}</span>
                    <span className="text-green-600 font-medium">✓ {t("paymentModal.threeStories")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t("paymentModal.aiAudio")}</span>
                    <span className="text-gray-400">{t("paymentModal.notIncluded")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t("paymentModal.aiCartoon")}</span>
                    <span className="text-gray-400">{t("paymentModal.notIncluded")}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">{t("paymentModal.pdfReport")}</span>
                    <span className="font-medium flex items-center gap-1"><img src="/images/icons/chart.png" alt="" className="w-4 h-4" /> {t("paymentModal.weekly")}</span>
                  </div>
                </>
              )}
              {selectedPlan === "monthly" && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t("paymentModal.programAccess")}</span>
                    <span className="font-medium">{t("paymentModal.fullMonth")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t("paymentModal.storiesLabel")}</span>
                    <span className="text-green-600 font-medium">✓ {t("paymentModal.unlimited")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t("paymentModal.aiAudio")}</span>
                    <span className="text-amber-600 font-medium flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> {t("paymentModal.extraStars")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t("paymentModal.aiCartoon")}</span>
                    <span className="text-amber-600 font-medium flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> {t("paymentModal.extraStars")}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">{t("paymentModal.pdfReport")}</span>
                    <span className="font-medium flex items-center gap-1"><img src="/images/icons/chart.png" alt="" className="w-4 h-4" /> {t("paymentModal.monthly")}</span>
                  </div>
                </>
              )}
              {selectedPlan === "yearly" && (
                <>
                  <div className="flex justify-between py-2 border-b border-amber-100">
                    <span className="text-gray-600">{t("paymentModal.programAccess")}</span>
                    <span className="font-medium">{t("paymentModal.all12Months")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-amber-100">
                    <span className="text-gray-600">{t("paymentModal.storiesLabel")}</span>
                    <span className="text-green-600 font-medium">✓ {t("paymentModal.unlimited")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-amber-100">
                    <span className="text-gray-600">{t("paymentModal.aiAudio")}</span>
                    <span className="text-amber-600 font-medium flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> {t("paymentModal.extraStars")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-amber-100">
                    <span className="text-gray-600">{t("paymentModal.aiCartoon")}</span>
                    <span className="text-amber-600 font-medium flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> {t("paymentModal.extraStars")}</span>
                  </div>
                  <div className="py-2 border-b border-amber-100">
                    <span className="text-gray-600 block mb-2">{t("paymentModal.finalBonuses")}</span>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-amber-700">
                        <img src="/images/icons/gift.png" alt="" className="w-4 h-4" />
                        <span>{t("paymentModal.bonusAlbum")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-700">
                        <img src="/images/icons/movie.png" alt="" className="w-4 h-4" />
                        <span>{t("paymentModal.bonusMovie")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-700">
                        <img src="/images/icons/brain.png" alt="" className="w-4 h-4" />
                        <span>{t("paymentModal.bonusPassport")}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Pay button */}
            <button
              onClick={handlePayment}
              disabled={paymentLoading}
              className={`block w-full py-3 sm:py-4 rounded-full text-center font-semibold text-white text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                selectedPlan === "yearly"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-lg"
                  : "btn-glow"
              }`}
            >
              {paymentLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t("paymentModal.processing")}
                </span>
              ) : (
                selectedPlan === "week"
                  ? t("paymentModal.startFreeTrial")
                  : selectedPlan === "yearly"
                    ? t("paymentModal.getYearly")
                    : t("paymentModal.startFor8")
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              {selectedPlan === "week" ? t("paymentModal.noPaymentRequired") : t("paymentModal.cancelAnytime")} • {t("paymentModal.secure")}
            </p>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => { setShowAuthModal(false); setPendingPaymentPlan(null); }}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />
    </div>
  );
}
