"use client";

// Facebook Pixel client-side helper with deduplication support
// Works together with server-side CAPI for redundant tracking

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

// Generate unique event ID for deduplication between Pixel and CAPI
export function generateEventId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Get Facebook cookies for better matching
export function getFacebookCookies(): { fbc?: string; fbp?: string } {
  if (typeof document === "undefined") return {};

  const cookies = document.cookie.split(";").reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      if (key === "_fbc") acc.fbc = value;
      if (key === "_fbp") acc.fbp = value;
      return acc;
    },
    {} as { fbc?: string; fbp?: string }
  );

  return cookies;
}

// Check if fbq is available
function isFbqAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

// Base track function with eventID for deduplication
function trackEvent(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (!isFbqAvailable()) {
    console.warn("Facebook Pixel not loaded");
    return null;
  }

  const id = eventId || generateEventId();

  // Send to Facebook Pixel with eventID for deduplication
  window.fbq("track", eventName, params, { eventID: id });

  console.log(`Facebook Pixel: ${eventName}`, { eventId: id, params });

  return id;
}

// Standard Facebook events

export function trackPageView() {
  if (!isFbqAvailable()) return;
  window.fbq("track", "PageView");
}

export function trackInitiateCheckout(params: {
  value: number;
  currency: string;
  contentName?: string;
  contentCategory?: string;
  eventId?: string;
}) {
  return trackEvent(
    "InitiateCheckout",
    {
      value: params.value,
      currency: params.currency,
      content_name: params.contentName,
      content_category: params.contentCategory,
    },
    params.eventId
  );
}

export function trackPurchase(params: {
  value: number;
  currency: string;
  contentName?: string;
  contentCategory?: string;
  orderId?: string;
  eventId?: string;
}) {
  return trackEvent(
    "Purchase",
    {
      value: params.value,
      currency: params.currency,
      content_name: params.contentName,
      content_category: params.contentCategory,
      order_id: params.orderId,
    },
    params.eventId
  );
}

export function trackCompleteRegistration(params?: {
  value?: number;
  currency?: string;
  eventId?: string;
}) {
  return trackEvent(
    "CompleteRegistration",
    {
      value: params?.value,
      currency: params?.currency,
    },
    params?.eventId
  );
}

export function trackLead(params?: {
  value?: number;
  currency?: string;
  contentName?: string;
  contentCategory?: string;
  eventId?: string;
}) {
  return trackEvent(
    "Lead",
    {
      value: params?.value,
      currency: params?.currency,
      content_name: params?.contentName,
      content_category: params?.contentCategory,
    },
    params?.eventId
  );
}

export function trackStartTrial(params?: {
  value?: number;
  currency?: string;
  eventId?: string;
}) {
  return trackEvent(
    "StartTrial",
    {
      value: params?.value || 0,
      currency: params?.currency || "USD",
    },
    params?.eventId
  );
}

export function trackSubscribe(params: {
  value: number;
  currency: string;
  predictedLtv?: number;
  eventId?: string;
}) {
  return trackEvent(
    "Subscribe",
    {
      value: params.value,
      currency: params.currency,
      predicted_ltv: params.predictedLtv,
    },
    params.eventId
  );
}

export function trackViewContent(params: {
  contentName?: string;
  contentCategory?: string;
  contentIds?: string[];
  value?: number;
  currency?: string;
  eventId?: string;
}) {
  return trackEvent(
    "ViewContent",
    {
      content_name: params.contentName,
      content_category: params.contentCategory,
      content_ids: params.contentIds,
      value: params.value,
      currency: params.currency,
    },
    params.eventId
  );
}

export function trackAddToCart(params: {
  value: number;
  currency: string;
  contentName?: string;
  contentCategory?: string;
  contentIds?: string[];
  eventId?: string;
}) {
  return trackEvent(
    "AddToCart",
    {
      value: params.value,
      currency: params.currency,
      content_name: params.contentName,
      content_category: params.contentCategory,
      content_ids: params.contentIds,
    },
    params.eventId
  );
}

// Custom events for your app

export function trackStoryCreated(params?: {
  storyId?: string;
  eventId?: string;
}) {
  return trackEvent(
    "StoryCreated",
    {
      content_type: "story",
      content_ids: params?.storyId ? [params.storyId] : undefined,
    },
    params?.eventId
  );
}

export function trackAudioGenerated(params?: {
  storyId?: string;
  eventId?: string;
}) {
  return trackEvent(
    "AudioGenerated",
    {
      content_type: "audio",
      content_ids: params?.storyId ? [params.storyId] : undefined,
    },
    params?.eventId
  );
}

export function trackCartoonRequested(params?: {
  characterId?: string;
  eventId?: string;
}) {
  return trackEvent(
    "CartoonRequested",
    {
      content_type: "cartoon",
      content_ids: params?.characterId ? [params.characterId] : undefined,
    },
    params?.eventId
  );
}
