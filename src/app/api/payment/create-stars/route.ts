import { NextRequest, NextResponse } from "next/server";

interface StarsPaymentRequest {
  email: string;
  packageId: "starter" | "popular" | "bigpack";
}

// Star packages configuration
// TODO: Add Lava.top offer IDs when products are created
const STAR_PACKAGES = {
  starter: {
    stars: 10,
    price: 14.90,
    offerId: "", // TODO: Add Lava.top offer ID
  },
  popular: {
    stars: 30,
    price: 39.90,
    offerId: "", // TODO: Add Lava.top offer ID
  },
  bigpack: {
    stars: 50,
    price: 59.90,
    offerId: "", // TODO: Add Lava.top offer ID
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

    // Check if offer ID is configured
    if (!pkg.offerId) {
      console.error(`Lava.top offer ID not configured for package: ${packageId}`);
      return NextResponse.json(
        { success: false, error: "Star packages coming soon! Please check back later." },
        { status: 503 }
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
