import { NextRequest, NextResponse } from "next/server";

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
        // First payment successful - activate subscription
        await handlePaymentSuccess(payload);
        break;

      case "subscription.recurring.payment.success":
        // Recurring payment successful - extend subscription
        await handleRecurringSuccess(payload);
        break;

      case "payment.failed":
      case "subscription.recurring.payment.failed":
        // Payment failed - notify user or suspend access
        await handlePaymentFailed(payload);
        break;

      case "subscription.cancelled":
        // Subscription cancelled - update user status
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
  const { buyer, contractId, amount, currency } = payload;

  console.log(`Payment success for ${buyer.email}:`, {
    contractId,
    amount,
    currency,
  });

  // TODO: Implement your business logic here
  // - Create/update user record in database
  // - Activate premium subscription
  // - Send confirmation email
  // - Grant access to premium features

  // Example: Store in your database
  // await db.user.upsert({
  //   where: { email: buyer.email },
  //   update: {
  //     isPremium: true,
  //     subscriptionId: contractId,
  //     subscriptionStartDate: new Date(),
  //   },
  //   create: {
  //     email: buyer.email,
  //     isPremium: true,
  //     subscriptionId: contractId,
  //     subscriptionStartDate: new Date(),
  //   },
  // });
}

async function handleRecurringSuccess(payload: WebhookPayload) {
  const { buyer, contractId, parentContractId } = payload;

  console.log(`Recurring payment success for ${buyer.email}:`, {
    contractId,
    parentContractId,
  });

  // TODO: Extend subscription period
  // await db.user.update({
  //   where: { email: buyer.email },
  //   data: { subscriptionRenewedAt: new Date() },
  // });
}

async function handlePaymentFailed(payload: WebhookPayload) {
  const { buyer, errorMessage } = payload;

  console.log(`Payment failed for ${buyer.email}:`, errorMessage);

  // TODO: Handle failed payment
  // - Send email notification to user
  // - Maybe give grace period before suspending access
}

async function handleSubscriptionCancelled(payload: WebhookPayload) {
  const { buyer, contractId } = payload;

  console.log(`Subscription cancelled for ${buyer.email}:`, contractId);

  // TODO: Update user subscription status
  // await db.user.update({
  //   where: { email: buyer.email },
  //   data: {
  //     isPremium: false,
  //     subscriptionCancelledAt: new Date(),
  //   },
  // });
}
