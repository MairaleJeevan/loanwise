"use client";

import { Sparkles } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useAssistant } from "./AssistantProvider";

/** Opens Loan Assistant, optionally asking a question straight away. */
export function AskAssistantButton({
  question,
  children = "Ask Loan Assistant",
  variant = "outline",
  ...props
}: { question?: string } & ButtonProps) {
  const { openAssistant } = useAssistant();
  return (
    <Button variant={variant} onClick={() => openAssistant(question)} {...props}>
      <Sparkles className="size-4" aria-hidden />
      {children}
    </Button>
  );
}

/** Inline text link that opens the assistant with a specific question. */
export function AskAssistantLink({ question, children }: { question: string; children: React.ReactNode }) {
  const { openAssistant } = useAssistant();
  return (
    <button type="button" onClick={() => openAssistant(question)} className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-700 hover:text-brand-900">
      <Sparkles className="size-3.5" aria-hidden />
      {children}
    </button>
  );
}

/** Floating launcher, always available. Sits above sticky CTAs on mobile. */
export function AssistantLauncher() {
  const { openAssistant, open } = useAssistant();
  if (open) return null;
  return (
    <button
      onClick={() => openAssistant()}
      className="fixed right-4 bottom-[92px] z-40 flex items-center gap-2 rounded-full bg-brand-800 py-3 pr-3 pl-3 text-white shadow-raised transition-colors hover:bg-brand-900 sm:right-6 sm:bottom-6 sm:pr-5 sm:pl-4"
      aria-label="Ask Loan Assistant"
    >
      <Sparkles className="size-5" aria-hidden />
      <span className="hidden text-sm font-medium sm:inline">Ask Loan Assistant</span>
    </button>
  );
}
