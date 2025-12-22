import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

interface CartoonRequest {
  storyId: string;
}

const STAR_COST_CARTOON = 5; // Cost in stars for cartoon generation

export async function POST(request: NextRequest) {
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

    const body: CartoonRequest = await request.json();
    const { storyId } = body;

    if (!storyId) {
      return NextResponse.json(
        { success: false, error: "Story ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get user profile using authenticated user's email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, credits")
      .eq("email", user.email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check stars balance
    const currentStars = profile.credits || 0;
    if (currentStars < STAR_COST_CARTOON) {
      return NextResponse.json(
        { success: false, error: "Not enough stars", required: STAR_COST_CARTOON, current: currentStars },
        { status: 402 }
      );
    }

    // Check if story exists and belongs to user
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .select("id, user_id, cartoon_requested")
      .eq("id", storyId)
      .single();

    if (storyError || !story) {
      return NextResponse.json(
        { success: false, error: "Story not found" },
        { status: 404 }
      );
    }

    if (story.user_id !== profile.id) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    if (story.cartoon_requested) {
      return NextResponse.json(
        { success: false, error: "Cartoon already requested for this story" },
        { status: 400 }
      );
    }

    // Deduct stars for cartoon
    const { error: creditError } = await supabase
      .from("profiles")
      .update({
        credits: currentStars - STAR_COST_CARTOON,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (creditError) {
      console.error("Error deducting cartoon credit:", creditError);
      return NextResponse.json(
        { success: false, error: "Failed to process request" },
        { status: 500 }
      );
    }

    // Update story to mark cartoon as requested
    const { error: updateError } = await supabase
      .from("stories")
      .update({
        cartoon_requested: true,
        cartoon_status: "pending",
        cartoon_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", storyId);

    if (updateError) {
      console.error("Error updating story:", updateError);
      // Refund the stars since the update failed
      await supabase
        .from("profiles")
        .update({ credits: currentStars })
        .eq("id", profile.id);

      return NextResponse.json(
        { success: false, error: "Failed to request cartoon" },
        { status: 500 }
      );
    }

    console.log(`Cartoon requested for story ${storyId} by ${user.email}`);

    return NextResponse.json({
      success: true,
      message: "Cartoon request submitted",
      storyId,
      starsUsed: STAR_COST_CARTOON,
      starsRemaining: currentStars - STAR_COST_CARTOON,
    });
  } catch (error) {
    console.error("Error requesting cartoon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to request cartoon" },
      { status: 500 }
    );
  }
}
