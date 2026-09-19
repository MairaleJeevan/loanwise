"use client";

/**
 * Lightweight mock analytics. Events are kept in localStorage so the
 * /dev/analytics view can show a funnel. Replace `send` with a real
 * collector (Segment, GA4, PostHog…) in production.
 *
 * Privacy: never pass names, phone numbers, emails, amounts or document
 * details as properties — only journey-level, non-identifying context.
 */
export type AnalyticsEvent =
  | "landing_viewed"
  | "eligibility_started"
  | "business_profile_completed"
  | "financial_info_completed"
  | "eligibility_result_viewed"
  | "loan_option_selected"
  | "document_started"
  | "document_completed"
  | "application_started"
  | "application_saved"
  | "application_submitted"
  | "ai_opened"
  | "ai_question_asked"
  | "application_status_viewed"
  | "demo_started";

type Props = Record<string, string | number | boolean | null | undefined>;

export interface TrackedEvent {
  name: AnalyticsEvent;
  props: Props;
  at: string;
}

const KEY = "loanwise.analytics.v1";
const MAX_EVENTS = 500;

function read(): TrackedEvent[] {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function track(name: AnalyticsEvent, props: Props = {}) {
  if (typeof window === "undefined") return;
  const event: TrackedEvent = { name, props, at: new Date().toISOString() };
  try {
    const events = read();
    events.push(event);
    window.localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
    window.dispatchEvent(new Event("loanwise:analytics"));
  } catch {
    /* storage unavailable — analytics must never break the journey */
  }
  if (process.env.NODE_ENV === "development") {
    console.debug(`[analytics] ${name}`, props);
  }
}

export function getEvents(): TrackedEvent[] {
  if (typeof window === "undefined") return [];
  return read();
}

export function clearEvents() {
  try {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("loanwise:analytics"));
  } catch {
    /* ignore */
  }
}
