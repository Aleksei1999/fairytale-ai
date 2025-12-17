"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [childName, setChildName] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<"mom" | "narrator">("mom");
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const [paymentEmail, setPaymentEmail] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const audioSources = {
    mom: "/audio/mom.MP3",
    narrator: "/audio/dictor.MP3",
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setAudioProgress(0);
    }
  }, [selectedVoice]);

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
  }, [selectedVoice]);

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

  const openPaymentModal = (plan: "monthly" | "yearly") => {
    setSelectedPlan(plan);
    setPaymentEmail("");
    setPaymentError("");
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!paymentEmail || !paymentEmail.includes("@")) {
      setPaymentError("Please enter a valid email");
      return;
    }

    setPaymentLoading(true);
    setPaymentError("");

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: paymentEmail,
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
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-sky-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/4 w-80 h-80 bg-sky-100/40 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <nav className="glass-card px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-sm sm:text-lg">✨</span>
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
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors hidden md:block">
              Pricing
            </a>
            <button
              onClick={() => setShowModal(true)}
              className="btn-glow px-4 sm:px-6 py-2 sm:py-2.5 text-white font-medium text-sm sm:text-base hidden sm:block"
            >
              Create a story
            </button>
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
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 py-2 px-4 rounded-xl hover:bg-white/50 transition-colors">
              Pricing
            </a>
            <button
              onClick={() => { setShowModal(true); setMobileMenuOpen(false); }}
              className="btn-glow px-6 py-3 text-white font-medium mt-2"
            >
              Create a story
            </button>
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
              Parenting through{" "}
              <span className="gradient-text">magic</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
              AI creates personalized fairy tales where your child is the main character.
              Gently solve behavior, sleep, and tantrum issues.
            </p>

            {/* CTA with input */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
              <input
                type="text"
                placeholder="Child's name"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="flex-1 px-5 sm:px-6 py-3 sm:py-4 rounded-full border-2 border-sky-200 focus:border-sky-400 focus:outline-none text-gray-700 bg-white/80 backdrop-blur text-base"
              />
              <button
                onClick={() => setShowModal(true)}
                className="btn-glow px-6 sm:px-8 py-3 sm:py-4 text-white font-semibold text-base sm:text-lg inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Create for free</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4 justify-center lg:justify-start text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-blue-500">✓</span>
                <span>First story free</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-blue-500">✓</span>
                <span>No registration</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-blue-500">✓</span>
                <span>Ready in 1 minute</span>
              </div>
            </div>
          </div>

          {/* Right: Hero illustration - hidden on mobile, simplified on tablet */}
          <div className="flex-1 flex justify-center lg:justify-end hidden sm:flex">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-300/50 to-blue-500/30 rounded-full blur-3xl scale-110" />
              <div className="relative floating">
                <div className="w-64 h-80 sm:w-80 sm:h-96 md:w-96 md:h-[480px] glass-card-strong flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-6 left-6 sm:top-8 sm:left-8 text-xl sm:text-2xl sparkle">⭐</div>
                  <div className="absolute top-12 right-8 sm:top-16 sm:right-12 text-lg sm:text-xl sparkle" style={{ animationDelay: "0.5s" }}>✨</div>
                  <div className="absolute bottom-16 left-8 sm:bottom-20 sm:left-12 text-lg sm:text-xl sparkle" style={{ animationDelay: "1s" }}>🌟</div>
                  <div className="absolute bottom-8 right-6 sm:bottom-12 sm:right-8 text-xl sm:text-2xl sparkle" style={{ animationDelay: "1.5s" }}>💫</div>

                  <div className="text-center">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-sky-200 to-sky-400 flex items-center justify-center shadow-xl">
                      <span className="text-5xl sm:text-6xl md:text-7xl">👧</span>
                    </div>
                    <p className="text-gray-600 font-medium px-4 text-sm sm:text-base">
                      Your child is the<br />
                      <span className="gradient-text font-bold">story hero</span>
                    </p>
                  </div>

                  <div className="absolute -bottom-4 -left-4 text-4xl sm:text-5xl md:text-6xl opacity-60">☁️</div>
                  <div className="absolute -bottom-2 -right-4 text-3xl sm:text-4xl md:text-5xl opacity-40">☁️</div>
                </div>
              </div>

              {/* Floating labels - hidden on smaller screens */}
              <div className="absolute -top-4 -left-8 glass-card px-3 py-2 floating hidden md:block" style={{ animationDelay: "1s" }}>
                <span className="text-sm">🎙️ Your voice</span>
              </div>
              <div className="absolute top-20 -right-12 glass-card px-3 py-2 floating hidden md:block" style={{ animationDelay: "2s" }}>
                <span className="text-sm">🧠 AI script</span>
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
            Sound <span className="gradient-text">familiar</span>?
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            If even one applies — our service was made for you
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-6xl mx-auto">
          {/* Problem 1 */}
          <div className="glass-card p-4 sm:p-6 hover:scale-105 transition-transform duration-300 group">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-xl sm:text-2xl">🪥</span>
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Routines & Hygiene</h3>
            <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
              Every night is a battle over brushing teeth or cleaning up toys. Screaming instead of sleep.
            </p>
          </div>

          {/* Problem 2 */}
          <div className="glass-card p-4 sm:p-6 hover:scale-105 transition-transform duration-300 group">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-xl sm:text-2xl">⚡</span>
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Behavior</h3>
            <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
              Fights at daycare, picks on younger kids, or won't share. You feel embarrassed around other parents.
            </p>
          </div>

          {/* Problem 3 */}
          <div className="glass-card p-4 sm:p-6 hover:scale-105 transition-transform duration-300 group">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-xl sm:text-2xl">👻</span>
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Fears & Emotions</h3>
            <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
              Afraid of the dark, doctors, or being alone. Takes forever to calm down.
            </p>
          </div>

          {/* Problem 4 */}
          <div className="glass-card p-4 sm:p-6 hover:scale-105 transition-transform duration-300 group">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-xl sm:text-2xl">📵</span>
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Screen Time</h3>
            <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
              Can't tear them away from cartoons. Meltdown when you take the phone away.
            </p>
          </div>
        </div>

        {/* Insight */}
        <div className="mt-8 sm:mt-12 max-w-3xl mx-auto">
          <div className="glass-card-strong p-5 sm:p-8 text-center">
            <p className="text-base sm:text-lg text-gray-700 mb-3 sm:mb-4">
              <span className="font-bold text-gray-900">Kids don't hear lectures.</span> Their brains are wired to learn through play and imagery.
            </p>
            <p className="text-blue-600 font-semibold text-sm sm:text-base">
              Yelling is useless — you need to tell stories.
            </p>
          </div>
        </div>

        {/* Platform description */}
        <div className="mt-6 sm:mt-8 text-center max-w-2xl mx-auto">
          <p className="text-gray-600 text-sm sm:text-base">
            <span className="font-semibold text-gray-800">FairyTaleAI</span> — a platform for personalized therapeutic stories
            adapted to specific situations. Build leadership, moral, and emotional qualities
            through storytelling <span className="text-blue-600 font-medium">in your own voice</span>.
          </p>
        </div>
      </section>

      {/* ===== BLOCK 3: HOW IT WORKS ===== */}
      <section id="how" className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Create a story in <span className="gradient-text">1 minute</span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            AI does all the work for you. It's like magic — press a button, get results.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="glass-card-strong p-5 sm:p-8 relative group hover:scale-105 transition-transform duration-300">
            <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
              1
            </div>
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 mt-3 sm:mt-4">👶</div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Tell us about your child
            </h3>
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
              Enter name, age, and interests. The story will be all about them.
            </p>
            <div className="glass-card px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-500 italic hidden sm:block">
              "Emma, 5 years old. Loves dinosaurs and Lego"
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-card-strong p-5 sm:p-8 relative group hover:scale-105 transition-transform duration-300">
            <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
              2
            </div>
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 mt-3 sm:mt-4">🎯</div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Choose a topic
            </h3>
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
              What needs work? Pick a ready topic or describe your own.
            </p>
            <div className="flex flex-wrap gap-1 sm:gap-2 hidden sm:flex">
              <span className="glass-card px-2 sm:px-3 py-1 text-xs text-gray-600">Won't eat veggies</span>
              <span className="glass-card px-2 sm:px-3 py-1 text-xs text-gray-600">Afraid of doctor</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-card-strong p-5 sm:p-8 relative group hover:scale-105 transition-transform duration-300">
            <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
              3
            </div>
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 mt-3 sm:mt-4">✨</div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Story ready!
            </h3>
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
              AI instantly creates the plot, draws illustrations, and narrates the story.
            </p>
            <div className="glass-card px-3 sm:px-4 py-2 text-xs sm:text-sm text-blue-600 font-medium">
              🎙 In mom's, dad's, or narrator's voice
            </div>
          </div>
        </div>

        {/* Expert insight */}
        <div className="mt-8 sm:mt-12 max-w-3xl mx-auto">
          <div className="glass-card p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
            <div className="text-2xl sm:text-3xl">💡</div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Why does it work?</h4>
              <p className="text-gray-600 text-xs sm:text-sm">
                The story uses the <span className="font-semibold">"Therapeutic Metaphor"</span> method.
                We show a hero who made mistakes but corrected them and became a hero.
                Children subconsciously mirror this behavior.
              </p>
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
                    <div className="text-6xl sm:text-8xl mb-3 sm:mb-4">🌟</div>
                    <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center shadow-lg mb-3 sm:mb-4">
                      <span className="text-3xl sm:text-4xl">👦</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">Oliver and the Brave Firefly</p>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-4 left-4 text-xl sm:text-2xl sparkle">⭐</div>
                  <div className="absolute top-8 right-6 text-lg sm:text-xl sparkle" style={{ animationDelay: "0.5s" }}>✨</div>
                  <div className="absolute bottom-8 left-8 text-lg sm:text-xl sparkle" style={{ animationDelay: "1s" }}>🌙</div>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2 sm:mt-3">
                  Illustration created by AI automatically
                </p>
              </div>

              {/* Right: Player and text */}
              <div>
                {/* Context */}
                <div className="glass-card px-3 sm:px-4 py-2 inline-flex items-center gap-2 mb-4 sm:mb-6">
                  <span className="text-blue-500">🎯</span>
                  <span className="text-xs sm:text-sm text-gray-600">Problem: <strong>Oliver (5 y.o.) is afraid of the dark</strong></span>
                </div>

                {/* Audio player */}
                <div className="glass-card p-4 sm:p-6 mb-4 sm:mb-6">
                  {/* Hidden audio element */}
                  <audio ref={audioRef} src={audioSources[selectedVoice]} preload="metadata" />

                  {/* Voice selector */}
                  <div className="flex gap-2 mb-3 sm:mb-4">
                    <button
                      onClick={() => setSelectedVoice("mom")}
                      className={`flex-1 py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium transition-all ${
                        selectedVoice === "mom"
                          ? "bg-blue-500 text-white shadow-lg"
                          : "bg-white/50 text-gray-600 hover:bg-white"
                      }`}
                    >
                      🎙 Mom's voice
                    </button>
                    <button
                      onClick={() => setSelectedVoice("narrator")}
                      className={`flex-1 py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium transition-all ${
                        selectedVoice === "narrator"
                          ? "bg-blue-500 text-white shadow-lg"
                          : "bg-white/50 text-gray-600 hover:bg-white"
                      }`}
                    >
                      🎤 Narrator
                    </button>
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
              <span className="text-2xl sm:text-3xl">🧠</span>
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
            An investment in <span className="gradient-text">family peace</span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Try for free, stay for results
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto">
          {/* Free tier */}
          <div className="glass-card p-5 sm:p-8">
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Try it</h3>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900">$0</div>
              <p className="text-gray-500 text-xs sm:text-sm">For those who want to test</p>
            </div>

            <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <li className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                <span className="text-green-500">✓</span>
                <span>3 stories (total)</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                <span className="text-green-500">✓</span>
                <span>Standard narration</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                <span className="text-green-500">✓</span>
                <span>Text version</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-gray-400 text-sm sm:text-base">
                <span className="text-gray-300">✗</span>
                <span>Voice cloning</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-gray-400 text-sm sm:text-base">
                <span className="text-gray-300">✗</span>
                <span>MP3 download</span>
              </li>
            </ul>

            <button
              onClick={() => setShowModal(true)}
              className="block w-full btn-secondary py-3 sm:py-4 text-center font-semibold text-gray-700 text-sm sm:text-base"
            >
              Create first story
            </button>
          </div>

          {/* Premium tier */}
          <div className="glass-card-strong p-5 sm:p-8 relative border-2 border-sky-300">
            <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
              Most Popular
            </div>

            <div className="text-center mb-4 sm:mb-6 mt-2 sm:mt-0">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Super Parent</h3>
              <div className="text-3xl sm:text-4xl font-bold gradient-text">$4.99<span className="text-base sm:text-lg text-gray-500 font-normal">/mo</span></div>
              <p className="text-gray-500 text-xs sm:text-sm">or $49.99/year (2 months free)</p>
            </div>

            <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <li className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                <span className="text-green-500">✓</span>
                <span><strong>Unlimited</strong> stories</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                <span className="text-blue-500">🎙</span>
                <span><strong>Voice cloning</strong></span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                <span className="text-blue-500">🖼</span>
                <span><strong>Unique illustrations</strong></span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                <span className="text-blue-500">📥</span>
                <span><strong>MP3 download</strong></span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                <span className="text-blue-500">🛡</span>
                <span>Priority generation</span>
              </li>
            </ul>

            <button
              onClick={() => openPaymentModal("monthly")}
              className="block w-full btn-glow py-3 sm:py-4 text-center font-semibold text-white text-sm sm:text-base"
            >
              Subscribe now
            </button>
            <button
              onClick={() => openPaymentModal("yearly")}
              className="block w-full mt-2 py-2 text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              or $49.99/year (2 months free)
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
              Cancel anytime
            </p>
          </div>
        </div>

        {/* Price comparison */}
        <p className="text-center text-gray-500 text-xs sm:text-sm mt-6 sm:mt-8">
          Less than a cup of coffee, more valuable than any toy
        </p>
      </section>

      {/* ===== BLOCK 7: FAQ ===== */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Frequently asked <span className="gradient-text">questions</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {[
            {
              q: "Is this a subscription? How do I cancel?",
              a: "Yes, it's a subscription to support the AI operations. You can cancel with one click in your account — no hidden charges or complicated procedures."
            },
            {
              q: "How does voice cloning work? Is it hard?",
              a: "Super easy! You press 'Record', read text from the screen for about 30 seconds. Our AI learns your voice and then narrates any story in your voice."
            },
            {
              q: "How long is each story?",
              a: "The optimal length is 3-5 minutes. That's enough to develop the plot and help your child fall asleep without getting bored. You can choose the duration when creating."
            },
            {
              q: "Can I save the story?",
              a: "Yes! With the 'Super Parent' plan, you can download audio files and send them to grandparents, listen in the car, or on a plane without internet."
            },
            {
              q: "Is the content safe for kids?",
              a: "Absolutely. All stories go through triple filtering. The AI is configured to never create scary, violent, or inappropriate content. Plus, you can always preview the story before showing it to your child."
            }
          ].map((item, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left gap-3"
              >
                <span className="font-semibold text-gray-900 text-sm sm:text-base">{item.q}</span>
                <span className={`text-blue-500 transition-transform flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>
              {openFaq === i && (
                <div className="px-4 sm:px-6 pb-3 sm:pb-4 text-gray-600 text-sm sm:text-base">
                  {item.a}
                </div>
              )}
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
            <div className="text-4xl sm:text-5xl mb-4 sm:mb-6 sparkle">✨</div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
              Give your child magic
            </h2>
            <p className="text-base sm:text-lg text-sky-100 mb-6 sm:mb-8 max-w-xl mx-auto">
              The first story is waiting. Enter your child's name and start the magic.
            </p>

            {/* Final CTA with input */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Child's name"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="flex-1 px-5 sm:px-6 py-3 sm:py-4 rounded-full border-2 border-white/30 focus:border-white focus:outline-none text-gray-700 bg-white/90 backdrop-blur text-base"
              />
              <button
                onClick={() => setShowModal(true)}
                className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 whitespace-nowrap"
              >
                Create story
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="glass-card p-4 sm:p-8">
          <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                <span className="text-white text-sm">✨</span>
              </div>
              <span className="font-display font-bold text-gray-800">FairyTaleAI</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">
              © 2025 FairyTaleAI
            </p>
          </div>
        </div>
      </footer>

      {/* Coming Soon Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={() => setShowModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative glass-card-strong p-6 sm:p-8 md:p-12 max-w-md w-full text-center mx-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Decorative elements */}
            <div className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl sm:text-3xl">🚀</span>
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
              <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Coming <span className="gradient-text">soon!</span>
              </h3>

              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                We're finishing work on FairyTaleAI. Very soon you'll be able to create magical personalized stories for your children.
              </p>

              <div className="glass-card p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center justify-center gap-2 text-blue-600 text-sm sm:text-base">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="font-medium">Stay tuned for updates</span>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="btn-glow px-6 sm:px-8 py-2.5 sm:py-3 text-white font-semibold w-full text-sm sm:text-base"
              >
                Got it, can't wait!
              </button>
            </div>
          </div>
        </div>
      )}

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
            className="relative glass-card-strong p-6 sm:p-8 max-w-md w-full mx-2"
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
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl sm:text-3xl">
                  {selectedPlan === "yearly" ? "🎁" : "✨"}
                </span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {selectedPlan === "yearly" ? "Yearly subscription" : "Monthly subscription"}
              </h3>
              <div className="text-2xl sm:text-3xl font-bold gradient-text">
                {selectedPlan === "yearly" ? "$49.99" : "$4.99"}
                <span className="text-base sm:text-lg text-gray-500 font-normal">
                  /{selectedPlan === "yearly" ? "year" : "mo"}
                </span>
              </div>
              {selectedPlan === "yearly" && (
                <p className="text-green-600 text-sm mt-1">Save $10 (2 months free)</p>
              )}
            </div>

            {/* Plan switcher */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSelectedPlan("monthly")}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                  selectedPlan === "monthly"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white/50 text-gray-600 hover:bg-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan("yearly")}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                  selectedPlan === "yearly"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white/50 text-gray-600 hover:bg-white"
                }`}
              >
                Yearly (-17%)
              </button>
            </div>

            {/* Email input */}
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

            {/* Error message */}
            {paymentError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                {paymentError}
              </div>
            )}

            {/* Features */}
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">✓</span>
                Unlimited stories
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">✓</span>
                Voice cloning
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">✓</span>
                MP3 download
              </li>
            </ul>

            {/* Pay button */}
            <button
              onClick={handlePayment}
              disabled={paymentLoading}
              className="block w-full btn-glow py-3 sm:py-4 text-center font-semibold text-white text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
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
                `Pay ${selectedPlan === "yearly" ? "$49.99" : "$4.99"}`
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              Secure payment via Lava Top
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
