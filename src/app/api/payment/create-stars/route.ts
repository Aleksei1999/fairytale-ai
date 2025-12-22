import { NextRequest, NextResponse } from "next/server";

interface StarsPaymentRequest {
  email: string;
  packageId: "starter" | "popular" | "bigpack";
}

// Star packages configuration
const STAR_PACKAGES = {
  starter: {
    stars: 10,
    price: 14.90,
    offerId: "8b3c646b-47cf-4e0b-bd91-982fe2072529",
  },
  popular: {
    stars: 30,
    price: 39.90,
    offerId: "2cc27702-4f40-49e0-817f-59efb19eac22",
  },
  bigpack: {
    stars: 50,
    price: 59.90,
    offerId: "be6daac9-f5fb-4bd6-829b-ae1ba3eac3b2",
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: StarsPaymentRequest = await request.json();
    const { email, packageId } = body;

    if (!email || !packageId) {
      return NextResponse.json(
        { success: false, error: "Email and packageId are required" },
        { status: 400 }
      );
    }

    const pkg = STAR_PACKAGES[packageId];
    if (!pkg) {
      return NextResponse.json(
        { success: false, error: "Invalid package" },
        { status: 400 }
      );
    }


    const apiKey = process.env.LAVA_TOP_API_KEY;
    if (!apiKey) {
      console.error("LAVA_TOP_API_KEY is not configured");
      return NextResponse.json(
        { success: false, error: "Payment service not configured" },
        { status: 500 }
      );
    }

    // Create invoice via Lava Top API v3
    // Stars are one-time purchases, no periodicity needed
    const response = await fetch("https://gate.lava.top/api/v3/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({
        email,
        offerId: pkg.offerId,
        currency: "USD",
        buyerLanguage: "EN",
        clientUtm: {
          utm_source: "fairytale-ai",
          utm_medium: "website",
          utm_campaign: `stars-${packageId}`,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lava Top API error:", response.status, errorText);
      return NextResponse.json(
        { success: false, error: "Payment service error" },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      paymentUrl: data.paymentUrl,
      invoiceId: data.id,
      status: data.status,
    });
  } catch (error) {
    console.error("Error creating stars payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
