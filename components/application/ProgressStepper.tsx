import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const JOURNEY_STEPS = ["Your business", "Your finances", "Your application", "Review & submit"];

/** Step 1 of 4 … with a compact bar on mobile and labelled steps on desktop. */
export function ProgressStepper({ current, caption }: { current: number; caption?: string }) {
  return (
    <div aria-label={`Step ${current} of ${JOURNEY_STEPS.length}: ${JOURNEY_STEPS[current - 1]}`} role="group">
      <div className="flex items-center justify-between text-[13px]">
        <p className="font-medium text-brand-800">
          Step {current} of {JOURNEY_STEPS.length}
          <span className="font-normal text-slate-500"> · {caption ?? JOURNEY_STEPS[current - 1]}</span>
        </p>
      </div>
      <ol className="mt-2.5 grid grid-cols-4 gap-1.5">
        {JOURNEY_STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < current;
          const active = n === current;
          return (
            <li key={label} className="min-w-0">
              <div className={cn("h-1.5 rounded-full transition-colors", done || active ? "bg-brand-600" : "bg-slate-200")} />
              <p className={cn("mt-2 hidden items-center gap-1 truncate text-[12.5px] sm:flex", active ? "font-medium text-slate-900" : done ? "text-slate-600" : "text-slate-400")}>
                {done && <Check className="size-3.5 text-brand-600" aria-hidden />}
                {label}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
