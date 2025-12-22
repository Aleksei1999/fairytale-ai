import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface WebhookPayload {
  eventType:
    | "payment.success"
    | "payment.failed"
    | "subscription.recurring.payment.success"
    | "subscription.recurring.payment.failed"
    | "subscription.cancelled";
  product: {
    id: string;
    title: string;
  };
  contractId: string;
  parentContractId?: string;
  buyer: {
    email: string;
  };
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  errorMessage?: string;
  clientUtm?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
}

// Pricing configuration
// Week ($5) = 8 stars (one-time purchase)
// Monthly ($29) / Yearly ($189) = subscription (unlimited stories + 12-month program)
// Star packs: Starter ($14.90) = 10 stars, Popular ($39.90) = 30 stars, Big Pack ($59.90) = 50 stars
// Cartoon packs: Single ($9.90) = 1 credit, Monthly ($29.90) = 4 credits, Season ($79.90) = 12 credits

interface PaymentResult {
  stars: number;
  cartoonCredits: number;
  subscriptionDays: number;
  type: "week" | "subscription" | "stars" | "cartoon";
}

function getPaymentResult(amount: number, utmCampaign?: string): PaymentResult {
  const roundedAmount = Math.round(amount);

  // First check utm_campaign for precise identification
  if (utmCampaign) {
    // Cartoon packages (identified by utm_campaign)
    if (utmCampaign === "cartoon-single") {
      return { stars: 0, cartoonCredits: 1, subscriptionDays: 0, type: "cartoon" };
    }
    if (utmCampaign === "cartoon-monthly") {
      return { stars: 0, cartoonCredits: 4, subscriptionDays: 0, type: "cartoon" };
    }
    if (utmCampaign === "cartoon-season") {
      return { stars: 0, cartoonCredits: 12, subscriptionDays: 0, type: "cartoon" };
    }

    // Star packages (identified by utm_campaign)
    if (utmCampaign === "stars-starter") {
      return { stars: 10, cartoonCredits: 0, subscriptionDays: 0, type: "stars" };
    }
    if (utmCampaign === "stars-popular") {
      return { stars: 30, cartoonCredits: 0, subscriptionDays: 0, type: "stars" };
    }
    if (utmCampaign === "stars-bigpack") {
      return { stars: 50, cartoonCredits: 0, subscriptionDays: 0, type: "stars" };
    }

    // Subscription plans (identified by utm_campaign)
    if (utmCampaign === "week") {
      return { stars: 8, cartoonCredits: 0, subscriptionDays: 0, type: "week" };
    }
    if (utmCampaign === "monthly") {
      return { stars: 0, cartoonCredits: 0, subscriptionDays: 30, type: "subscription" };
    }
    if (utmCampaign === "yearly") {
      return { stars: 0, cartoonCredits: 0, subscriptionDays: 365, type: "subscription" };
    }
  }

  // Fallback: identify by amount (for recurring payments or missing utm)
  // Week pack: $5 = 8 stars
  if (roundedAmount === 5) {
    return { stars: 8, cartoonCredits: 0, subscriptionDays: 0, type: "week" };
  }

  // Monthly subscription: $29 = 30 days access
  if (roundedAmount === 29) {
    return { stars: 0, cartoonCredits: 0, subscriptionDays: 30, type: "subscription" };
  }

  // Yearly subscription: $189 = 365 days access
  if (roundedAmount === 189) {
    return { stars: 0, cartoonCredits: 0, subscriptionDays: 365, type: "subscription" };
  }

  // Star packs by amount (fallback)
  // Starter: $14.90 = 10 stars
  if (roundedAmount === 15) {
    return { stars: 10, cartoonCredits: 0, subscriptionDays: 0, type: "stars" };
  }
  // Popular: $39.90 = 30 stars
  if (roundedAmount === 40) {
    return { stars: 30, cartoonCredits: 0, subscriptionDays: 0, type: "stars" };
  }
  // Big Pack: $59.90 = 50 stars
  if (roundedAmount === 60) {
    return { stars: 50, cartoonCredits: 0, subscriptionDays: 0, type: "stars" };
  }

  // Cartoon packs by amount (fallback - less precise due to conflicts)
  // Single: $9.90 = 1 cartoon credit
  if (roundedAmount === 10) {
    return { stars: 0, cartoonCredits: 1, subscriptionDays: 0, type: "cartoon" };
  }
  // Monthly: $29.90 = 4 cartoon credits (rounds to 30, but $29 is subscription)
  if (roundedAmount === 30) {
    return { stars: 0, cartoonCredits: 4, subscriptionDays: 0, type: "cartoon" };
  }
  // Season: $79.90 = 12 cartoon credits
  if (roundedAmount === 80) {
    return { stars: 0, cartoonCredits: 12, subscriptionDays: 0, type: "cartoon" };
  }

  // Fallback for unknown amounts
  console.warn(`Unknown payment amount: $${amount}, utm_campaign: ${utmCampaign}`);
  return { stars: 0, cartoonCredits: 0, subscriptionDays: 0, type: "stars" };
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key from header
    const apiKey = request.headers.get("X-Api-Key");
    const expectedKey = process.env.LAVA_TOP_WEBHOOK_SECRET;

    if (expectedKey && apiKey !== expectedKey) {
      console.error("Invalid webhook API key");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload: WebhookPayload = await request.json();

    console.log("Received Lava Top webhook:", {
      eventType: payload.eventType,
      email: payload.buyer.email,
      contractId: payload.contractId,
      amount: payload.amount,
      currency: payload.currency,
    });

    switch (payload.eventType) {
      case "payment.success":
      case "subscription.recurring.payment.success":
        await handlePaymentSuccess(payload);
        break;

      case "payment.failed":
      case "subscription.recurring.payment.failed":
        await handlePaymentFailed(payload);
        break;

      case "subscription.cancelled":
        await handleSubscriptionCancelled(payload);
        break;

      default:
        console.log("Unknown event type:", payload.eventType);
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Return 500 to trigger Lava Top retry
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(payload: WebhookPayload) {
  const { buyer, contractId, amount, currency, eventType, clientUtm } = payload;
  const supabase = createAdminClient();

  console.log(`Payment success for ${buyer.email}:`, {
    contractId,
    amount,
    currency,
    utm_campaign: clientUtm?.utm_campaign,
  });

  // Determine what the payment gives (using utm_campaign for precise identification)
  const paymentResult = getPaymentResult(amount, clientUtm?.utm_campaign);

  console.log(`Payment result:`, paymentResult);

  // Check if payment already processed
  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id")
    .eq("contract_id", contractId)
    .single();

  if (existingPayment) {
    console.log(`Payment ${contractId} already processed, skipping`);
    return;
  }

  // Find user profile by email
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, credits, cartoon_credits, subscription_until")
    .eq("email", buyer.email)
    .single();

  let userId: string | null = null;

  if (profile) {
    userId = profile.id;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    // Add stars if applicable
    if (paymentResult.stars > 0) {
      updateData.credits = (profile.credits || 0) + paymentResult.stars;
    }

    // Add cartoon credits if applicable
    if (paymentResult.cartoonCredits > 0) {
      updateData.cartoon_credits = (profile.cartoon_credits || 0) + paymentResult.cartoonCredits;
    }

    // Extend subscription if applicable
    if (paymentResult.subscriptionDays > 0) {
      const now = new Date();
      const currentSubEnd = profile.subscription_until
        ? new Date(profile.subscription_until)
        : now;

      // Start from current subscription end or now, whichever is later
      const startDate = currentSubEnd > now ? currentSubEnd : now;
      const newSubEnd = new Date(startDate);
      newSubEnd.setDate(newSubEnd.getDate() + paymentResult.subscriptionDays);

      updateData.subscription_until = newSubEnd.toISOString();
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", profile.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
    } else {
      const updates = [];
      if (paymentResult.stars > 0) updates.push(`${paymentResult.stars} stars`);
      if (paymentResult.cartoonCredits > 0) updates.push(`${paymentResult.cartoonCredits} cartoon credits`);
      if (paymentResult.subscriptionDays > 0) updates.push(`${paymentResult.subscriptionDays} days subscription`);
      console.log(`Added to ${buyer.email}: ${updates.join(", ")}`);
    }
  } else {
    // User not registered - save payment, credits will be added on registration
    console.log(`User ${buyer.email} not found, payment will be credited on registration`);
  }

  // Save payment record
  const { error: paymentError } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      email: buyer.email,
      contract_id: contractId,
      amount,
      currency,
      credits_added: paymentResult.stars,
      cartoon_credits_added: paymentResult.cartoonCredits,
      subscription_days_added: paymentResult.subscriptionDays,
      payment_type: paymentResult.type,
      status: "success",
      event_type: eventType,
      utm_campaign: clientUtm?.utm_campaign,
    });

  if (paymentError) {
    console.error("Error saving payment:", paymentError);
  } else {
    console.log(`Payment ${contractId} saved successfully`);
  }
}

async function handlePaymentFailed(payload: WebhookPayload) {
  const { buyer, errorMessage, contractId } = payload;
  const supabase = createAdminClient();

  console.log(`Payment failed for ${buyer.email}:`, errorMessage);

  // Сохраняем неудачный платёж для аналитики
  await supabase
    .from("payments")
    .insert({
      email: buyer.email,
      contract_id: contractId,
      amount: payload.amount,
      currency: payload.currency,
      credits_added: 0,
      status: "failed",
      event_type: payload.eventType,
    });
}

async function handleSubscriptionCancelled(payload: WebhookPayload) {
  const { buyer, contractId } = payload;

  console.log(`Subscription cancelled for ${buyer.email}:`, contractId);

  // При отмене подписки кредиты не забираем - они уже оплачены
  // Просто логируем событие
}
