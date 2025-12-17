import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface CartoonRequest {
  storyId: string;
  userEmail: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CartoonRequest = await request.json();
    const { storyId, userEmail } = body;

    if (!storyId || !userEmail) {
      return NextResponse.json(
        { success: false, error: "Story ID and email are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, cartoon_credits")
      .eq("email", userEmail)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check cartoon credits
    const cartoonCredits = profile.cartoon_credits || 0;
    if (cartoonCredits < 1) {
      return NextResponse.json(
        { success: false, error: "Not enough cartoon credits", creditsAvailable: cartoonCredits },
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

    // Deduct 1 cartoon credit
    const { error: creditError } = await supabase
      .from("profiles")
      .update({
        cartoon_credits: cartoonCredits - 1,
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
      // Refund the credit since the update failed
      await supabase
        .from("profiles")
        .update({ cartoon_credits: cartoonCredits })
        .eq("id", profile.id);

      return NextResponse.json(
        { success: false, error: "Failed to request cartoon" },
        { status: 500 }
      );
    }

    console.log(`Cartoon requested for story ${storyId} by ${userEmail}`);

    return NextResponse.json({
      success: true,
      message: "Cartoon request submitted",
      storyId,
      creditsRemaining: cartoonCredits - 1,
    });
  } catch (error) {
    console.error("Error requesting cartoon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to request cartoon" },
      { status: 500 }
    );
  }
}
