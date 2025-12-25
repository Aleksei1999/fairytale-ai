import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest) {
  try {
    // Verify user session first
    const supabaseAuth = await createClient();
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("credits, cartoon_credits, is_admin, subscription_type, subscription_until, free_trial_stories_used")
      .eq("email", user.email)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found", credits: 0, cartoonCredits: 0, isAdmin: false },
        { status: 404 }
      );
    }

    // Check subscription status
    const subscriptionUntil = profile.subscription_until ? new Date(profile.subscription_until) : null;
    const hasActiveSubscription = subscriptionUntil && subscriptionUntil > new Date();
    const isFreeTrial = profile.subscription_type === "free_trial";
    const freeTrialExpired = isFreeTrial && !hasActiveSubscription;

    return NextResponse.json({
      success: true,
      credits: profile.credits || 0,
      cartoonCredits: profile.cartoon_credits || 0,
      isAdmin: profile.is_admin || false,
      subscriptionType: profile.subscription_type || null,
      subscriptionUntil: profile.subscription_until || null,
      hasActiveSubscription,
      isFreeTrial,
      freeTrialExpired,
      freeTrialStoriesUsed: profile.free_trial_stories_used || 0,
    });
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
