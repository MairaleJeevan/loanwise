/**
 * Application service (mock).
 *
 * Simulates the lender's application API: save draft, submit, and fetch
 * status. Swap the bodies of these functions for real HTTP calls later —
 * the rest of the app only depends on these signatures.
 */
import { STAGE_ORDER } from "@/lib/journey/constants";
import { DEMO_REFERENCE } from "@/lib/journey/demoData";
import type { ApplicationStage, SubmittedApplication } from "@/lib/journey/types";
import { NetworkError, simulation } from "@/lib/simulation";
import { delay } from "@/lib/utils";

function newReference(demoMode: boolean) {
  if (demoMode) return DEMO_REFERENCE;
  const n = Math.floor(100 + Math.random() * 99_000);
  return `APP-2026-${String(n).padStart(5, "0")}`;
}

export const applicationService = {
  async saveDraft(): Promise<{ savedAt: string }> {
    await delay(600);
    if (simulation.consumeNetworkFailure()) throw new NetworkError("We couldn't save your progress. Please try again.");
    return { savedAt: new Date().toISOString() };
  },

  async submit({ demoMode }: { demoMode: boolean }): Promise<SubmittedApplication> {
    await delay(1400);
    if (simulation.consumeNetworkFailure()) {
      throw new NetworkError("The connection dropped before we received it. Nothing you entered was lost — please try again.");
    }
    const now = new Date().toISOString();
    // Submission is instant; verification starts straight away.
    return { reference: newReference(demoMode), submittedAt: now, stage: "document_verification", lastUpdated: now };
  },

  async getStatus(app: SubmittedApplication): Promise<SubmittedApplication> {
    await delay(500);
    if (simulation.consumeNetworkFailure()) throw new NetworkError("We couldn't load your latest status. Please try again.");
    return app;
  },

  /** Demo-only: moves the application to the next stage to show the timeline. */
  nextStage(stage: ApplicationStage): ApplicationStage {
    const i = STAGE_ORDER.indexOf(stage);
    return STAGE_ORDER[Math.min(i + 1, STAGE_ORDER.length - 1)];
  },
};
