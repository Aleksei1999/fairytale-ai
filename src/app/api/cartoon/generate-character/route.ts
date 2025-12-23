import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
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

  return `Create a high-quality 3D Disney/Pixar-style character portrait of a cute ${genderWord} child (around 6-8 years old) with the following features:
- ${hairDesc} hair, styled in a playful and age-appropriate way
- ${eyeDesc} eyes, large and expressive in the Disney animation style
- ${skinDesc} skin tone
- Friendly, warm expression with a gentle smile
- Soft, rounded facial features typical of Disney/Pixar child characters
- High-quality 3D render with professional studio lighting
- Clean, solid color background (soft gradient from light purple to pink)
- Portrait orientation, showing head and shoulders
- Wearing colorful, adventure-ready clothing

Style reference: Similar to characters from Disney's Encanto, Coco, or Pixar's Inside Out. The character should look friendly, approachable, and ready for adventure. High detail, professional quality 3D animation style.`;
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

    if (!isAdmin && userData.credits < 1) {
      return NextResponse.json(
        { success: false, error: "Insufficient credits" },
        { status: 400 }
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
    if (!isAdmin && userData.credits > 0) {
      await supabaseAdmin
        .from("profiles")
        .update({ credits: userData.credits - 1 })
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
