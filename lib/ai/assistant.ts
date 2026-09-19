/**
 * Server-side Loan Assistant. Only imported by the /api/assistant route, so
 * the API key never reaches the browser.
 *
 * Modes:
 *  - "live":     Claude answered using the journey context
 *  - "demo":     no API key configured — predefined contextual answers
 *  - "fallback": Claude was configured but failed/declined — predefined answer
 */
import Anthropic from "@anthropic-ai/sdk";
import type { AssistantContext } from "./context";
import { mockReply } from "./mockAssistant";
import { LOAN_ASSISTANT_SYSTEM_PROMPT, renderContextBlock } from "./prompts";

export interface AssistantTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantReply {
  reply: string;
  mode: "live" | "demo" | "fallback";
}

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";
const MAX_HISTORY = 12;

export function isLiveAIConfigured() {
  if (process.env.LOANWISE_AI_MODE === "mock") return false;
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

/** The API needs alternating turns starting with the user. */
function normaliseHistory(turns: AssistantTurn[]): AssistantTurn[] {
  const recent = turns.slice(-MAX_HISTORY);
  while (recent.length && recent[0].role !== "user") recent.shift();
  const merged: AssistantTurn[] = [];
  for (const t of recent) {
    const last = merged[merged.length - 1];
    if (last && last.role === t.role) last.content = `${last.content}\n\n${t.content}`;
    else merged.push({ ...t });
  }
  return merged;
}

let client: Anthropic | null = null;
function getClient() {
  client ??= new Anthropic({ timeout: 30_000, maxRetries: 1 });
  return client;
}

export async function generateAssistantReply(turns: AssistantTurn[], context: AssistantContext): Promise<AssistantReply> {
  const lastQuestion = [...turns].reverse().find((t) => t.role === "user")?.content ?? "";

  if (!isLiveAIConfigured()) {
    return { reply: mockReply(lastQuestion, context), mode: "demo" };
  }

  const messages = normaliseHistory(turns);
  if (!messages.length) return { reply: mockReply(lastQuestion, context), mode: "fallback" };

  try {
    const response = await getClient().beta.messages.create({
      model: MODEL,
      max_tokens: 2000,
      // Chat answers are short; low effort keeps latency down.
      output_config: { effort: "low" },
      // If a safety classifier declines, the API retries on a fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [
        { type: "text", text: LOAN_ASSISTANT_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
        { type: "text", text: renderContextBlock(context) },
      ],
      messages,
    });

    if (response.stop_reason === "refusal") {
      return { reply: mockReply(lastQuestion, context), mode: "fallback" };
    }
    const text = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();
    if (!text) return { reply: mockReply(lastQuestion, context), mode: "fallback" };
    return { reply: text, mode: "live" };
  } catch (error) {
    // Log the failure class only — never the customer's message or context.
    if (error instanceof Anthropic.RateLimitError) console.error("[assistant] rate limited");
    else if (error instanceof Anthropic.APIError) console.error(`[assistant] API error ${error.status ?? "unknown"}`);
    else console.error("[assistant] unexpected error", error instanceof Error ? error.name : "unknown");
    return { reply: mockReply(lastQuestion, context), mode: "fallback" };
  }
}
