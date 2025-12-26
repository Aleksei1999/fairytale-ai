import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest) {
  try {
    // Verify user session and admin status
    const supabaseAuth = await createClient();
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("email", user.email)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all metrics in parallel
    const [
      profilesResult,
      storiesResult,
      paymentsResult,
      recentRegistrationsResult,
    ] = await Promise.all([
      // Total users and subscription breakdown
      supabase
        .from("profiles")
        .select("id, subscription_type, subscription_until, created_at"),

      // Stories count
      supabase
        .from("stories")
        .select("id, audio_url, created_at"),

      // Payments for revenue
      supabase
        .from("payments")
        .select("id, amount, status, payment_type, created_at")
        .eq("status", "completed"),

      // Recent registrations (last 30 days)
      supabase
        .from("profiles")
        .select("id, created_at")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    const profiles = profilesResult.data || [];
    const stories = storiesResult.data || [];
    const payments = paymentsResult.data || [];
    const recentRegistrations = recentRegistrationsResult.data || [];

    // Calculate metrics
    const now = new Date();

    // User metrics
    const totalUsers = profiles.length;
    const activeSubscribers = profiles.filter(p =>
      p.subscription_until && new Date(p.subscription_until) > now
    );

    const freeTrialUsers = activeSubscribers.filter(p => p.subscription_type === "free_trial").length;
    const monthlyUsers = activeSubscribers.filter(p => p.subscription_type === "monthly").length;
    const yearlyUsers = activeSubscribers.filter(p => p.subscription_type === "yearly").length;
    const expiredUsers = profiles.filter(p =>
      p.subscription_until && new Date(p.subscription_until) <= now
    ).length;

    // Story metrics
    const totalStories = stories.length;
    const storiesWithAudio = stories.filter(s => s.audio_url).length;

    // Revenue metrics
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const subscriptionPayments = payments.filter(p => p.payment_type === "subscription");
    const starsPayments = payments.filter(p => p.payment_type === "stars");

    const subscriptionRevenue = subscriptionPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const starsRevenue = starsPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Registrations by day (last 7 days)
    const registrationsByDay: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const count = recentRegistrations.filter(r =>
        r.created_at?.startsWith(dateStr)
      ).length;

      registrationsByDay.push({ date: dateStr, count });
    }

    // Stories by day (last 7 days)
    const storiesByDay: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const count = stories.filter(s =>
        s.created_at?.startsWith(dateStr)
      ).length;

      storiesByDay.push({ date: dateStr, count });
    }

    return NextResponse.json({
      success: true,
      metrics: {
        users: {
          total: totalUsers,
          activeSubscribers: activeSubscribers.length,
          freeTrial: freeTrialUsers,
          monthly: monthlyUsers,
          yearly: yearlyUsers,
          expired: expiredUsers,
        },
        stories: {
          total: totalStories,
          withAudio: storiesWithAudio,
          byDay: storiesByDay,
        },
        revenue: {
          total: totalRevenue,
          subscriptions: subscriptionRevenue,
          stars: starsRevenue,
          paymentsCount: payments.length,
        },
        registrations: {
          last30Days: recentRegistrations.length,
          byDay: registrationsByDay,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin metrics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
