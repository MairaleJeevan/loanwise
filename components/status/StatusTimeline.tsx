import { Check } from "lucide-react";
import { STAGES, STAGE_ORDER } from "@/lib/journey/constants";
import type { ApplicationStage } from "@/lib/journey/types";
import { cn } from "@/lib/utils";

export function StatusTimeline({ stage, showDescriptions = true, submittedLabel }: { stage: ApplicationStage; showDescriptions?: boolean; submittedLabel?: string }) {
  const current = STAGE_ORDER.indexOf(stage);
  return (
    <ol className="relative" aria-label="Application progress">
      {STAGES.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const state = done ? "Completed" : active ? "In progress" : "Not started";
        return (
          <li key={s.id} className="relative flex gap-4 pb-6 last:pb-0">
            {i < STAGES.length - 1 && (
              <span className={cn("absolute top-8 left-[15px] h-[calc(100%-32px)] w-0.5", i < current ? "bg-brand-500" : "bg-slate-200")} aria-hidden />
            )}
            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2",
                done && "border-brand-600 bg-brand-600 text-white",
                active && "border-brand-600 bg-white",
                !done && !active && "border-slate-300 bg-white",
              )}
              aria-hidden
            >
              {done ? <Check className="size-4" strokeWidth={3} /> : active ? <span className="size-2.5 animate-pulse rounded-full bg-brand-600" /> : null}
            </span>
            <div className="min-w-0 pt-1">
              <p className={cn("font-medium", active ? "text-slate-900" : done ? "text-slate-800" : "text-slate-400")}>
                {s.label}
                <span className="sr-only"> — {state}</span>
                {active && <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[12px] font-medium text-brand-800 ring-1 ring-brand-200">In progress</span>}
                {i === 0 && submittedLabel && <span className="ml-2 text-[12.5px] font-normal text-slate-500">{submittedLabel}</span>}
              </p>
              {showDescriptions && (done || active) && <p className="mt-0.5 text-[14px] leading-relaxed text-slate-600">{s.description}</p>}
              {showDescriptions && !done && !active && <p className="mt-0.5 text-[13.5px] text-slate-400">{s.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
