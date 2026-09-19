import { Check } from "lucide-react";
import { formatINR } from "@/lib/format";
import type { LoanOption } from "@/lib/journey/types";
import { cn } from "@/lib/utils";

export function LoanOptionCard({ option, selected, onSelect }: { option: LoanOption; selected: boolean; onSelect: () => void }) {
  const used = Math.min(option.capacityUsedPercent, 100);
  const meterTone = used > 90 ? "bg-amber-500" : "bg-brand-600";
  return (
    <label
      className={cn(
        "relative flex cursor-pointer flex-col rounded-2xl border bg-white p-5 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600 has-[:focus-visible]:ring-offset-2 sm:p-6",
        selected ? "border-brand-600 shadow-raised ring-1 ring-brand-600" : "border-slate-200 shadow-card hover:border-slate-300",
      )}
    >
      <input type="radio" name="loan-option" checked={selected} onChange={onSelect} className="sr-only" aria-describedby={`${option.id}-desc`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{option.label}</p>
          {option.tag && <p className="mt-0.5 text-[12.5px] font-medium text-brand-700">{option.tag}</p>}
        </div>
        <span
          className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors", selected ? "border-brand-700 bg-brand-700 text-white" : "border-slate-300")}
          aria-hidden
        >
          {selected && <Check className="size-3.5" strokeWidth={3} />}
        </span>
      </div>

      <p className="mt-4 text-[32px] leading-none font-semibold tracking-tight text-slate-900 tabular-nums">{formatINR(option.amount)}</p>
      <p className="mt-1.5 text-[14px] text-slate-600">{option.tenureMonths} months</p>

      <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
        <p className="text-[13px] text-slate-500">Illustrative EMI</p>
        <p className="text-xl font-semibold text-slate-900 tabular-nums">
          {formatINR(option.emi)}
          <span className="text-sm font-normal text-slate-500">/month</span>
        </p>
      </div>

      <dl className="mt-4 space-y-2 text-[13.5px]">
        <div className="flex justify-between">
          <dt className="text-slate-500">Total interest</dt>
          <dd className="font-medium text-slate-800 tabular-nums">{formatINR(option.totalInterest)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Total repayable</dt>
          <dd className="font-medium text-slate-800 tabular-nums">{formatINR(option.totalRepayable)}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <div className="flex justify-between text-[12.5px] text-slate-500">
          <span>Uses {option.capacityUsedPercent}% of your repayment capacity</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100" role="presentation">
          <div className={cn("h-full rounded-full", meterTone)} style={{ width: `${used}%` }} />
        </div>
      </div>

      <p id={`${option.id}-desc`} className="mt-4 text-[13.5px] leading-relaxed text-slate-600">
        {option.description}
      </p>
    </label>
  );
}
