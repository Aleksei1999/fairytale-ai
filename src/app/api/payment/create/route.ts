import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface PaymentRequest {
  plan: "week" | "monthly" | "yearly";
}

export async function POST(request: NextRequest) {
  try {
    // Verify user session first
    const supabaseAuth = await createClient();
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body: PaymentRequest = await request.json();
    const { plan } = body;

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Plan is required" },
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

    // Different offer IDs for different plans
    // Week ($5) has its own product, Monthly/Yearly ($29/$189) share another product
    const weekOfferId = "378eca87-00e2-4a74-8fa9-68a83e2cac61";
    const subscriptionOfferId = "0f1994eb-ee95-4c4b-85ed-4437ed82ba49";

    const offerId = plan === "week" ? weekOfferId : subscriptionOfferId;

    // Determine periodicity based on plan
    // Week is a one-time purchase, not a subscription
    let periodicity: string | undefined;
    if (plan === "week") {
      periodicity = undefined; // One-time payment, no periodicity
    } else if (plan === "monthly") {
      periodicity = "MONTHLY";
    } else {
      periodicity = "PERIOD_YEAR";
    }

    // Create invoice via Lava Top API v3 using authenticated user's email
    const requestBody: Record<string, unknown> = {
      email: user.email,
      offerId,
      currency: "USD",
      buyerLanguage: "EN",
      clientUtm: {
        utm_source: "fairytale-ai",
        utm_medium: "website",
        utm_campaign: plan,
      },
    };

    // Only add periodicity for subscriptions (not for one-time purchases)
    if (periodicity) {
      requestBody.periodicity = periodicity;
    }

    const response = await fetch("https://gate.lava.top/api/v3/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(requestBody),
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
