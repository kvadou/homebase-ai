type EventProperties = Record<string, string | number | boolean>;

/**
 * Track a marketing/conversion event.
 * Sends to GA4 via gtag if available, logs to console in development.
 */
export function trackEvent(
  eventName: string,
  properties?: EventProperties
): void {
  // Send to GA4 if gtag is available
  if (typeof window !== "undefined" && "gtag" in window) {
    (window as any).gtag("event", eventName, properties);
  }

  // Log in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${eventName}`, properties);
  }
}

/**
 * Pre-defined marketing events for the landing page.
 */
export const MarketingEvents = {
  /** CTA button was clicked */
  ctaClicked: (buttonText: string, location: string) =>
    trackEvent("cta_clicked", { button_text: buttonText, location }),

  /** Pricing toggle was switched */
  pricingToggle: (period: "monthly" | "annual") =>
    trackEvent("pricing_toggle", { period }),

  /** FAQ item was expanded */
  faqExpanded: (questionIndex: number, questionText: string) =>
    trackEvent("faq_expanded", {
      question_index: questionIndex,
      question_text: questionText,
    }),

  /** A page section came into view */
  sectionViewed: (sectionName: string) =>
    trackEvent("section_viewed", { section_name: sectionName }),

  /** Signup flow initiated from landing page */
  signupInitiated: (source: string, plan?: string) =>
    trackEvent("signup_initiated", {
      source,
      ...(plan ? { plan } : {}),
    }),
} as const;
