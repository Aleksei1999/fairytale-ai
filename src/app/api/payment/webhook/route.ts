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

// Количество кредитов за каждый пакет (настрой под свои цены)
const CREDITS_BY_AMOUNT: Record<number, number> = {
  2: 1,      // $1.99 → 1 кредит
  4: 3,      // $3.99 → 3 кредита
  9: 5,      // $8.99 → 5 кредитов
  10: 10,    // $9.99 → 10 кредитов
  17: 10,    // $16.99 → 10 кредитов
  18: 10,    // $17.99 → 10 кредитов
  8: 10,     // $7.99 monthly → 10 кредитов
  80: 120,   // $79.99 yearly → 120 кредитов
};

function getCreditsForAmount(amount: number): number {
  // Округляем до целого для поиска
  const roundedAmount = Math.round(amount);
  return CREDITS_BY_AMOUNT[roundedAmount] || Math.ceil(amount / 2); // fallback: 1 кредит за $2
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
  const creditsToAdd = getCreditsForAmount(amount);

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

  // Находим или создаём профиль пользователя по email
  let { data: profile } = await supabase
    .from("profiles")
    .select("id, credits")
    .eq("email", buyer.email)
    .single();

  let userId: string | null = null;

  if (profile) {
    userId = profile.id;

    // Добавляем кредиты
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        credits: profile.credits + creditsToAdd,
        updated_at: new Date().toISOString()
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Error updating credits:", updateError);
    } else {
      console.log(`Added ${creditsToAdd} credits to ${buyer.email}, new total: ${profile.credits + creditsToAdd}`);
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
      credits_added: creditsToAdd,
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
