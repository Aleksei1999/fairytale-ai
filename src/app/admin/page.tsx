"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

interface Metrics {
  users: {
    total: number;
    activeSubscribers: number;
    freeTrial: number;
    monthly: number;
    yearly: number;
    expired: number;
  };
  stories: {
    total: number;
    withAudio: number;
    byDay: { date: string; count: number }[];
  };
  revenue: {
    total: number;
    subscriptions: number;
    stars: number;
    paymentsCount: number;
  };
  registrations: {
    last30Days: number;
    byDay: { date: string; count: number }[];
  };
  utm: {
    registrationsBySource: { source: string; count: number }[];
    paymentsBySource: { source: string; count: number; revenue: number }[];
  };
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "pink";
}) {
  const colorClasses = {
    blue: "from-blue-400 to-blue-600",
    green: "from-green-400 to-emerald-600",
    purple: "from-purple-400 to-purple-600",
    orange: "from-orange-400 to-orange-600",
    pink: "from-pink-400 to-pink-600",
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Donut Chart Component
function DonutChart({
  data,
  title,
  total,
}: {
  data: { label: string; value: number; color: string }[];
  title: string;
  total: number;
}) {
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="glass-card p-6">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center gap-6">
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
            />
            {/* Data segments */}
            {data.map((segment, i) => {
              const percentage = total > 0 ? segment.value / total : 0;
              const strokeDasharray = `${percentage * circumference} ${circumference}`;
              const strokeDashoffset = -currentOffset * circumference;
              currentOffset += percentage;

              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{total}</span>
            <span className="text-xs text-gray-500">Total</span>
          </div>
        </div>
        {/* Legend */}
        <div className="flex-1 space-y-2">
          {data.map((segment, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-sm text-gray-600">{segment.label}</span>
              </div>
              <span className="font-semibold text-gray-900">{segment.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Bar Chart Component
function BarChart({
  data,
  title,
  formatValue = (v: number) => v.toString(),
}: {
  data: { label: string; value: number; color: string }[];
  title: string;
  formatValue?: (v: number) => string;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="glass-card p-6">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="font-semibold text-gray-900">{formatValue(item.value)}</span>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Line Chart Component
function LineChart({
  data,
  title,
  color = "#3b82f6",
}: {
  data: { date: string; count: number }[];
  title: string;
  color?: string;
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const width = 100;
  const height = 60;
  const padding = 2;

  // Create path
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - (d.count / maxCount) * (height - padding * 2);
    return { x, y, count: d.count, date: d.date };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Area path
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  // Total for the period
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-500">Total (7 days)</p>
        </div>
      </div>
      <div className="relative h-32">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + ratio * (height - padding * 2)}
              x2={width - padding}
              y2={padding + ratio * (height - padding * 2)}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          ))}
          {/* Area */}
          <path d={areaPath} fill={color} fillOpacity="0.1" />
          {/* Line */}
          <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Points */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} className="drop-shadow-sm" />
          ))}
        </svg>
        {/* Value labels on hover */}
        <div className="absolute inset-0 flex items-end">
          {data.map((d, i) => (
            <div
              key={i}
              className="flex-1 h-full group relative"
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {d.count} on {d.date.slice(5)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {data.map((d, i) => (
          <span key={i} className="text-center" style={{ width: `${100 / data.length}%` }}>
            {new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2)}
          </span>
        ))}
      </div>
    </div>
  );
}

// Stories Pie Chart (stories with audio vs without)
function StoriesPieChart({
  withAudio,
  total,
}: {
  withAudio: number;
  total: number;
}) {
  const withoutAudio = total - withAudio;
  const size = 120;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const audioPercentage = total > 0 ? withAudio / total : 0;
  const audioStroke = `${audioPercentage * circumference} ${circumference}`;

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth={strokeWidth}
            strokeDasharray={audioStroke}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{total}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-sm text-gray-600">With Audio</span>
          <span className="font-semibold text-gray-900">{withAudio}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-200" />
          <span className="text-sm text-gray-600">Text Only</span>
          <span className="font-semibold text-gray-900">{withoutAudio}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch("/api/admin/metrics");
        const data = await response.json();

        if (response.status === 403) {
          setError("Access denied. Admin privileges required.");
          return;
        }

        if (!data.success) {
          setError(data.error || "Failed to load metrics");
          return;
        }

        setMetrics(data.metrics);
      } catch (err) {
        console.error("Error fetching metrics:", err);
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchMetrics();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="glass-card p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/" className="text-blue-500 hover:text-blue-600 font-medium">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const subscriptionData = [
    { label: "Free Trial", value: metrics?.users.freeTrial || 0, color: "#3b82f6" },
    { label: "Monthly", value: metrics?.users.monthly || 0, color: "#10b981" },
    { label: "Yearly", value: metrics?.users.yearly || 0, color: "#8b5cf6" },
    { label: "Expired", value: metrics?.users.expired || 0, color: "#9ca3af" },
  ];

  const revenueData = [
    { label: "Subscriptions", value: metrics?.revenue.subscriptions || 0, color: "#10b981" },
    { label: "Star Packs", value: metrics?.revenue.stars || 0, color: "#f59e0b" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">FairyTaleAI Metrics</p>
              </div>
            </div>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 text-sm font-medium">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Users"
            value={metrics?.users.total || 0}
            subtitle={`+${metrics?.registrations.last30Days || 0} last 30 days`}
            color="blue"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
          />
          <MetricCard
            title="Active Subscribers"
            value={metrics?.users.activeSubscribers || 0}
            subtitle={`${metrics?.users.expired || 0} expired`}
            color="green"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <MetricCard
            title="Total Stories"
            value={metrics?.stories.total || 0}
            subtitle={`${metrics?.stories.withAudio || 0} with audio`}
            color="purple"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
          <MetricCard
            title="Total Revenue"
            value={`$${((metrics?.revenue.total || 0) / 100).toFixed(0)}`}
            subtitle={`${metrics?.revenue.paymentsCount || 0} payments`}
            color="orange"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Charts Row 1: Subscriptions & Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DonutChart
            data={subscriptionData}
            title="Subscription Breakdown"
            total={metrics?.users.total || 0}
          />
          <BarChart
            data={revenueData}
            title="Revenue Breakdown"
            formatValue={(v) => `$${(v / 100).toFixed(0)}`}
          />
        </div>

        {/* Charts Row 2: Line charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {metrics?.registrations.byDay && (
            <LineChart
              data={metrics.registrations.byDay}
              title="New Registrations"
              color="#3b82f6"
            />
          )}
          {metrics?.stories.byDay && (
            <LineChart
              data={metrics.stories.byDay}
              title="Stories Created"
              color="#8b5cf6"
            />
          )}
        </div>

        {/* Stories Stats */}
        <div className="glass-card p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Stories Overview</h3>
          <StoriesPieChart
            withAudio={metrics?.stories.withAudio || 0}
            total={metrics?.stories.total || 0}
          />
        </div>

        {/* UTM Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registrations by Source */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Registrations by Source
            </h3>
            {metrics?.utm?.registrationsBySource && metrics.utm.registrationsBySource.length > 0 ? (
              <div className="space-y-3">
                {metrics.utm.registrationsBySource.slice(0, 10).map((item, i) => {
                  const maxCount = metrics.utm.registrationsBySource[0]?.count || 1;
                  const percentage = (item.count / maxCount) * 100;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 capitalize">{item.source}</span>
                        <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No UTM data yet. Users will be tracked after migration.</p>
            )}
          </div>

          {/* Payments by Source */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Payments by Source
            </h3>
            {metrics?.utm?.paymentsBySource && metrics.utm.paymentsBySource.length > 0 ? (
              <div className="space-y-3">
                {metrics.utm.paymentsBySource.slice(0, 10).map((item, i) => {
                  const maxRevenue = metrics.utm.paymentsBySource[0]?.revenue || 1;
                  const percentage = (item.revenue / maxRevenue) * 100;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 capitalize">{item.source}</span>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-gray-900">${(item.revenue / 100).toFixed(0)}</span>
                          <span className="text-xs text-gray-500 ml-2">({item.count} orders)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No payment UTM data yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
