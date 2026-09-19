"use client";

import { useState } from "react";
import { ArrowUp, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

// PAN (ABCDE1234F), 12-digit Aadhaar, or long account-number-like digit runs.
const SENSITIVE = /\b[A-Z]{5}\d{4}[A-Z]\b|\b\d{4}\s?\d{4}\s?\d{4}\b|\b\d{11,18}\b/i;

export function ChatInput({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
  const [value, setValue] = useState("");
  const [warning, setWarning] = useState(false);

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    if (SENSITIVE.test(text)) {
      setWarning(true);
      return;
    }
    onSend(text);
    setValue("");
    setWarning(false);
  };

  return (
    <div>
      {warning && (
        <p role="alert" className="mb-2 flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2 text-[13px] text-rose-800">
          <ShieldAlert className="mt-px size-4 shrink-0" aria-hidden />
          That looks like an ID or account number. Please don&apos;t share these in chat — remove it and ask your question without it.
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-white p-1.5 pl-3.5 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/20"
      >
        <label htmlFor="assistant-input" className="sr-only">
          Ask Loan Assistant a question
        </label>
        <textarea
          id="assistant-input"
          rows={1}
          maxLength={1000}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (warning) setWarning(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Ask about eligibility, documents, EMIs…"
          className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:outline-none"
        />
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          aria-label="Send question"
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
            value.trim() && !disabled ? "bg-brand-700 text-white hover:bg-brand-800" : "bg-slate-100 text-slate-400",
          )}
        >
          <ArrowUp className="size-5" />
        </button>
      </form>
    </div>
  );
}
