"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { buildAssistantContext, pageFromPath, type AssistantContext as JourneyAssistantContext, type AssistantPage } from "@/lib/ai/context";
import { track } from "@/lib/analytics";
import { useJourney } from "@/lib/journey/store";
import type { ChatMessage } from "@/lib/journey/types";
import { uid } from "@/lib/utils";
import { aiService, AssistantUnavailableError } from "@/services/aiService";

interface AssistantState {
  open: boolean;
  pending: boolean;
  mode: "live" | "demo" | null;
  page: AssistantPage;
  context: JourneyAssistantContext;
  openAssistant: (question?: string) => void;
  close: () => void;
  send: (question: string) => Promise<void>;
  retryLast: () => void;
}

const Ctx = createContext<AssistantState | null>(null);

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, actions } = useJourney();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [mode, setMode] = useState<"live" | "demo" | null>(null);
  const page = pageFromPath(pathname);
  const context = useMemo(() => buildAssistantContext(state, page), [state, page]);

  // Refs so `send` always sees the latest chat and context without re-creating.
  const chatRef = useRef(state.chat);
  const contextRef = useRef(context);
  useEffect(() => {
    chatRef.current = state.chat;
    contextRef.current = context;
  }, [state.chat, context]);

  useEffect(() => {
    if (open && mode === null) aiService.getMode().then(setMode);
  }, [open, mode]);

  const send = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (!text) return;
      const userMessage: ChatMessage = { id: uid("msg"), role: "user", content: text, createdAt: new Date().toISOString() };
      actions.addChat(userMessage);
      track("ai_question_asked", { page: contextRef.current.page });
      setPending(true);
      const history = [...chatRef.current, userMessage]
        .filter((m) => m.mode !== "unavailable")
        .map(({ role, content }) => ({ role, content }));
      try {
        const { reply, mode: replyMode } = await aiService.ask(history, contextRef.current);
        actions.addChat({ id: uid("msg"), role: "assistant", content: reply, createdAt: new Date().toISOString(), mode: replyMode });
      } catch (err) {
        const message = err instanceof AssistantUnavailableError ? err.message : new AssistantUnavailableError().message;
        actions.addChat({ id: uid("msg"), role: "assistant", content: message, createdAt: new Date().toISOString(), mode: "unavailable" });
      } finally {
        setPending(false);
      }
    },
    [actions],
  );

  const openAssistant = useCallback(
    (question?: string) => {
      setOpen(true);
      track("ai_opened", { page: contextRef.current.page });
      if (question) void send(question);
    },
    [send],
  );

  const retryLast = useCallback(() => {
    const lastUser = [...chatRef.current].reverse().find((m) => m.role === "user");
    if (lastUser) void send(lastUser.content);
  }, [send]);

  const value = useMemo(
    () => ({ open, pending, mode, page, context, openAssistant, close: () => setOpen(false), send, retryLast }),
    [open, pending, mode, page, context, openAssistant, send, retryLast],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAssistant() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAssistant must be used within AssistantProvider");
  return ctx;
}
