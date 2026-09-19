import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "indicative";

const tones: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  brand: "bg-brand-50 text-brand-800 ring-1 ring-inset ring-brand-200",
  success: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200",
  warning: "bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-200",
  danger: "bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-200",
  // Used on every estimate so it can never be mistaken for an offer.
  indicative: "bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-300/70",
};

export function Badge({ tone = "neutral", className, ...props }: { tone?: Tone } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", tones[tone], className)}
      {...props}
    />
  );
}
