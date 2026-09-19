/**
 * Client-side AI service. Talks to our own /api/assistant route — never to
 * the model provider directly — so no API key is ever exposed in the browser.
 */
import type { AssistantContext } from "@/lib/ai/context";
import type { ChatMode } from "@/lib/journey/types";
import { simulation } from "@/lib/simulation";

export class AssistantUnavailableError extends Error {
  constructor() {
    super("Loan Assistant is temporarily unavailable. You can continue your application and return later.");
    this.name = "AssistantUnavailableError";
  }
}

export interface AskResult {
  reply: string;
  mode: Exclude<ChatMode, "unavailable">;
}

export const aiService = {
  async ask(history: { role: "user" | "assistant"; content: string }[], context: AssistantContext): Promise<AskResult> {
    if (simulation.get().aiUnavailable) {
      await new Promise((r) => setTimeout(r, 700));
      throw new AssistantUnavailableError();
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45_000);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context }),
        signal: controller.signal,
      });
      if (!res.ok) throw new AssistantUnavailableError();
      const data = (await res.json()) as AskResult;
      if (!data?.reply) throw new AssistantUnavailableError();
      return data;
    } catch {
      throw new AssistantUnavailableError();
    } finally {
      clearTimeout(timer);
    }
  },

  async getMode(): Promise<"live" | "demo"> {
    try {
      const res = await fetch("/api/assistant");
      const data = await res.json();
      return data.mode === "live" ? "live" : "demo";
    } catch {
      return "demo";
    }
  },
};
