"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Choice<T extends string | number> {
  value: T;
  label: string;
  hint?: string;
}

/**
 * Radio group rendered as tappable cards. Uses native radio inputs, so
 * arrow-key navigation and screen-reader semantics come for free.
 */
export function ChoiceGroup<T extends string | number>({
  legend,
  name,
  options,
  value,
  onChange,
  error,
  columns = 2,
  compact,
  legendExtra,
}: {
  legend: string;
  name: string;
  options: Choice<T>[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string | null;
  columns?: 2 | 3 | 4 | 5;
  compact?: boolean;
  legendExtra?: React.ReactNode;
}) {
  const errorId = error ? `${name}-error` : undefined;
  const cols = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4", 5: "grid-cols-3 sm:grid-cols-5" }[columns];
  return (
    <fieldset aria-describedby={errorId} aria-invalid={Boolean(error) || undefined}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <legend className="text-sm font-medium text-slate-800">{legend}</legend>
        {legendExtra}
      </div>
      <div className={cn("grid gap-2.5", cols)}>
        {options.map((o) => {
          const checked = value === o.value;
          return (
            <label
              key={String(o.value)}
              className={cn(
                "relative flex cursor-pointer flex-col rounded-xl border bg-white transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600 has-[:focus-visible]:ring-offset-1",
                compact ? "items-center justify-center px-2 py-3 text-center" : "px-4 py-3.5",
                checked ? "border-brand-600 bg-brand-50/60 ring-1 ring-brand-600" : error ? "border-rose-300" : "border-slate-300 hover:border-slate-400",
              )}
            >
              <input
                type="radio"
                name={name}
                value={String(o.value)}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <span className={cn("text-[15px] font-medium", checked ? "text-brand-900" : "text-slate-800")}>{o.label}</span>
              {o.hint && !compact && <span className="mt-0.5 text-[13px] leading-snug text-slate-500">{o.hint}</span>}
              {checked && !compact && (
                <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-brand-700 text-white" aria-hidden>
                  <Check className="size-3" strokeWidth={3} />
                </span>
              )}
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-[13px] font-medium text-rose-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}
