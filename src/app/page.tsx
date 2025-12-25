"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { AuthModal } from "@/components/AuthModal";
import { useScrollAnimations } from "@/components/ScrollAnimations";
import { MagneticLink, MagneticButton } from "@/components/MagneticButton";
import { AnimatedText, AnimatedWords, AnimatedLine } from "@/components/AnimatedText";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openProgramBlock, setOpenProgramBlock] = useState<number | null>(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
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
      // Not authorized - show auth modal first
      setShowAuthModal(true);
      return;
    }
    // Authorized - scroll to pricing
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const openPaymentModal = (plan: "week" | "monthly" | "yearly") => {
    if (!user) {
      // Not authorized - save plan and show auth modal
      setPendingPaymentPlan(plan);
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
    // After successful auth, save pending plan to localStorage and reload
    if (pendingPaymentPlan) {
      localStorage.setItem("pendingPaymentPlan", pendingPaymentPlan);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      // No pending payment - redirect to dashboard
      window.location.href = "/dashboard";
    }
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
              Problems
            </a>
            <a href="#how" className="text-gray-600 hover:text-blue-600 transition-colors hidden md:block">
              How it works
            </a>
            <a href="#pricing" onClick={scrollToPricing} className="text-gray-600 hover:text-blue-600 transition-colors hidden md:block">
              Pricing
            </a>
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
                            <img src="/images/icons/book.png" alt="" className="w-4 h-4 inline" /> My Stories
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => { signOut(); setShowUserMenu(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <MagneticButton
                  onClick={() => setShowAuthModal(true)}
                  className="btn-glow px-4 sm:px-6 py-2 sm:py-2.5 text-white font-medium text-sm sm:text-base hidden sm:block"
                  strength={0.3}
                >
                  Sign in
                </MagneticButton>
              )
            )}
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
              Problems
            </a>
            <a href="#how" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 py-2 px-4 rounded-xl hover:bg-white/50 transition-colors">
              How it works
            </a>
            <a href="#pricing" onClick={(e) => { setMobileMenuOpen(false); scrollToPricing(e); }} className="text-gray-700 py-2 px-4 rounded-xl hover:bg-white/50 transition-colors">
              Pricing
            </a>
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
                        <img src="/images/icons/book.png" alt="" className="w-4 h-4 inline" /> My Stories
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                    className="py-2 px-4 text-red-600 text-sm font-medium"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <MagneticButton
                onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }}
                className="btn-glow px-6 py-3 text-white font-medium mt-2"
                strength={0.3}
              >
                Sign in
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
              <span className="text-xs sm:text-sm text-gray-600">Over 5,000 parents already with us</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
              <AnimatedText text="Parenting through" delay={0.2} />
              <br className="sm:hidden" />
              <span className="sm:inline"> </span>
              <AnimatedText text="magic" className="gradient-text" delay={0.8} />
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
              Transform 20 minutes before bedtime into systematic development of Emotional Intelligence and Leadership.
              Scientific methodology, personalized AI cartoons and fairy tales, transparent progress for parents.
            </p>

            {/* CTA */}
            <div className="flex flex-col gap-3 max-w-md mx-auto lg:mx-0">
              <MagneticLink
                href="#pricing"
                onClick={scrollToPricing}
                className="btn-glow px-6 sm:px-8 py-3 sm:py-4 text-white font-semibold text-base sm:text-lg inline-flex items-center justify-center gap-2 whitespace-nowrap"
                strength={0.4}
              >
                <span>Start the Hero&apos;s Journey</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </MagneticLink>
              <div className="flex items-center gap-1.5 sm:gap-2 justify-center text-xs sm:text-sm text-gray-500">
                <span className="text-blue-500">✓</span>
                <span>Try the first week free</span>
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
                <span className="text-sm flex items-center gap-1"><img src="/images/icons/microphone.png" alt="" className="w-4 h-4" /> Your voice</span>
              </div>
              <div className="absolute top-20 -right-12 glass-card px-3 py-2 floating hidden md:block" style={{ animationDelay: "2s" }}>
                <span className="text-sm flex items-center gap-1"><img src="/images/icons/brain.png" alt="" className="w-4 h-4" /> AI script</span>
              </div>
              <div className="absolute bottom-20 -left-16 glass-card px-3 py-2 floating hidden lg:block" style={{ animationDelay: "3s" }}>
                <span className="text-sm">💜 Therapy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOCK 2: PROBLEMS ===== */}
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
          {/* Problem 1 - Useless Screen */}
          <div className="glass-card p-5 sm:p-6 hover:scale-[1.02] transition-transform duration-300 group overflow-hidden">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
              <span className="text-2xl">📺</span>
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-2 text-base sm:text-lg">Useless Screen Time</h3>
            <p className="text-gray-600 text-sm">
              Kids spend hours watching YouTube that doesn&apos;t develop them — it &quot;zombifies&quot; them. You see their curiosity fading, but don&apos;t know what to replace the tablet with that would be equally engaging.
            </p>
          </div>

          {/* Problem 2 - Chaos instead of System */}
          <div className="glass-card p-5 sm:p-6 hover:scale-[1.02] transition-transform duration-300 group overflow-hidden">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
              <span className="text-2xl">📉</span>
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-2 text-base sm:text-lg">Chaos Instead of System</h3>
            <p className="text-gray-600 text-sm">
              You buy educational toys, try different classes, but give up. There&apos;s no clear plan: how exactly to develop ambition and leadership qualities in your child.
            </p>
          </div>

          {/* Problem 3 - I'll have time later */}
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

        {/* Insight */}
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

        {/* Why Now Section */}
        <div className="mt-12 sm:mt-20 max-w-5xl mx-auto">
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
                <span className="text-blue-700 text-sm font-medium">Critical Window</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Why Is This Important <span className="gradient-text">Right Now</span>?
              </h3>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                Psychologists call ages 3-6 the <span className="font-bold text-gray-900">&quot;Programming Period&quot;</span>.
                This isn&apos;t just childhood — it&apos;s the foundation of their entire future life.
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
                    <span className="text-xs text-sky-700 font-medium">Harvard Research</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">90% Brain Development</h4>
                  <p className="text-gray-600 text-sm">
                    By age 6, your child&apos;s brain is <span className="text-gray-900 font-semibold">90% formed</span>. Neural pathways for empathy, trust, and confidence are being built <span className="text-blue-600 font-semibold">right now</span>.
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
                    <span className="text-xs text-cyan-700 font-medium">Attachment Theory</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">Emotional Bond Window</h4>
                  <p className="text-gray-600 text-sm">
                    <span className="text-gray-900 font-semibold">Emotional closeness</span> with parents forms before age 7. If screens replace this contact, teenage years bring <span className="text-red-500 font-semibold">alienation</span>.
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
                    <span className="text-xs text-amber-700 font-medium">The Hard Truth</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">Tomorrow May Be Too Late</h4>
                  <p className="text-gray-600 text-sm">
                    Today they quietly retreat to their room with a tablet. Miss this moment, and you&apos;ll wake up living with a <span className="text-red-500 font-semibold">stranger who doesn&apos;t trust you</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="relative text-center">
              <p className="text-gray-700 text-base sm:text-lg font-medium mb-4">
                Are you ready to risk this bond? Or will you act while the <span className="gradient-text font-bold">&quot;window of opportunity&quot;</span> is still open?
              </p>
              <MagneticLink
                href="#pricing"
                onClick={scrollToPricing}
                className="btn-glow px-6 sm:px-8 py-3 sm:py-4 text-white font-bold text-base sm:text-lg inline-flex items-center gap-2"
                strength={0.4}
              >
                <span>Start Building the Bond</span>
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
                FairyTaleAI — it&apos;s not just stories
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                It&apos;s a <span className="font-bold text-blue-600">comprehensive personality development system</span>.
                We&apos;ve packaged methodologies from top child psychologists into a format kids absolutely love.
              </p>
            </div>

            {/* Features as floating cards */}
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16">
              {/* Feature 1 */}
              <div className="glass-card p-5 sm:p-6 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 text-center">
                <div className="mb-3 flex justify-center"><img src="/images/icons/book.png" alt="Book" className="w-12 h-12 sm:w-14 sm:h-14" /></div>
                <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">12-Month Curriculum</h3>
                <p className="text-gray-600 text-sm">
                  From &quot;Understanding Emotions&quot; to &quot;Leadership&quot; and &quot;Financial Literacy&quot;
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-card p-5 sm:p-6 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 sm:mt-8 text-center">
                <div className="mb-3 flex justify-center"><img src="/images/icons/magic-wand.png" alt="" className="w-12 h-12 sm:w-14 sm:h-14" /></div>
                <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Personalization Magic</h3>
                <p className="text-gray-600 text-sm">
                  Your child is the <span className="font-bold text-amber-600">Main Hero</span> of every story
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass-card p-5 sm:p-6 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 text-center">
                <div className="mb-3 flex justify-center"><img src="/images/icons/brain.png" alt="" className="w-12 h-12 sm:w-14 sm:h-14" /></div>
                <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Scientific Approach</h3>
                <p className="text-gray-600 text-sm">
                  Based on <span className="font-semibold">CBT methods</span> that shape character
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOCK: HOW FAIRYTALE AI WORKS ===== */}
      <section className="relative z-10 py-16 sm:py-24 bg-gradient-to-b from-white via-amber-50/30 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              <AnimatedLine text="How the" scrollTrigger /> <AnimatedLine text="FairyTale AI" className="gradient-text" scrollTrigger /> <AnimatedLine text="magic works" scrollTrigger />
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
              The only system that adapts to your child. You give us the basics — we deliver a complete development program wrapped in an engaging story and cartoon format.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {/* Step 1: Create Avatar */}
              <div className="glass-card-strong p-6 sm:p-8 relative group hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                  1
                </div>
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 mt-3 sm:mt-4">🧑‍🎨</div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Create an Avatar
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Upload your child&apos;s photo, enter their name, and select their interests (like space or dinosaurs). The AI creates the <span className="font-semibold text-violet-600">Hero of future adventures</span> in seconds.
                </p>
              </div>

              {/* Step 2: Get Weekly Story */}
              <div className="glass-card-strong p-6 sm:p-8 relative group hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                  2
                </div>
                <div className="mb-3 sm:mb-4 mt-3 sm:mt-4"><img src="/images/icons/book.png" alt="" className="w-12 h-12 sm:w-14 sm:h-14" /></div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Get the Weekly Story
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  No guessing what to include. Our smart system automatically selects an <span className="font-semibold text-amber-600">age-appropriate developmental story</span> from our Annual Program.
                </p>
              </div>

              {/* Step 3: Choose Format */}
              <div className="glass-card-strong p-6 sm:p-8 relative group hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                  3
                </div>
                <div className="mb-3 sm:mb-4 mt-3 sm:mt-4"><img src="/images/icons/mask.png" alt="" className="w-12 h-12 sm:w-14 sm:h-14" /></div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Choose the Format
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Read the story yourself with atmospheric music (free), or use <span className="font-semibold text-sky-600">&quot;Stars&quot;</span> to instantly turn the text into an audio drama or a colorful cartoon.
                </p>
              </div>

              {/* Step 4: Track Progress */}
              <div className="glass-card-strong p-6 sm:p-8 relative group hover:shadow-xl transition-all duration-300 border-2 border-emerald-200">
                <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                  4
                </div>
                <div className="mb-3 sm:mb-4 mt-3 sm:mt-4"><img src="/images/icons/chart.png" alt="" className="w-12 h-12 sm:w-14 sm:h-14" /></div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Track Progress
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  At the end of each week, download a <span className="font-semibold text-emerald-600">PDF report</span>: which skills (Soft Skills) your child developed and what to discuss at dinner to reinforce success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOCK: PARENT VALUE (Partnership with Parent) ===== */}
      <section className="relative z-10 py-16 sm:py-24 bg-gradient-to-b from-white via-indigo-50/30 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10 sm:mb-16">
              <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-4">
                <span className="text-xl">🤝</span>
                <span className="text-sm text-gray-600 font-medium">Partnership</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                We don't replace you. <br className="hidden sm:block" />
                We become your <span className="gradient-text">co-pilot</span>.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {/* Card 1: Full Transparency (Dashboard) */}
              <div className="glass-card-strong p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center mb-5 shadow-lg">
                  <img src="/images/icons/chart.png" alt="" className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  Full Transparency
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mb-5">
                  In your dashboard you see not just "time in app", but <span className="font-semibold text-gray-900">real skill growth</span>.
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
                        <p className="text-white text-xs font-medium">Emma's Progress</p>
                        <p className="text-slate-400 text-[10px]">Week 4 of Month 2</p>
                      </div>
                    </div>
                    <div className="text-[10px] text-emerald-400 bg-emerald-400/20 px-2 py-0.5 rounded-full">● Live</div>
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
                      <p className="text-slate-300 text-[10px] sm:text-xs">Empathy</p>
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
                      <p className="text-slate-300 text-[10px] sm:text-xs">Confidence</p>
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
                      <p className="text-slate-300 text-[10px] sm:text-xs">Social</p>
                      <p className="text-teal-400 text-[10px] font-semibold">+10%</p>
                    </div>
                  </div>

                  {/* Current Focus */}
                  <div className="bg-slate-700/50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                      <p className="text-slate-300 text-[10px] uppercase tracking-wider">Currently Working On</p>
                    </div>
                    <p className="text-white text-xs sm:text-sm font-medium">Taming Anger — "Breathe like a dragon" technique</p>
                  </div>
                </div>

                <p className="text-sm text-indigo-600 font-medium mt-4">
                  You always know exactly what we're working on right now.
                </p>
              </div>

              {/* Card 2: Foundation of Friendship */}
              <div className="glass-card-strong p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-5 shadow-lg">
                  <span className="text-2xl sm:text-3xl">💛</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  Foundation of Friendship
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mb-5">
                  Using our system as a reason to connect, you're building a <span className="font-semibold text-gray-900">bridge of trust</span>.
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
                    Your child learns to share experiences with you <span className="font-semibold">now</span>, so at 20 they come home not from obligation, but because <span className="text-amber-600 font-semibold">you're their best friend</span>.
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
            <span className="text-sm text-gray-600 font-medium">Based on SEL, CBT & Positive Discipline</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            <AnimatedText text="The Hero's Grand Journey: " scrollTrigger type="fade" /><AnimatedText text="12 months that will change everything" className="gradient-text" scrollTrigger type="chars" />
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            This isn't lessons — it's an exciting year-long quest. Your child lives through captivating stories and, without even realizing it, grows into a confident, self-aware Personality ready for the big world.
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
                  <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Months 1-3</span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900">EQ Foundation</h3>
                <p className="text-sm text-gray-600 hidden sm:block">Me and My Emotions — giving your child a "remote control" for their feelings</p>
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
                      <span className="font-semibold">Why this matters:</span> Young children often misbehave not out of spite, but because their brain gets "flooded" with emotions they can't name. A tantrum is a cry for help.
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-semibold">Our Goal:</span> Give your child a "Remote Control" for their emotional state. We teach them to translate screaming into words and cope with anxiety without clinging to mom's skirt.
                    </p>
                  </div>
                  {/* Months */}
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-amber-600 mb-2">Month 1</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Meeting Emotions</h4>
                      <p className="text-xs text-gray-600 mb-2">The Hero learns to recognize Joy, Sadness, Anger, and Fear. They understand: "Feeling emotions is normal, but hitting others is not allowed."</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">SEL (Emotional Awareness)</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-amber-600 mb-2">Month 2</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Taming Anger</h4>
                      <p className="text-xs text-gray-600 mb-2">Self-control techniques for little ones. The Hero learns to "breathe like a little dragon" and take a pause to avoid throwing a tantrum in the store.</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Self-Regulation</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-amber-600 mb-2">Month 3</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Conquering Fears</h4>
                      <p className="text-xs text-gray-600 mb-2">Darkness, doctors, monsters. We replace the scary thought "It's dangerous there" with action: "I'll turn on my flashlight and check."</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">CBT (Cognitive Therapy)</span>
                    </div>
                  </div>
                  {/* Results */}
                  <div className="glass-card p-4 bg-green-50/50 border border-green-100">
                    <p className="text-xs font-semibold text-green-800 mb-3 flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> Block Results:</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm text-green-700">
                        <span className="flex-shrink-0 mt-0.5">✅</span>
                        <span>Your child stops falling on the floor screaming. Instead, they come to you and say: "Mom, I'm really angry right now, let's hug."</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-green-700">
                        <span className="flex-shrink-0 mt-0.5">✅</span>
                        <span>Night fears and anxiety about new things fade away.</span>
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
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Months 4-6</span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900">Social Intelligence</h3>
                <p className="text-sm text-gray-600 hidden sm:block">Me and Others — empathy + healthy boundaries without aggression</p>
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
                      <span className="font-semibold">The Challenge:</span> How do you teach a child to stand up for themselves without raising an aggressor? How do you teach them to share without becoming a pushover for everyone?
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-semibold">Our Goal:</span> Develop empathy (kindness) while simultaneously building healthy personal boundaries. Your child learns to make friends in a healthy, balanced way.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-blue-600 mb-2">Month 4</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Personal Boundaries</h4>
                      <p className="text-xs text-gray-600 mb-2">The ability to say a firm "No" to strangers and peers. Understanding: "My body and my toys — my rules."</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Safety & Boundaries</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-blue-600 mb-2">Month 5</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Empathy & Kindness</h4>
                      <p className="text-xs text-gray-600 mb-2">Prevention of childhood cruelty. The Hero learns to feel another's pain, show compassion, and care for those who are weaker.</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Social Awareness</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-blue-600 mb-2">Month 6</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Conflict Resolution</h4>
                      <p className="text-xs text-gray-600 mb-2">The art of sandbox diplomacy. How do you share a shovel without fighting? How do you apologize when you're wrong?</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Conflict Resolution</span>
                    </div>
                  </div>
                  <div className="glass-card p-4 bg-green-50/50 border border-green-100">
                    <p className="text-xs font-semibold text-green-800 mb-3 flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> Block Results:</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm text-green-700">
                        <span className="flex-shrink-0 mt-0.5">✅</span>
                        <span>Your child is safe. They won't go off with a stranger and won't let themselves be bullied.</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-green-700">
                        <span className="flex-shrink-0 mt-0.5">✅</span>
                        <span>They become the life of the party. Other kids are drawn to them because they know how to negotiate and empathize.</span>
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
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Months 7-9</span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900">Discipline & Will</h3>
                <p className="text-sm text-gray-600 hidden sm:block">Me and My Actions — turning routines into games, building independence</p>
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
                        <span className="font-semibold">The Eternal Battle:</span> "Brush your teeth!", "Clean up your toys!", "Get dressed!" — this is exhausting and damages your relationship.
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-semibold">Our Goal:</span> Activate internal motivation. We use the Positive Discipline methodology, where routine becomes a game and independence becomes a source of pride.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-green-600 mb-2">Month 7</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Routine Without Tears</h4>
                      <p className="text-xs text-gray-600 mb-2">We transform boring tasks (sleep, hygiene, cleaning) into Hero missions. The toothbrush is a sword that kills germs!</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Positive Discipline</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-green-600 mb-2">Month 8</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">"I Can Do It Myself!"</h4>
                      <p className="text-xs text-gray-600 mb-2">The Hero learns to dress themselves, tie shoelaces, and help around the house. Making mistakes isn't scary — not trying is what's scary.</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Independence Building</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-green-600 mb-2">Month 9</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Patience & Persistence</h4>
                      <p className="text-xs text-gray-600 mb-2">The hardest skill: the ability to wait for a reward (marshmallow test), sit in line, and finish what you started.</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Executive Functions</span>
                    </div>
                  </div>
                  <div className="glass-card p-4 bg-green-50/50 border border-green-100">
                    <p className="text-xs font-semibold text-green-800 mb-3 flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> Block Results:</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm text-green-700">
                        <span className="flex-shrink-0 mt-0.5">✅</span>
                        <span>You stop being a "parrot" who repeats the same thing 100 times.</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-green-700">
                        <span className="flex-shrink-0 mt-0.5">✅</span>
                        <span>Your child initiates cleaning themselves and feels proud of being "like a grown-up." Focus develops for school readiness.</span>
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
                  <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">Months 10-12</span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900">Leadership & Character</h3>
                <p className="text-sm text-gray-600 hidden sm:block">Me as a Person — Growth Mindset and confidence for the big world</p>
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
                        <span className="font-semibold">Preparation for the Big World:</span> School and life require not just knowledge, but inner strength.
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-semibold">Our Goal:</span> Form a Growth Mindset. Your child should know: "I can learn anything if I put in the effort." This is a vaccine against the failure complex.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-purple-600 mb-2">Month 10</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Growth Mindset</h4>
                      <p className="text-xs text-gray-600 mb-2">The Hero falls but gets back up. We teach them to see failure not as "I'm stupid" but as experience: "I'll try again differently."</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Growth Mindset (Carol Dweck)</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-purple-600 mb-2">Month 11</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Honesty & Responsibility</h4>
                      <p className="text-xs text-gray-600 mb-2">Why lying doesn't pay off. The courage to admit a mistake is a trait of a strong leader, not a weak one.</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Moral Development</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
                      <div className="text-xs font-medium text-purple-600 mb-2">Month 12</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Confidence & Gratitude</h4>
                      <p className="text-xs text-gray-600 mb-2">The final assembly of personality. Discovering talents, developing a positive worldview, and setting goals for the future.</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Positive Psychology</span>
                    </div>
                  </div>
                  <div className="glass-card p-4 bg-green-50/50 border border-green-100">
                    <p className="text-xs font-semibold text-green-800 mb-3 flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> Block Results:</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm text-green-700">
                        <span className="flex-shrink-0 mt-0.5">✅</span>
                        <span>A Leader's core is formed. Your child isn't afraid to make mistakes, is honest with you, and confident in their abilities.</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-green-700">
                        <span className="flex-shrink-0 mt-0.5">✅</span>
                        <span>School readiness achieved. They know how to listen, try hard, and believe in themselves.</span>
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
              In 12 months, you won't recognize your child
            </h3>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              You'll see a small but <span className="font-semibold">conscious Personality</span> — someone interesting to talk to, easy to negotiate with, and not scary to let go into the big world.
            </p>
          </div>
        </div>
      </section>

      {/* ===== BLOCK: CURRICULUM (Topics of the Year) ===== */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-4">
            <img src="/images/icons/book.png" alt="" className="w-6 h-6" />
            <span className="text-sm text-gray-600 font-medium">Curriculum</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What will your child <span className="gradient-text">learn in a year</span>?
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            A comprehensive program that covers all aspects of emotional and social development
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
              Emotional Intelligence
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Recognize and manage their emotions effectively
            </p>
          </div>

          {/* Topic 2: Personal Boundaries */}
          <div className="glass-card-strong p-5 sm:p-6 text-center hover:scale-105 hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-3xl sm:text-4xl">🛡️</span>
            </div>
            <h3 className="font-display font-bold text-gray-900 text-base sm:text-lg mb-2">
              Personal Boundaries
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Say "No" and stand up for their opinion
            </p>
          </div>

          {/* Topic 3: Socialization */}
          <div className="glass-card-strong p-5 sm:p-6 text-center hover:scale-105 hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-3xl sm:text-4xl">👫</span>
            </div>
            <h3 className="font-display font-bold text-gray-900 text-base sm:text-lg mb-2">
              Socialization
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Make friends and resolve conflicts peacefully
            </p>
          </div>

          {/* Topic 4: Goal Setting */}
          <div className="glass-card-strong p-5 sm:p-6 text-center hover:scale-105 hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <img src="/images/icons/target.png" alt="" className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h3 className="font-display font-bold text-gray-900 text-base sm:text-lg mb-2">
              Goal Setting
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Dream big and follow through without giving up
            </p>
          </div>

          {/* Topic 5: Overcoming Fears */}
          <div className="glass-card-strong p-5 sm:p-6 text-center hover:scale-105 hover:-translate-y-2 transition-all duration-300 group sm:col-span-2 lg:col-span-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <img src="/images/icons/lion.png" alt="" className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h3 className="font-display font-bold text-gray-900 text-base sm:text-lg mb-2">
              Overcoming Fears
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Turn darkness, mistakes, new places into sources of strength
            </p>
          </div>
        </div>

        {/* Bottom insight */}
        <div className="mt-10 sm:mt-12 max-w-3xl mx-auto">
          <div className="glass-card p-5 sm:p-6 text-center bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
            <p className="text-gray-700 text-sm sm:text-base">
              <span className="font-bold text-gray-900">Each topic</span> is woven into engaging stories where your child is the hero. They don't just hear about these skills — they <span className="gradient-text font-bold">live them</span>.
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
                Transform your child's <span className="gradient-text">future</span>
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                By using FairyTaleAI consistently, you're giving your child the foundation for lifelong success
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
              {/* Benefit 1 */}
              <div className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">
                  🌿
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Healthy Emotional Development</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Increase your child's chances of a mentally healthy life with strong emotional foundations
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">
                  🌊
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Smooth Adaptation</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Your child will be well-adapted to growing up, handling life transitions with confidence
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">
                  🕊️
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Stress-Free Interactions</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Learn to interact with the world harmoniously, without unnecessary stress or conflict
                  </p>
                </div>
              </div>

              {/* Benefit 4 */}
              <div className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <img src="/images/icons/rocket.png" alt="" className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Clear Advantages</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Gain distinct advantages in social situations through developed emotional intelligence
                  </p>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50">
              <div className="text-center">
                <p className="text-2xl sm:text-4xl font-bold gradient-text">180+</p>
                <p className="text-xs sm:text-sm text-gray-600">Topics Covered</p>
              </div>
              <div className="text-center border-x border-gray-200">
                <p className="text-2xl sm:text-4xl font-bold gradient-text">52</p>
                <p className="text-xs sm:text-sm text-gray-600">Weekly Cartoons</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-4xl font-bold gradient-text">12</p>
                <p className="text-xs sm:text-sm text-gray-600">Growth Stages</p>
              </div>
            </div>

            {/* Final CTA within block */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Start building your child's emotional foundation today
              </p>
              <MagneticLink
                href="#pricing"
                onClick={scrollToPricing}
                className="btn-glow px-8 py-4 text-white font-semibold text-base sm:text-lg inline-flex items-center gap-2"
                strength={0.4}
              >
                <span>Begin the Journey</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </MagneticLink>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOCK 4: DEMO ===== */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Hear the <span className="gradient-text">quality</span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Listen to a sample story and see for yourself
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="glass-card-strong p-4 sm:p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
              {/* Left: Illustration - hidden on small mobile */}
              <div className="relative hidden sm:block">
                <div className="aspect-square rounded-2xl sm:rounded-3xl bg-gradient-to-br from-sky-100 via-sky-100 to-sky-100 flex items-center justify-center overflow-hidden">
                  <div className="text-center p-4 sm:p-6">
                    <div className="mb-3 sm:mb-4"><img src="/images/icons/sparkle.png" alt="" className="w-16 h-16 sm:w-24 sm:h-24 mx-auto" /></div>
                    <p className="text-xs sm:text-sm text-gray-500">Oliver and the Brave Firefly</p>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2 sm:mt-3">
                  Illustration created by AI automatically
                </p>
              </div>

              {/* Right: Player and text */}
              <div>
                {/* Context */}
                <div className="glass-card px-3 sm:px-4 py-2 inline-flex items-center gap-2 mb-4 sm:mb-6">
                  <img src="/images/icons/target.png" alt="" className="w-5 h-5" />
                  <span className="text-xs sm:text-sm text-gray-600">Problem: <strong>Oliver (5 y.o.) is afraid of the dark</strong></span>
                </div>

                {/* Audio player */}
                <div className="glass-card p-4 sm:p-6 mb-4 sm:mb-6">
                  {/* Hidden audio element */}
                  <audio ref={audioRef} src="/audio/dictor.MP3" preload="metadata" />

                  {/* Voice label */}
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <span className="py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium bg-blue-500 text-white shadow-lg inline-flex items-center gap-1">
                      <img src="/images/icons/microphone.png" alt="" className="w-4 h-4" /> Narrator
                    </span>
                  </div>

                  {/* Play button and progress */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button
                      onClick={togglePlay}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform flex-shrink-0"
                    >
                      {isPlaying ? (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      {/* Progress bar */}
                      <div className="h-2 bg-sky-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-blue-600 transition-all"
                          style={{ width: audioDuration ? `${(audioProgress / audioDuration) * 100}%` : "0%" }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{formatTime(audioProgress)}</span>
                        <span>{formatTime(audioDuration || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Story excerpt */}
                <div className="glass-card p-3 sm:p-4">
                  <p className="text-gray-700 text-xs sm:text-sm italic leading-relaxed">
                    "...The darkness isn't emptiness, Oliver. It's just a clean canvas where you can
                    paint your dreams," whispered the Firefly. The boy closed his eyes and for the first time imagined
                    not monsters, but a starship..."
                  </p>
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
            Safe content and proven <span className="gradient-text">methodology</span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Why thousands of parents trust us
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
          {/* Trust 1 */}
          <div className="glass-card-strong p-5 sm:p-8 text-center hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <span className="text-2xl sm:text-3xl">🛡️</span>
            </div>
            <h3 className="font-display text-base sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              100% Kind content
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              AI never generates violence or scary content. Triple-layer filtering.
            </p>
          </div>

          {/* Trust 2 */}
          <div className="glass-card-strong p-5 sm:p-8 text-center hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <img src="/images/icons/brain.png" alt="" className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h3 className="font-display text-base sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              CBT Methodology
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              We use cognitive-behavioral therapy scripts for gentle emotional work.
            </p>
          </div>

          {/* Trust 3 */}
          <div className="glass-card-strong p-5 sm:p-8 text-center hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <span className="text-2xl sm:text-3xl">👁️</span>
            </div>
            <h3 className="font-display text-base sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              You're always in control
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Preview the story before showing your child. Edit the plot with one click.
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
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Sarah, mom of Jake (4 y.o.)</p>
                  <div className="flex text-yellow-400 text-xs sm:text-sm">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm italic">
                "My son stopped being afraid of the dark after the third story! Now he asks to turn off the light himself"
              </p>
            </div>

            <div className="glass-card p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg sm:text-xl">👨</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Mike, dad of Sophie (6 y.o.)</p>
                  <div className="flex text-yellow-400 text-xs sm:text-sm">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm italic">
                "Recorded my voice — now my daughter falls asleep to my stories, even when I'm 1000 miles away"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOCK 6: PRICING ===== */}
      <section id="pricing" className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            <AnimatedWords text="Choose your" scrollTrigger /> <AnimatedText text="journey" className="gradient-text" scrollTrigger />
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Start with a test drive or commit to transformation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {/* MAGIC WEEK - Test Drive */}
          <div className="glass-card p-5 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="mb-2"><img src="/images/icons/magic-wand.png" alt="" className="w-10 h-10 mx-auto" /></div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-1">MAGIC WEEK</h3>
              <p className="text-xs text-gray-500 mb-3">Test Drive</p>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900">$5</div>
              <p className="text-gray-500 text-xs mt-1">Try and see your child&apos;s reaction</p>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Program</span>
                <span className="text-gray-900 font-medium">Week 1 access</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Stories (Text+Music)</span>
                <span className="text-green-600 font-medium">✓ 3 Scenarios</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">AI Audio</span>
                <span className="text-green-600 font-medium">✓ 3 included</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">AI Cartoon</span>
                <span className="text-green-600 font-medium">✓ 1 included</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Methodology</span>
                <span className="text-gray-900 text-xs">Questions & tasks</span>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-gray-100">
                <span className="text-gray-600">Analytics</span>
                <span className="text-gray-900 text-xs text-right flex items-center gap-1"><img src="/images/icons/chart.png" alt="" className="w-4 h-4" /> &quot;Superpowers&quot; Weekly Report</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Final Bonuses</span>
                <span className="text-gray-400">—</span>
              </div>
            </div>

            <MagneticButton
              onClick={() => openPaymentModal("week")}
              className="block w-full btn-secondary py-3 text-center font-semibold text-gray-700 text-sm"
              strength={0.3}
            >
              Try for $5
            </MagneticButton>
          </div>

          {/* MONTHLY - Basic */}
          <div className="glass-card-strong p-5 sm:p-6 relative border-2 border-sky-300">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
              Most Popular
            </div>

            <div className="text-center mb-4 sm:mb-6 mt-2">
              <div className="mb-2"><img src="/images/icons/rocket.png" alt="" className="w-10 h-10 mx-auto" /></div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-1">MONTHLY</h3>
              <p className="text-xs text-gray-500 mb-3">Basic</p>
              <div className="text-3xl sm:text-4xl font-bold gradient-text">$29<span className="text-base text-gray-500 font-normal">/mo</span></div>
              <p className="text-gray-500 text-xs mt-1">Flexible learning, pay monthly</p>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Program</span>
                <span className="text-gray-900 font-medium">Full month access</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Stories (Text+Music)</span>
                <span className="text-green-600 font-medium">✓ Unlimited</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">AI Audio</span>
                <span className="text-amber-600 font-medium flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> Extra Stars</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">AI Cartoon</span>
                <span className="text-amber-600 font-medium flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> Extra Stars</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Methodology</span>
                <span className="text-gray-900 text-xs">Questions, tracking, psychology</span>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-gray-100">
                <span className="text-gray-600">Analytics</span>
                <span className="text-gray-900 text-xs text-right flex items-center gap-1"><img src="/images/icons/chart.png" alt="" className="w-4 h-4" /> &quot;Superpowers&quot; Monthly Report</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Final Bonuses</span>
                <span className="text-gray-400">—</span>
              </div>
            </div>

            <MagneticButton
              onClick={() => openPaymentModal("monthly")}
              className="block w-full btn-glow py-3 text-center font-semibold text-white text-sm"
              strength={0.3}
            >
              Subscribe for $29/mo
            </MagneticButton>
            <p className="text-center text-xs text-gray-400 mt-2">Cancel anytime</p>
          </div>

          {/* YEARLY LEGEND */}
          <div className="glass-card-strong p-5 sm:p-6 relative bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
              Best Value
            </div>

            <div className="text-center mb-4 sm:mb-6 mt-2">
              <div className="mb-2"><img src="/images/icons/crown.png" alt="" className="w-10 h-10 mx-auto" /></div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-1">YEARLY LEGEND</h3>
              <p className="text-xs text-gray-500 mb-3">For those committed to results</p>
              <div className="text-3xl sm:text-4xl font-bold text-amber-600">$189<span className="text-base text-gray-500 font-normal">/year</span></div>
              <p className="text-gray-500 text-xs mt-1">Save $159 vs monthly</p>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-gray-600">Program</span>
                <span className="text-gray-900 font-medium">All 12 months</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-gray-600">Stories (Text+Music)</span>
                <span className="text-green-600 font-medium">✓ Unlimited</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-gray-600">AI Audio</span>
                <span className="text-amber-600 font-medium flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> Extra Stars</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-gray-600">AI Cartoon</span>
                <span className="text-amber-600 font-medium flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> Extra Stars</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-gray-600">Methodology</span>
                <span className="text-gray-900 text-xs">Questions, tracking, psychology</span>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-amber-100">
                <span className="text-gray-600">Analytics</span>
                <span className="text-gray-900 text-xs text-right flex items-center gap-1"><img src="/images/icons/chart.png" alt="" className="w-4 h-4" /> &quot;Superpowers&quot; Monthly Report</span>
              </div>
              <div className="py-2">
                <span className="text-gray-600 block mb-2">Final Bonuses:</span>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-amber-700">
                    <img src="/images/icons/gift.png" alt="" className="w-4 h-4" />
                    <span>Digital &quot;Hero Album&quot;</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700">
                    <img src="/images/icons/movie.png" alt="" className="w-4 h-4" />
                    <span>Personal Blockbuster</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700">
                    <img src="/images/icons/brain.png" alt="" className="w-4 h-4" />
                    <span>Personality Passport</span>
                  </div>
                </div>
              </div>
            </div>

            <MagneticButton
              onClick={() => openPaymentModal("yearly")}
              className="block w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 py-3 px-4 rounded-full text-center font-semibold text-white text-sm shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
              strength={0.3}
            >
              Get Yearly — $189
            </MagneticButton>
          </div>
        </div>

        {/* Price comparison */}
        <p className="text-center text-gray-500 text-xs sm:text-sm mt-6 sm:mt-8">
          All plans include full methodology based on SEL, CBT & Positive Discipline
        </p>
      </section>

      {/* ===== BLOCK 7: FAQ ===== */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Parents&apos; top <span className="gradient-text">questions</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {[
            {
              q: "We're fighting gadget addiction. Won't your app make it worse?",
              a: "Quite the opposite. YouTube and games create addiction because they're endless and meaningless (dopamine loop). Our methodology works differently:\n\n1. Time limit: A story or cartoon lasts 3-7 minutes. It's a complete story, after which the child calmly puts down the phone.\n\n2. Connection to reality: After watching, the app gives a task in the real world (e.g., \"Go hug mom\" or \"Draw your fear\"). We bring the child back from the screen to life."
            },
            {
              q: "Who writes the scripts — a robot or a human? Is it really safe?",
              a: "AI is just the \"pen\" we write with. But the \"hand\" is guided by child psychologists. All plots are built on strict SEL and CBT methodology templates. The AI cannot create anything scary or toxic as it operates within strict safety boundaries. This is 100% filtered content."
            },
            {
              q: "My child is very active (ADHD), they can't sit still for even a minute. Will this work?",
              a: "Yes, because this is a story about THEM. A regular cartoon about Peppa Pig might bore them. But when a child sees their own face on screen and hears their own name — the \"ego magic\" kicks in. This holds the attention of even the most restless children and teaches them concentration."
            },
            {
              q: "Will my child's photos end up on the internet?",
              a: "Never. We understand your concern. The photo is used for exactly 1 second — to train the neural network to create the character's face. Immediately after, the original photo is deleted from our servers. The avatar lives only in your private personal account."
            },
            {
              q: "How quickly will I see changes in behavior?",
              a: "Instantly: Your child will be surprised and delighted (\"That's me!\").\n\nAfter 1 week: They'll start using words from the stories (\"I'm angry like the little dragon right now\").\n\nAfter 1 month: You'll notice tantrums become shorter and negotiating becomes easier.\n\nThis is a cumulative effect: the more regular the stories, the faster new neural connections form."
            },
            {
              q: "Why does it cost $29/month? Cartoons on YouTube are free.",
              a: "YouTube is free because you pay with your child's attention, showing them ads and mindless content. With us, you pay for Education and Personalization.\n\nYou get a personal screenwriter, director, and psychologist. Producing one such personalized cartoon from a freelancer would cost you $100+. With us, you get an entire development program for the price of one dinner at a cafe."
            },
            {
              q: "How do I use the app correctly to get maximum results?",
              a: "We recommend turning stories into a special evening ritual. Psychologists confirm: 20 minutes before sleep, a child's brain best absorbs information and forms new neural connections.\n\nYour ideal scenario:\n\n1. Create closeness: Lie down and hug your child. This is time when you belong only to each other.\n\n2. Choose Voice Magic: Want to read yourself? Turn on \"Text + Music\" mode. Tired? Turn on the professional narrator. Want magic? Upload a sample of your voice, and AI will narrate the story in your voice.\n\n3. Discuss the important stuff: Right after the story, the app will offer 3 questions. This short dialogue is more important than the cartoon itself — this is where emotional intelligence develops.\n\n4. Track growth: Every Friday, check your email. We'll send a detailed PDF report: what skills your Hero mastered this week."
            }
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

      {/* ===== BLOCK 8: FINAL CTA ===== */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="relative overflow-hidden rounded-3xl sm:rounded-[40px] bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 p-6 sm:p-12 md:p-16 text-center">
          <div className="absolute top-0 left-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-40 sm:w-80 h-40 sm:h-80 bg-sky-300/20 rounded-full blur-3xl" />

          <div className="relative">
            <div className="mb-4 sm:mb-6 sparkle"><img src="/images/icons/magic-wand.png" alt="" className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" /></div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
              Give your child magic
            </h2>
            <p className="text-base sm:text-lg text-sky-100 mb-6 sm:mb-8 max-w-xl mx-auto">
              The first story is waiting. Start the magical journey today.
            </p>

            {/* Final CTA */}
            <MagneticLink
              href="#pricing"
              onClick={scrollToPricing}
              className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 whitespace-nowrap inline-block"
              strength={0.4}
            >
              Start the Magic
            </MagneticLink>
          </div>
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
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
              <a href="mailto:hello@app.net.ru" className="hover:text-blue-600 transition-colors">Contact</a>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">
              © 2025 FairyTaleAI
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
                  ? "Magic Week"
                  : selectedPlan === "yearly"
                    ? "Yearly Legend"
                    : "Monthly Basic"}
              </h3>
              <p className="text-gray-500 text-sm mb-3">
                {selectedPlan === "week"
                  ? "Test drive — see your child's reaction"
                  : selectedPlan === "yearly"
                    ? "Full year access with bonuses"
                    : "Flexible monthly subscription"}
              </p>
              <div className={`text-2xl sm:text-3xl font-bold ${
                selectedPlan === "yearly" ? "text-amber-600" : "gradient-text"
              }`}>
                {selectedPlan === "week" ? "$5" : selectedPlan === "yearly" ? "$189" : "$29"}
                <span className="text-base sm:text-lg text-gray-500 font-normal">
                  {selectedPlan === "week" ? "" : selectedPlan === "yearly" ? "/year" : "/mo"}
                </span>
              </div>
              {selectedPlan === "yearly" && (
                <p className="text-green-600 text-sm mt-1">Save $159 vs monthly</p>
              )}
            </div>

            {/* Plan switcher */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSelectedPlan("week")}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-medium transition-all ${
                  selectedPlan === "week"
                    ? "bg-gray-600 text-white shadow-lg"
                    : "bg-white/50 text-gray-600 hover:bg-white"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setSelectedPlan("monthly")}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-medium transition-all ${
                  selectedPlan === "monthly"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white/50 text-gray-600 hover:bg-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan("yearly")}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-medium transition-all ${
                  selectedPlan === "yearly"
                    ? "bg-amber-500 text-white shadow-lg"
                    : "bg-white/50 text-gray-600 hover:bg-white"
                }`}
              >
                Yearly
              </button>
            </div>

            {/* Email input - only show if not logged in */}
            {!user?.email && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email for subscription
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
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
                    <span className="text-gray-600">Program access</span>
                    <span className="font-medium">Week 1</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Stories (Text+Music)</span>
                    <span className="text-green-600 font-medium">✓ 3 Scenarios</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">AI Audio</span>
                    <span className="text-green-600 font-medium">✓ 3 included</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">AI Cartoon</span>
                    <span className="text-green-600 font-medium">✓ 1 included</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">PDF Report</span>
                    <span className="font-medium flex items-center gap-1"><img src="/images/icons/chart.png" alt="" className="w-4 h-4" /> Weekly</span>
                  </div>
                </>
              )}
              {selectedPlan === "monthly" && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Program access</span>
                    <span className="font-medium">Full month</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Stories (Text+Music)</span>
                    <span className="text-green-600 font-medium">✓ Unlimited</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">AI Audio</span>
                    <span className="text-amber-600 font-medium flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> Extra Stars</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">AI Cartoon</span>
                    <span className="text-amber-600 font-medium flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> Extra Stars</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">PDF Report</span>
                    <span className="font-medium flex items-center gap-1"><img src="/images/icons/chart.png" alt="" className="w-4 h-4" /> Monthly</span>
                  </div>
                </>
              )}
              {selectedPlan === "yearly" && (
                <>
                  <div className="flex justify-between py-2 border-b border-amber-100">
                    <span className="text-gray-600">Program access</span>
                    <span className="font-medium">All 12 months</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-amber-100">
                    <span className="text-gray-600">Stories (Text+Music)</span>
                    <span className="text-green-600 font-medium">✓ Unlimited</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-amber-100">
                    <span className="text-gray-600">AI Audio</span>
                    <span className="text-amber-600 font-medium flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> Extra Stars</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-amber-100">
                    <span className="text-gray-600">AI Cartoon</span>
                    <span className="text-amber-600 font-medium flex items-center gap-1"><img src="/images/icons/star.png" alt="" className="w-4 h-4" /> Extra Stars</span>
                  </div>
                  <div className="py-2 border-b border-amber-100">
                    <span className="text-gray-600 block mb-2">Final Bonuses:</span>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-amber-700">
                        <img src="/images/icons/gift.png" alt="" className="w-4 h-4" />
                        <span>Digital &quot;Hero Album&quot;</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-700">
                        <img src="/images/icons/movie.png" alt="" className="w-4 h-4" />
                        <span>Personal Blockbuster</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-700">
                        <img src="/images/icons/brain.png" alt="" className="w-4 h-4" />
                        <span>Personality Passport</span>
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
                  Processing...
                </span>
              ) : (
                selectedPlan === "week"
                  ? "Try for $5"
                  : selectedPlan === "yearly"
                    ? "Get Yearly — $189"
                    : "Subscribe — $29/mo"
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              {selectedPlan === "week" ? "One-time payment" : "Cancel anytime"} • Secure payment
            </p>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => { setShowAuthModal(false); setPendingPaymentPlan(null); }}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
