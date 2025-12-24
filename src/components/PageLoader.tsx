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

      // Safety timeout - hide loader after 5 seconds max
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 5000);
    };

    // Intercept link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link) {
        const href = link.getAttribute("href");
        // Only trigger for internal navigation, skip auth routes (they redirect externally)
        if (href && href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/api/auth")) {
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

  // Only show thin progress bar at top, no full screen overlay
  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: loading || progress > 0 ? 1 : 0,
        }}
      />
    </div>
  );
}
