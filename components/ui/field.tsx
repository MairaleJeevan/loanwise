"use client";

import { forwardRef, useId } from "react";
import { AlertCircle } from "lucide-react";
import { amountInWords, formatNumberIN, parseAmount } from "@/lib/format";
import { cn } from "@/lib/utils";

const controlBase =
  "block w-full rounded-xl border bg-white px-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600/25 focus:border-brand-600 disabled:bg-slate-50";

export function controlClasses(invalid?: boolean, className?: string) {
  return cn(controlBase, "h-12", invalid ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20" : "border-slate-300", className);
}

interface FieldProps {
  label: string;
  hint?: React.ReactNode;
  error?: string | null;
  optional?: boolean;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode;
  className?: string;
  extra?: React.ReactNode;
}

/** Label + control + hint + error, wired together for screen readers. */
export function Field({ label, hint, error, optional, children, className, extra }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-slate-800">
          {label}
          {optional && <span className="ml-1 font-normal text-slate-500">(optional)</span>}
        </label>
        {extra}
      </div>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-[13px] text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-[13px] font-medium text-rose-700">
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(function Input(
  { invalid, className, ...props },
  ref,
) {
  return <input ref={ref} aria-invalid={invalid || undefined} className={controlClasses(invalid, className)} {...props} />;
});

export function Select({ invalid, className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={controlClasses(
        invalid,
        cn(
          "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22 viewBox=%220 0 24 24%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_14px_center] bg-no-repeat pr-10",
          className,
        ),
      )}
      {...props}
    >
      {children}
    </select>
  );
}

/** ₹-prefixed amount input with Indian grouping and "8 lakh" read-back. */
export function CurrencyInput({
  id,
  value,
  onChange,
  invalid,
  describedBy,
  placeholder,
  showWords = true,
}: {
  id: string;
  value: number | null;
  onChange: (value: number | null) => void;
  invalid?: boolean;
  describedBy?: string;
  placeholder?: string;
  showWords?: boolean;
}) {
  const words = amountInWords(value);
  return (
    <div>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500" aria-hidden>
          ₹
        </span>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={controlClasses(invalid, "pl-8 tabular-nums")}
          placeholder={placeholder}
          value={formatNumberIN(value)}
          onChange={(e) => onChange(parseAmount(e.target.value))}
        />
        {showWords && words && (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[13px] text-slate-500" aria-hidden>
            {words}
          </span>
        )}
      </div>
    </div>
  );
}
