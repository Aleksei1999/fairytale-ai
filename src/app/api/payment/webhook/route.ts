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

// Количество кредитов за подписку
const SUBSCRIPTION_CREDITS: Record<number, number> = {
  29: 30,     // $29 monthly → 30 кредитов на сказки
  249: 360,   // $249 yearly → 360 кредитов на сказки (30 * 12)
};

// Количество кредитов на мультики
const CARTOON_CREDITS: Record<number, number> = {
  10: 1,      // $9.90 → 1 мультик
  30: 4,      // $29.90 → 4 мультика
  80: 12,     // $79.90 → 12 мультиков
};

interface CreditResult {
  storyCredits: number;
  cartoonCredits: number;
  type: "subscription" | "cartoon";
}

function getCreditsForAmount(amount: number): CreditResult {
  const roundedAmount = Math.round(amount);

  // Проверяем подписку
  if (SUBSCRIPTION_CREDITS[roundedAmount]) {
    return {
      storyCredits: SUBSCRIPTION_CREDITS[roundedAmount],
      cartoonCredits: 1, // Бонусный мультик с подпиской
      type: "subscription"
    };
  }

  // Проверяем покупку мультиков
  if (CARTOON_CREDITS[roundedAmount]) {
    return {
      storyCredits: 0,
      cartoonCredits: CARTOON_CREDITS[roundedAmount],
      type: "cartoon"
    };
  }

  // Fallback для старых платежей
  return {
    storyCredits: Math.ceil(amount / 2),
    cartoonCredits: 0,
    type: "subscription"
  };
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
  const { buyer, contractId, amount, currency, eventType } = payload;
  const supabase = createAdminClient();

  console.log(`Payment success for ${buyer.email}:`, {
    contractId,
    amount,
    currency,
  });

  // Вычисляем количество кредитов
  const credits = getCreditsForAmount(amount);

  console.log(`Credits to add:`, credits);

  // Проверяем, не обработан ли уже этот платёж
  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id")
    .eq("contract_id", contractId)
    .single();

  if (existingPayment) {
    console.log(`Payment ${contractId} already processed, skipping`);
    return;
  }

  // Находим профиль пользователя по email
  let { data: profile } = await supabase
    .from("profiles")
    .select("id, credits, cartoon_credits")
    .eq("email", buyer.email)
    .single();

  let userId: string | null = null;

  if (profile) {
    userId = profile.id;

    // Добавляем кредиты
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (credits.storyCredits > 0) {
      updateData.credits = (profile.credits || 0) + credits.storyCredits;
    }
    if (credits.cartoonCredits > 0) {
      updateData.cartoon_credits = (profile.cartoon_credits || 0) + credits.cartoonCredits;
      // Устанавливаем срок действия 90 дней от сегодня
      const expireAt = new Date();
      expireAt.setDate(expireAt.getDate() + 90);
      updateData.cartoon_credits_expire_at = expireAt.toISOString();
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", profile.id);

    if (updateError) {
      console.error("Error updating credits:", updateError);
    } else {
      console.log(`Added to ${buyer.email}: ${credits.storyCredits} story credits, ${credits.cartoonCredits} cartoon credits`);
    }
  } else {
    // Пользователь не зарегистрирован - сохраним платёж, кредиты добавятся при регистрации
    console.log(`User ${buyer.email} not found, payment will be credited on registration`);
  }

  // Сохраняем платёж
  const { error: paymentError } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      email: buyer.email,
      contract_id: contractId,
      amount,
      currency,
      credits_added: credits.storyCredits,
      cartoon_credits_added: credits.cartoonCredits,
      payment_type: credits.type,
      status: "success",
      event_type: eventType,
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
