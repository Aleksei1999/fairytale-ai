"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect old buy-cartoons page to new buy-stars page
export default function BuyCartoons() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/buy-stars");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Stars...</p>
      </div>
    </div>
  );
}
