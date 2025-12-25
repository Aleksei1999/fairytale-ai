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
    // Free Trial ($0/week) - 906b87bc-0fd3-4eca-a8a2-71b654e52ba5
    // Monthly ($8 first month, then $29) / Yearly ($189) - 0f1994eb-ee95-4c4b-85ed-4437ed82ba49
    const freeTrialOfferId = "906b87bc-0fd3-4eca-a8a2-71b654e52ba5";
    const subscriptionOfferId = "0f1994eb-ee95-4c4b-85ed-4437ed82ba49";

    const offerId = plan === "week" ? freeTrialOfferId : subscriptionOfferId;

    // Determine periodicity based on plan
    // Free trial is a one-time activation, Monthly/Yearly are subscriptions
    let periodicity: string | undefined;
    if (plan === "week") {
      periodicity = undefined; // Free trial, no payment periodicity
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
