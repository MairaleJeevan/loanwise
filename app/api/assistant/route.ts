import { generateAssistantReply, isLiveAIConfigured, type AssistantTurn } from "@/lib/ai/assistant";
import type { AssistantContext } from "@/lib/ai/context";

const MAX_TURNS = 30;
const MAX_CHARS = 2000;

export async function GET() {
  return Response.json({ mode: isLiveAIConfigured() ? "live" : "demo" });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { messages, context } = (body ?? {}) as { messages?: unknown; context?: unknown };
  if (!Array.isArray(messages) || !messages.length || typeof context !== "object" || context === null) {
    return Response.json({ error: "Expected { messages, context }" }, { status: 400 });
  }

  const turns: AssistantTurn[] = messages
    .slice(-MAX_TURNS)
    .filter(
      (m): m is AssistantTurn =>
        typeof m === "object" && m !== null && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  if (!turns.some((t) => t.role === "user")) {
    return Response.json({ error: "No user message" }, { status: 400 });
  }

  const result = await generateAssistantReply(turns, context as AssistantContext);
  return Response.json(result);
}
