import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("credits")
      .eq("email", email)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found", credits: 0 },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      credits: profile.credits,
    });
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
