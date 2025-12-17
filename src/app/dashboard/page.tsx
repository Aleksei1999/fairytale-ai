"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

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
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user.user_metadata?.name || user.email?.split("@")[0]}! 👋
            </h1>
            <p className="text-gray-600">
              Manage your stories and account here.
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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

            {/* Buy Credits */}
            <Link
              href="/#pricing"
              className="glass-card p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  💎
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Get Credits</h3>
                  <p className="text-gray-600 text-sm">Purchase more credits for stories</p>
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
                <span className="text-gray-600">Member since</span>
                <span className="text-gray-900 font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
