import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/format";
import type { EligibilityResult } from "@/lib/journey/types";

export const INDICATIVE_DISCLAIMER =
  "This is an illustrative estimate based on the information provided. Final eligibility may change after verification and credit assessment.";

export function EligibilityCard({ result }: { result: EligibilityResult }) {
  const withinRequest = result.requestedAmount <= result.eligibleAmount;
  return (
    <section aria-labelledby="estimate-heading" className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-raised">
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="estimate-heading" className="text-sm font-medium text-slate-600">
            Estimated loan eligibility
          </h2>
          <Badge tone="indicative">
            <Info className="size-3" aria-hidden /> Indicative estimate
          </Badge>
        </div>
        <p className="mt-3 text-[15px] text-slate-600">You may be able to borrow up to</p>
        <p className="mt-1 text-[44px] leading-none font-semibold tracking-tight text-slate-900 tabular-nums sm:text-[52px]">{formatINR(result.eligibleAmount)}</p>
        <p className="mt-2 text-[15px] text-slate-600">over {result.tenureMonths} months, based on what you told us</p>

        <div
          className={`mt-6 flex items-start gap-3 rounded-2xl px-4 py-3.5 text-[14.5px] leading-relaxed ${
            withinRequest ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"
          }`}
        >
          {withinRequest ? <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden /> : <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />}
          <p>
            {withinRequest ? (
              <>
                The {formatINR(result.requestedAmount)} you&apos;re considering is <strong className="font-semibold">within</strong> your indicative estimate.
              </>
            ) : (
              <>
                The {formatINR(result.requestedAmount)} you asked for is above the indicative estimate for {result.tenureMonths} months.
                {result.maxAmountLongestTenure > result.eligibleAmount && (
                  <> Over 60 months, it could be up to {formatINR(result.maxAmountLongestTenure)} — compare this in your loan options.</>
                )}
              </>
            )}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-1 divide-y divide-slate-100 border-t border-slate-100 bg-slate-50/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[
          ["Estimated monthly EMI", formatINR(result.estimatedEmi), `for ${formatINR(result.suggestedAmount)}`],
          ["Indicative tenure", `${result.tenureMonths} months`, "your preference"],
          ["Repayment capacity", `${formatINR(result.repaymentCapacity)}/mo`, "available for a new EMI"],
        ].map(([label, value, sub]) => (
          <div key={label} className="px-6 py-4 sm:px-8">
            <dt className="text-[13px] text-slate-500">{label}</dt>
            <dd className="mt-1 text-xl font-semibold text-slate-900 tabular-nums">{value}</dd>
            <dd className="text-[12.5px] text-slate-500">{sub}</dd>
          </div>
        ))}
      </dl>

      <p className="flex items-start gap-2 border-t border-slate-100 px-6 py-4 text-[13px] leading-relaxed text-slate-600 sm:px-8">
        <Info className="mt-0.5 size-3.5 shrink-0 text-slate-400" aria-hidden />
        {INDICATIVE_DISCLAIMER}
      </p>
    </section>
  );
}
