import crypto from "crypto";

const FB_PIXEL_ID = process.env.FB_PIXEL_ID || "879325877922511";
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const FB_API_VERSION = "v18.0";

interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string; // Facebook click ID cookie
  fbp?: string; // Facebook browser ID cookie
  externalId?: string; // Your user ID
}

interface CustomData {
  value?: number;
  currency?: string;
  contentName?: string;
  contentCategory?: string;
  contentIds?: string[];
  contentType?: string;
  numItems?: number;
  orderId?: string;
  predictedLtv?: number;
  status?: string;
}

interface FacebookEvent {
  eventName: string;
  eventTime: number;
  eventId: string; // For deduplication with browser pixel
  eventSourceUrl?: string;
  actionSource: "website" | "app" | "email" | "phone_call" | "chat" | "physical_store" | "system_generated" | "other";
  userData: UserData;
  customData?: CustomData;
}

// Hash user data according to Facebook requirements (SHA256, lowercase, trimmed)
function hashData(data: string | undefined): string | undefined {
  if (!data) return undefined;
  const normalized = data.toLowerCase().trim();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

// Normalize phone number (remove spaces, dashes, etc.)
function normalizePhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  return phone.replace(/[\s\-\(\)\.]/g, "");
}

// Generate unique event ID for deduplication
export function generateEventId(): string {
  return `${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
}

// Prepare user data with proper hashing
function prepareUserData(userData: UserData): Record<string, string | undefined> {
  return {
    em: hashData(userData.email),
    ph: hashData(normalizePhone(userData.phone)),
    fn: hashData(userData.firstName),
    ln: hashData(userData.lastName),
    ct: hashData(userData.city),
    country: hashData(userData.country),
    client_ip_address: userData.clientIpAddress,
    client_user_agent: userData.clientUserAgent,
    fbc: userData.fbc,
    fbp: userData.fbp,
    external_id: userData.externalId ? hashData(userData.externalId) : undefined,
  };
}

// Send event to Facebook Conversions API
export async function sendFacebookEvent(event: FacebookEvent): Promise<{ success: boolean; error?: string }> {
  if (!FB_ACCESS_TOKEN) {
    console.warn("FB_ACCESS_TOKEN not set, skipping Facebook CAPI event");
    return { success: false, error: "FB_ACCESS_TOKEN not configured" };
  }

  const url = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PIXEL_ID}/events`;

  const payload = {
    data: [
      {
        event_name: event.eventName,
        event_time: event.eventTime,
        event_id: event.eventId,
        event_source_url: event.eventSourceUrl,
        action_source: event.actionSource,
        user_data: prepareUserData(event.userData),
        custom_data: event.customData,
      },
    ],
    access_token: FB_ACCESS_TOKEN,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Facebook CAPI error:", result);
      return { success: false, error: result.error?.message || "Unknown error" };
    }

    console.log(`Facebook CAPI: ${event.eventName} sent successfully`, {
      eventId: event.eventId,
      eventsReceived: result.events_received,
    });

    return { success: true };
  } catch (error) {
    console.error("Facebook CAPI fetch error:", error);
    return { success: false, error: String(error) };
  }
}

// Convenience functions for common events

export async function trackPurchase(params: {
  email: string;
  value: number;
  currency: string;
  orderId: string;
  contentName?: string;
  contentCategory?: string;
  eventId?: string;
  clientIp?: string;
  userAgent?: string;
  userId?: string;
}) {
  return sendFacebookEvent({
    eventName: "Purchase",
    eventTime: Math.floor(Date.now() / 1000),
    eventId: params.eventId || generateEventId(),
    actionSource: "website",
    userData: {
      email: params.email,
      clientIpAddress: params.clientIp,
      clientUserAgent: params.userAgent,
      externalId: params.userId,
    },
    customData: {
      value: params.value,
      currency: params.currency,
      orderId: params.orderId,
      contentName: params.contentName,
      contentCategory: params.contentCategory,
    },
  });
}

export async function trackInitiateCheckout(params: {
  email?: string;
  value: number;
  currency: string;
  contentName?: string;
  contentCategory?: string;
  eventId?: string;
  clientIp?: string;
  userAgent?: string;
  userId?: string;
  eventSourceUrl?: string;
}) {
  return sendFacebookEvent({
    eventName: "InitiateCheckout",
    eventTime: Math.floor(Date.now() / 1000),
    eventId: params.eventId || generateEventId(),
    eventSourceUrl: params.eventSourceUrl,
    actionSource: "website",
    userData: {
      email: params.email,
      clientIpAddress: params.clientIp,
      clientUserAgent: params.userAgent,
      externalId: params.userId,
    },
    customData: {
      value: params.value,
      currency: params.currency,
      contentName: params.contentName,
      contentCategory: params.contentCategory,
    },
  });
}

export async function trackCompleteRegistration(params: {
  email: string;
  eventId?: string;
  clientIp?: string;
  userAgent?: string;
  userId?: string;
  eventSourceUrl?: string;
}) {
  return sendFacebookEvent({
    eventName: "CompleteRegistration",
    eventTime: Math.floor(Date.now() / 1000),
    eventId: params.eventId || generateEventId(),
    eventSourceUrl: params.eventSourceUrl,
    actionSource: "website",
    userData: {
      email: params.email,
      clientIpAddress: params.clientIp,
      clientUserAgent: params.userAgent,
      externalId: params.userId,
    },
  });
}

export async function trackLead(params: {
  email?: string;
  contentName?: string;
  contentCategory?: string;
  eventId?: string;
  clientIp?: string;
  userAgent?: string;
  userId?: string;
  eventSourceUrl?: string;
}) {
  return sendFacebookEvent({
    eventName: "Lead",
    eventTime: Math.floor(Date.now() / 1000),
    eventId: params.eventId || generateEventId(),
    eventSourceUrl: params.eventSourceUrl,
    actionSource: "website",
    userData: {
      email: params.email,
      clientIpAddress: params.clientIp,
      clientUserAgent: params.userAgent,
      externalId: params.userId,
    },
    customData: {
      contentName: params.contentName,
      contentCategory: params.contentCategory,
    },
  });
}

export async function trackStartTrial(params: {
  email: string;
  value?: number;
  currency?: string;
  eventId?: string;
  clientIp?: string;
  userAgent?: string;
  userId?: string;
  eventSourceUrl?: string;
}) {
  return sendFacebookEvent({
    eventName: "StartTrial",
    eventTime: Math.floor(Date.now() / 1000),
    eventId: params.eventId || generateEventId(),
    eventSourceUrl: params.eventSourceUrl,
    actionSource: "website",
    userData: {
      email: params.email,
      clientIpAddress: params.clientIp,
      clientUserAgent: params.userAgent,
      externalId: params.userId,
    },
    customData: {
      value: params.value || 0,
      currency: params.currency || "USD",
    },
  });
}

export async function trackSubscribe(params: {
  email: string;
  value: number;
  currency: string;
  predictedLtv?: number;
  eventId?: string;
  clientIp?: string;
  userAgent?: string;
  userId?: string;
}) {
  return sendFacebookEvent({
    eventName: "Subscribe",
    eventTime: Math.floor(Date.now() / 1000),
    eventId: params.eventId || generateEventId(),
    actionSource: "website",
    userData: {
      email: params.email,
      clientIpAddress: params.clientIp,
      clientUserAgent: params.userAgent,
      externalId: params.userId,
    },
    customData: {
      value: params.value,
      currency: params.currency,
      predictedLtv: params.predictedLtv,
    },
  });
}
