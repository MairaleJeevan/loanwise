"use client";

import { useId, useState } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** "Why do we ask this?" — a small inline disclosure explaining a field. */
export function InfoToggle({ label = "Why do we ask this?", children, className }: { label?: string; children: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={cn("text-[13px]", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 font-medium text-brand-700 hover:text-brand-900"
      >
        <HelpCircle className="size-3.5" aria-hidden />
        {label}
      </button>
      {open && (
        <div id={id} className="mt-2 animate-fade-up rounded-xl bg-brand-50/70 px-3.5 py-3 leading-relaxed text-slate-700 ring-1 ring-brand-100">
          {children}
        </div>
      )}
    </div>
  );
}
