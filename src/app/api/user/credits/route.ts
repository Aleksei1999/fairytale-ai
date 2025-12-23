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
      .select("credits, cartoon_credits, is_admin")
      .eq("email", user.email)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found", credits: 0, cartoonCredits: 0, isAdmin: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      credits: profile.credits || 0,
      cartoonCredits: profile.cartoon_credits || 0,
      isAdmin: profile.is_admin || false,
    });
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
