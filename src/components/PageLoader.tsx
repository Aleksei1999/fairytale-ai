"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PageLoader() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Reset on route change complete
    setLoading(false);
    setProgress(100);

    const timer = setTimeout(() => {
      setProgress(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    const handleStart = () => {
      setLoading(true);
      setProgress(10);

      // Simulate progress
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
    };

    // Intercept link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link) {
        const href = link.getAttribute("href");
        // Only trigger for internal navigation
        if (href && href.startsWith("/") && !href.startsWith("//")) {
          const currentPath = window.location.pathname + window.location.search;
          if (href !== currentPath) {
            handleStart();
          }
        }
      }
    };

    // Intercept programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      handleStart();
      return originalPushState.apply(this, args);
    };

    history.replaceState = function (...args) {
      handleStart();
      return originalReplaceState.apply(this, args);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      if (progressInterval) clearInterval(progressInterval);
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <>
      {/* Progress bar at top */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            opacity: loading || progress > 0 ? 1 : 0,
          }}
        />
      </div>

      {/* Full screen overlay with spinner */}
      {loading && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-gradient-to-b from-sky-50/80 to-white/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="flex flex-col items-center gap-4">
            {/* Animated logo/spinner */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-3xl">✨</span>
              </div>
              {/* Spinning ring */}
              <div className="absolute inset-0 w-16 h-16">
                <svg className="animate-spin" viewBox="0 0 64 64">
                  <circle
                    className="opacity-20"
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    style={{ color: "#0ea5e9" }}
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="80 176"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <p className="text-gray-600 font-medium animate-pulse">Loading...</p>
          </div>
        </div>
      )}
    </>
  );
}
