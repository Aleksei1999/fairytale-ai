import { NextRequest, NextResponse } from "next/server";

interface PaymentRequest {
  email: string;
  plan: "monthly" | "yearly";
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json();
    const { email, plan } = body;

    if (!email || !plan) {
      return NextResponse.json(
        { success: false, error: "Email and plan are required" },
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

    // Offer IDs from Lava Top dashboard
    const offerIds = {
      monthly: process.env.LAVA_TOP_MONTHLY_OFFER_ID,
      yearly: process.env.LAVA_TOP_YEARLY_OFFER_ID,
    };

    const offerId = offerIds[plan];
    if (!offerId) {
      return NextResponse.json(
        { success: false, error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Create invoice via Lava Top API v3
    const response = await fetch("https://gate.lava.top/api/v3/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({
        email,
        offerId,
        currency: "USD",
        periodicity: plan === "monthly" ? "MONTHLY" : "PERIOD_YEAR",
        buyerLanguage: "EN",
        clientUtm: {
          utm_source: "fairytale-ai",
          utm_medium: "website",
          utm_campaign: plan,
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
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
