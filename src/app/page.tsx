"use client";

import { useState } from "react";

export default function Home() {
  const [childName, setChildName] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<"mom" | "narrator">("mom");
  const [showModal, setShowModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <span className="font-display text-lg sm:text-xl font-bold text-gray-800">СказкаAI</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="#problems" className="text-gray-600 hover:text-blue-600 transition-colors hidden md:block">
              Проблемы
            </a>
            <a href="#how" className="text-gray-600 hover:text-blue-600 transition-colors hidden md:block">
              Как работает
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors hidden md:block">
              Тарифы
            </a>
            <button
              onClick={() => setShowModal(true)}
              className="btn-glow px-4 sm:px-6 py-2 sm:py-2.5 text-white font-medium text-sm sm:text-base hidden sm:block"
            >
              Создать сказку
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
              Проблемы
            </a>
            <a href="#how" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 py-2 px-4 rounded-xl hover:bg-white/50 transition-colors">
              Как работает
            </a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 py-2 px-4 rounded-xl hover:bg-white/50 transition-colors">
              Тарифы
            </a>
            <button
              onClick={() => { setShowModal(true); setMobileMenuOpen(false); }}
              className="btn-glow px-6 py-3 text-white font-medium mt-2"
            >
              Создать сказку
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
              <span className="text-xs sm:text-sm text-gray-600">Более 5000 родителей уже с нами</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
              Воспитание через{" "}
              <span className="gradient-text">волшебство</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
              Искусственный интеллект создаст персональную сказку, где ваш ребёнок — главный герой.
              Мягко решим проблемы с поведением, сном и капризами.
            </p>

            {/* CTA with input */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
              <input
                type="text"
                placeholder="Имя ребёнка"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="flex-1 px-5 sm:px-6 py-3 sm:py-4 rounded-full border-2 border-sky-200 focus:border-sky-400 focus:outline-none text-gray-700 bg-white/80 backdrop-blur text-base"
              />
              <button
                onClick={() => setShowModal(true)}
                className="btn-glow px-6 sm:px-8 py-3 sm:py-4 text-white font-semibold text-base sm:text-lg inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Создать бесплатно</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4 justify-center lg:justify-start text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-blue-500">✓</span>
                <span>Бесплатная первая сказка</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-blue-500">✓</span>
                <span>Без регистрации</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-blue-500">✓</span>
                <span>Готово за 1 минуту</span>
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
                      Ваш ребёнок —<br />
                      <span className="gradient-text font-bold">герой сказки</span>
                    </p>
                  </div>

                  <div className="absolute -bottom-4 -left-4 text-4xl sm:text-5xl md:text-6xl opacity-60">☁️</div>
                  <div className="absolute -bottom-2 -right-4 text-3xl sm:text-4xl md:text-5xl opacity-40">☁️</div>
                </div>
              </div>

              {/* Floating labels - hidden on smaller screens */}
              <div className="absolute -top-4 -left-8 glass-card px-3 py-2 floating hidden md:block" style={{ animationDelay: "1s" }}>
                <span className="text-sm">🎙️ Ваш голос</span>
              </div>
              <div className="absolute top-20 -right-12 glass-card px-3 py-2 floating hidden md:block" style={{ animationDelay: "2s" }}>
                <span className="text-sm">🧠 ИИ-сценарий</span>
              </div>
              <div className="absolute bottom-20 -left-16 glass-card px-3 py-2 floating hidden lg:block" style={{ animationDelay: "3s" }}>
                <span className="text-sm">💜 Терапия</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== БЛОК 2: ПРОБЛЕМЫ ===== */}
      <section id="problems" className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Знакомые <span className="gradient-text">ситуации</span>?
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Если хотя бы одна — наш сервис создан для вас
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-6xl mx-auto">
          {/* Problem 1 */}
          <div className="glass-card p-4 sm:p-6 hover:scale-105 transition-transform duration-300 group">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-xl sm:text-2xl">🪥</span>
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Рутина и гигиена</h3>
            <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
              Каждый вечер — битва за чистку зубов или уборку игрушек. Крики вместо сна.
            </p>
          </div>

          {/* Problem 2 */}
          <div className="glass-card p-4 sm:p-6 hover:scale-105 transition-transform duration-300 group">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-xl sm:text-2xl">⚡</span>
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Поведение</h3>
            <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
              Дерется в садике, обижает младших или жадничает. Вам стыдно перед другими мамами.
            </p>
          </div>

          {/* Problem 3 */}
          <div className="glass-card p-4 sm:p-6 hover:scale-105 transition-transform duration-300 group">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-xl sm:text-2xl">👻</span>
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Страхи и эмоции</h3>
            <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
              Боится темноты, врачей или оставаться один. Долго не может успокоиться.
            </p>
          </div>

          {/* Problem 4 */}
          <div className="glass-card p-4 sm:p-6 hover:scale-105 transition-transform duration-300 group">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-xl sm:text-2xl">📵</span>
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Гаджеты</h3>
            <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
              Не оторвать от мультиков. Истерика, если забираете телефон.
            </p>
          </div>
        </div>

        {/* Insight */}
        <div className="mt-8 sm:mt-12 max-w-3xl mx-auto">
          <div className="glass-card-strong p-5 sm:p-8 text-center">
            <p className="text-base sm:text-lg text-gray-700 mb-3 sm:mb-4">
              <span className="font-bold text-gray-900">Дети не слышат нотаций.</span> Их мозг устроен так, что они учатся через игру и образы.
            </p>
            <p className="text-blue-600 font-semibold text-sm sm:text-base">
              Кричать бесполезно — нужно рассказывать истории.
            </p>
          </div>
        </div>

        {/* Platform description */}
        <div className="mt-6 sm:mt-8 text-center max-w-2xl mx-auto">
          <p className="text-gray-600 text-sm sm:text-base">
            <span className="font-semibold text-gray-800">СказкаAI</span> — платформа персональных терапевтических сказок,
            адаптированных под конкретные ситуации. Воспитываем лидерские, нравственные и эмоциональные качества
            через повествование <span className="text-blue-600 font-medium">вашим голосом</span>.
          </p>
        </div>
      </section>

      {/* ===== БЛОК 3: КАК ЭТО РАБОТАЕТ ===== */}
      <section id="how" className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Создайте сказку за <span className="gradient-text">1 минуту</span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            ИИ делает всю работу за вас. Это как магия — нажали кнопку, получили результат.
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
              Расскажите о ребёнке
            </h3>
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
              Введите имя, возраст и интересы. Сказка будет именно про него.
            </p>
            <div className="glass-card px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-500 italic hidden sm:block">
              «Ваня, 5 лет. Любит динозавров и Лего»
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-card-strong p-5 sm:p-8 relative group hover:scale-105 transition-transform duration-300">
            <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
              2
            </div>
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 mt-3 sm:mt-4">🎯</div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Выберите тему
            </h3>
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
              Что нужно проработать? Выберите готовую тему или опишите свою.
            </p>
            <div className="flex flex-wrap gap-1 sm:gap-2 hidden sm:flex">
              <span className="glass-card px-2 sm:px-3 py-1 text-xs text-gray-600">Не хочет есть суп</span>
              <span className="glass-card px-2 sm:px-3 py-1 text-xs text-gray-600">Боится врача</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-card-strong p-5 sm:p-8 relative group hover:scale-105 transition-transform duration-300">
            <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
              3
            </div>
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 mt-3 sm:mt-4">✨</div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Сказка готова!
            </h3>
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
              ИИ мгновенно создаст сюжет, нарисует иллюстрацию и озвучит историю.
            </p>
            <div className="glass-card px-3 sm:px-4 py-2 text-xs sm:text-sm text-blue-600 font-medium">
              🎙 Голосом мамы, папы или диктора
            </div>
          </div>
        </div>

        {/* Expert insight */}
        <div className="mt-8 sm:mt-12 max-w-3xl mx-auto">
          <div className="glass-card p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
            <div className="text-2xl sm:text-3xl">💡</div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Почему это работает?</h4>
              <p className="text-gray-600 text-xs sm:text-sm">
                В сказке используется метод <span className="font-semibold">«Терапевтической метафоры»</span>.
                Мы показываем героя, который ошибался, но исправился и стал героем.
                Ребенок подсознательно копирует это поведение.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== БЛОК 4: ДЕМО ===== */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Оцените <span className="gradient-text">качество</span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Послушайте пример сказки и убедитесь сами
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
                    <p className="text-xs sm:text-sm text-gray-500">Артём и Храбрый Светлячок</p>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-4 left-4 text-xl sm:text-2xl sparkle">⭐</div>
                  <div className="absolute top-8 right-6 text-lg sm:text-xl sparkle" style={{ animationDelay: "0.5s" }}>✨</div>
                  <div className="absolute bottom-8 left-8 text-lg sm:text-xl sparkle" style={{ animationDelay: "1s" }}>🌙</div>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2 sm:mt-3">
                  Иллюстрация создана ИИ автоматически
                </p>
              </div>

              {/* Right: Player and text */}
              <div>
                {/* Context */}
                <div className="glass-card px-3 sm:px-4 py-2 inline-flex items-center gap-2 mb-4 sm:mb-6">
                  <span className="text-blue-500">🎯</span>
                  <span className="text-xs sm:text-sm text-gray-600">Проблема: <strong>Артём (5 лет) боится темноты</strong></span>
                </div>

                {/* Audio player */}
                <div className="glass-card p-4 sm:p-6 mb-4 sm:mb-6">
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
                      🎙 Мамин голос
                    </button>
                    <button
                      onClick={() => setSelectedVoice("narrator")}
                      className={`flex-1 py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium transition-all ${
                        selectedVoice === "narrator"
                          ? "bg-blue-500 text-white shadow-lg"
                          : "bg-white/50 text-gray-600 hover:bg-white"
                      }`}
                    >
                      🎤 Диктор
                    </button>
                  </div>

                  {/* Play button and waveform */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                      {/* Fake waveform */}
                      <div className="flex items-center gap-0.5 sm:gap-1 h-8 sm:h-10">
                        {[...Array(20)].map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-sky-300 rounded-full"
                            style={{
                              height: `${16 + Math.sin(i * 0.5) * 12 + Math.random() * 8}px`,
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>0:00</span>
                        <span>3:45</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Story excerpt */}
                <div className="glass-card p-3 sm:p-4">
                  <p className="text-gray-700 text-xs sm:text-sm italic leading-relaxed">
                    «...Темнота — это не пустота, Артёмка. Это просто чистое полотно, на котором ты можешь
                    рисовать свои сны, — прошептал Светлячок. Мальчик закрыл глаза и впервые представил
                    не монстров, а звёздный корабль...»
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== БЛОК 5: БЕЗОПАСНОСТЬ И ДОВЕРИЕ ===== */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Безопасный контент и <span className="gradient-text">методика</span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Почему нам доверяют тысячи родителей
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
          {/* Trust 1 */}
          <div className="glass-card-strong p-5 sm:p-8 text-center hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <span className="text-2xl sm:text-3xl">🛡️</span>
            </div>
            <h3 className="font-display text-base sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              100% Добрый контент
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              ИИ никогда не сгенерирует жестокость или пугающий контент. Тройная фильтрация.
            </p>
          </div>

          {/* Trust 2 */}
          <div className="glass-card-strong p-5 sm:p-8 text-center hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <span className="text-2xl sm:text-3xl">🧠</span>
            </div>
            <h3 className="font-display text-base sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Методика КПТ
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Используем сценарии когнитивно-поведенческой терапии для мягкой проработки эмоций.
            </p>
          </div>

          {/* Trust 3 */}
          <div className="glass-card-strong p-5 sm:p-8 text-center hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <span className="text-2xl sm:text-3xl">👁️</span>
            </div>
            <h3 className="font-display text-base sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Вы всегда главные
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Вы видите текст до показа ребенку. Можете отредактировать сюжет в один клик.
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
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Анна, мама Миши (4 года)</p>
                  <div className="flex text-yellow-400 text-xs sm:text-sm">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm italic">
                «Сын перестал бояться темноты после третьей сказки! Теперь сам просит выключить свет»
              </p>
            </div>

            <div className="glass-card p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg sm:text-xl">👨</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Дмитрий, папа Софии (6 лет)</p>
                  <div className="flex text-yellow-400 text-xs sm:text-sm">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm italic">
                «Записал свой голос — теперь дочь засыпает под мои сказки, даже когда я за 1000 км»
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== БЛОК 6: ТАРИФЫ ===== */}
      <section id="pricing" className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Инвестиция в <span className="gradient-text">спокойствие семьи</span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Попробуйте бесплатно, оставайтесь ради результата
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto">
          {/* Free tier */}
          <div className="glass-card p-5 sm:p-8">
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Попробовать</h3>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900">0 ₽</div>
              <p className="text-gray-500 text-xs sm:text-sm">Для тех, кто сомневается</p>
            </div>

            <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <li className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                <span className="text-green-500">✓</span>
                <span>3 сказки (всего)</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                <span className="text-green-500">✓</span>
                <span>Стандартная озвучка</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                <span className="text-green-500">✓</span>
                <span>Текстовая версия</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-gray-400 text-sm sm:text-base">
                <span className="text-gray-300">✗</span>
                <span>Клонирование голоса</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-gray-400 text-sm sm:text-base">
                <span className="text-gray-300">✗</span>
                <span>Скачивание MP3</span>
              </li>
            </ul>

            <button
              onClick={() => setShowModal(true)}
              className="block w-full btn-secondary py-3 sm:py-4 text-center font-semibold text-gray-700 text-sm sm:text-base"
            >
              Создать первую сказку
            </button>
          </div>

          {/* Premium tier */}
          <div className="glass-card-strong p-5 sm:p-8 relative border-2 border-sky-300">
            <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
              Популярный выбор
            </div>

            <div className="text-center mb-4 sm:mb-6 mt-2 sm:mt-0">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Супер-Родитель</h3>
              <div className="text-3xl sm:text-4xl font-bold gradient-text">299 ₽<span className="text-base sm:text-lg text-gray-500 font-normal">/мес</span></div>
              <p className="text-gray-500 text-xs sm:text-sm">или 2990 ₽/год (выгода 2 месяца)</p>
            </div>

            <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <li className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                <span className="text-green-500">✓</span>
                <span><strong>Безлимитные</strong> сказки</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                <span className="text-blue-500">🎙</span>
                <span><strong>Клонирование голоса</strong></span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                <span className="text-blue-500">🖼</span>
                <span><strong>Уникальные иллюстрации</strong></span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                <span className="text-blue-500">📥</span>
                <span><strong>Скачивание MP3</strong></span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                <span className="text-blue-500">🛡</span>
                <span>Приоритетная генерация</span>
              </li>
            </ul>

            <button
              onClick={() => setShowModal(true)}
              className="block w-full btn-glow py-3 sm:py-4 text-center font-semibold text-white text-sm sm:text-base"
            >
              Попробовать 7 дней бесплатно
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
              Отмена в любой момент
            </p>
          </div>
        </div>

        {/* Price comparison */}
        <p className="text-center text-gray-500 text-xs sm:text-sm mt-6 sm:mt-8">
          💡 Это дешевле чашки кофе, но ценнее любой игрушки
        </p>
      </section>

      {/* ===== БЛОК 7: FAQ ===== */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Частые <span className="gradient-text">вопросы</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {[
            {
              q: "Это подписка? Как отменить?",
              a: "Да, это подписка для поддержки работы нейросетей. Вы можете отменить её в один клик в личном кабинете — никаких скрытых списаний и сложных процедур."
            },
            {
              q: "Как работает клонирование голоса? Это сложно?",
              a: "Очень просто! Вы нажимаете кнопку «Записать», читаете с экрана текст около 30 секунд. Наш ИИ запоминает ваш тембр и дальше озвучивает любые сказки вашим голосом."
            },
            {
              q: "Сколько длится одна сказка?",
              a: "Оптимальное время — 3-5 минут. Этого достаточно, чтобы раскрыть сюжет и усыпить ребенка, но не утомить его. Вы можете выбрать длительность при создании."
            },
            {
              q: "Можно ли сохранить сказку?",
              a: "Да! В тарифе «Супер-Родитель» вы можете скачивать аудиофайлы и отправлять их бабушкам, слушать в машине или в самолете без интернета."
            },
            {
              q: "Безопасен ли контент для детей?",
              a: "Абсолютно. Все сказки проходят тройную фильтрацию. ИИ настроен так, что никогда не создаст пугающий, жестокий или неуместный контент. Плюс вы всегда можете просмотреть сказку перед показом ребенку."
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

      {/* ===== БЛОК 8: ФИНАЛЬНЫЙ CTA ===== */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="relative overflow-hidden rounded-3xl sm:rounded-[40px] bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 p-6 sm:p-12 md:p-16 text-center">
          <div className="absolute top-0 left-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-40 sm:w-80 h-40 sm:h-80 bg-sky-300/20 rounded-full blur-3xl" />

          <div className="relative">
            <div className="text-4xl sm:text-5xl mb-4 sm:mb-6 sparkle">✨</div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
              Подарите ребёнку чудо
            </h2>
            <p className="text-base sm:text-lg text-sky-100 mb-6 sm:mb-8 max-w-xl mx-auto">
              Первая сказка уже ждёт. Введите имя ребёнка и начните магию.
            </p>

            {/* Final CTA with input */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Имя ребёнка"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="flex-1 px-5 sm:px-6 py-3 sm:py-4 rounded-full border-2 border-white/30 focus:border-white focus:outline-none text-gray-700 bg-white/90 backdrop-blur text-base"
              />
              <button
                onClick={() => setShowModal(true)}
                className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 whitespace-nowrap"
              >
                Создать сказку
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
              <span className="font-display font-bold text-gray-800">СказкаAI</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
              <a href="#" className="hover:text-blue-600 transition-colors">Конфиденциальность</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Оферта</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Контакты</a>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">
              © 2025 СказкаAI
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
                Скоро <span className="gradient-text">запуск!</span>
              </h3>

              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Мы уже заканчиваем работу над СказкаAI. Совсем скоро вы сможете создавать волшебные персональные сказки для своих детей.
              </p>

              <div className="glass-card p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center justify-center gap-2 text-blue-600 text-sm sm:text-base">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="font-medium">Следите за обновлениями</span>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="btn-glow px-6 sm:px-8 py-2.5 sm:py-3 text-white font-semibold w-full text-sm sm:text-base"
              >
                Понятно, жду!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
