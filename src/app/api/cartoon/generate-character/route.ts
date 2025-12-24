import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface CharacterRequest {
  gender: "boy" | "girl";
  hairColor: string;
  eyeColor: string;
  skinColor: string;
  weekId?: string;
}

const hairColorDescriptions: Record<string, string> = {
  blonde: "golden blonde",
  brown: "rich brown",
  black: "jet black",
  red: "vibrant red",
  auburn: "warm auburn",
  gray: "silver gray",
};

const eyeColorDescriptions: Record<string, string> = {
  blue: "bright blue",
  green: "emerald green",
  brown: "warm brown",
  hazel: "hazel",
  gray: "steel gray",
  amber: "golden amber",
};

const skinColorDescriptions: Record<string, string> = {
  fair: "fair porcelain",
  light: "light",
  medium: "medium",
  olive: "olive",
  tan: "tan",
  dark: "dark",
};

function buildCharacterPrompt(options: CharacterRequest): string {
  const genderWord = options.gender === "boy" ? "boy" : "girl";
  const hairDesc = hairColorDescriptions[options.hairColor] || options.hairColor;
  const eyeDesc = eyeColorDescriptions[options.eyeColor] || options.eyeColor;
  const skinDesc = skinColorDescriptions[options.skinColor] || options.skinColor;

  return `Create a high-quality 3D Disney-style character of a cute ${genderWord} child (6-8 years old) with these EXACT features:

REQUIRED APPEARANCE:
- ${hairDesc} hair color
- ${eyeDesc} eye color
- ${skinDesc} skin tone

STYLE REQUIREMENTS:
- Hyper-realistic 3D Disney/Pixar animation style (like Encanto, Moana, Coco)
- Large expressive eyes with detailed iris and reflections
- Soft, rounded facial features with natural child proportions
- Smooth, flawless skin texture with subtle subsurface scattering
- Hair should have individual strand detail and natural flow
- Warm, friendly expression with a gentle smile
- Professional studio lighting with soft shadows
- Clean gradient background (soft purple to pink)
- Portrait shot showing head and shoulders
- Colorful, age-appropriate adventure clothing

QUALITY:
- Ultra high detail, 8K quality render
- Photorealistic 3D animation style
- Cinema-quality lighting and rendering
- The character should look like they belong in a modern Disney/Pixar animated film`;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabaseAuth = await createClient();
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body: CharacterRequest = await request.json();
    const { gender, hairColor, eyeColor, skinColor, weekId } = body;

    // Validate required fields
    if (!gender || !hairColor || !eyeColor || !skinColor) {
      return NextResponse.json(
        { success: false, error: "All character options are required" },
        { status: 400 }
      );
    }

    // Check if user has credits or is admin
    const supabaseAdmin = getSupabaseAdmin();
    const { data: userData, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("credits, is_admin")
      .eq("email", user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const isAdmin = userData.is_admin === true;
    const currentCredits = userData.credits ?? 0;

    // STRICT CHECK: Users with 0 or less credits cannot generate
    if (!isAdmin && currentCredits < 1) {
      return NextResponse.json(
        { success: false, error: "Insufficient credits. Please purchase credits first.", current: currentCredits },
        { status: 402 }
      );
    }

    // Build the prompt
    const prompt = buildCharacterPrompt({ gender, hairColor, eyeColor, skinColor });

    // Generate image using OpenAI DALL-E 3
    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "vivid",
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { success: false, error: "Failed to generate character image" },
        { status: 500 }
      );
    }

    const imageData = await openaiResponse.json();
    const imageUrl = imageData.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "No image generated" },
        { status: 500 }
      );
    }

    // Deduct credit (skip for admin)
    if (!isAdmin) {
      const newCredits = Math.max(0, currentCredits - 1); // Never go below 0
      await supabaseAdmin
        .from("profiles")
        .update({ credits: newCredits })
        .eq("email", user.email);
    }

    // Save character to database
    await supabaseAdmin
      .from("user_characters")
      .insert({
        user_id: user.id,
        gender,
        hair_color: hairColor,
        eye_color: eyeColor,
        skin_color: skinColor,
        image_url: imageUrl,
        week_id: weekId ? parseInt(weekId) : null,
      });

    return NextResponse.json({
      success: true,
      imageUrl,
    });

  } catch (error) {
    console.error("Character generation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
