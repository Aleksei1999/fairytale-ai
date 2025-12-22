import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface CartoonPaymentRequest {
  packageId: "single" | "monthly" | "season";
}

// Цены пакетов мультиков
const CARTOON_PACKAGES = {
  single: { credits: 1, price: 9.90, offerId: process.env.LAVA_TOP_CARTOON_1_OFFER_ID },
  monthly: { credits: 4, price: 29.90, offerId: process.env.LAVA_TOP_CARTOON_4_OFFER_ID },
  season: { credits: 12, price: 79.90, offerId: process.env.LAVA_TOP_CARTOON_12_OFFER_ID },
};

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

    const body: CartoonPaymentRequest = await request.json();
    const { packageId } = body;

    if (!packageId) {
      return NextResponse.json(
        { success: false, error: "Package is required" },
        { status: 400 }
      );
    }

    const pkg = CARTOON_PACKAGES[packageId];
    if (!pkg) {
      return NextResponse.json(
        { success: false, error: "Invalid package selected" },
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

    // Если Offer ID не настроен, используем прямую оплату
    const offerId = pkg.offerId;
    if (!offerId) {
      console.warn(`Cartoon offer ID not configured for ${packageId}, using direct payment`);
      // Fallback: создаём прямую оплату без offerId
      // Это нужно будет настроить в Lava Top
    }

    // Create invoice via Lava Top API v3 using authenticated user's email
    const response = await fetch("https://gate.lava.top/api/v3/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({
        email: user.email,
        offerId: offerId || undefined,
        amount: !offerId ? pkg.price : undefined, // Если нет offerId, указываем сумму напрямую
        currency: "USD",
        buyerLanguage: "EN",
        description: `${pkg.credits} Cartoon Credit${pkg.credits > 1 ? "s" : ""} - FairyTaleAI`,
        clientUtm: {
          utm_source: "fairytale-ai",
          utm_medium: "website",
          utm_campaign: `cartoon-${packageId}`,
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
    console.error("Error creating cartoon payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
