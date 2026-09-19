"use client";

import { Calculator } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import type { EligibilityResult } from "@/lib/journey/types";

/** The transparent maths behind the estimate — the core trust mechanism. */
export function CalculationBreakdown({ result }: { result: EligibilityResult }) {
  const allowed = Math.round((result.monthlyIncome * result.obligationLimitPercent) / 100);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">How we got here</CardTitle>
        <HowCalculatedDialog result={result} />
      </CardHeader>
      <CardContent>
        <dl className="space-y-3 text-[15px]">
          <Row label="Monthly income" value={formatINR(result.monthlyIncome)} />
          <Row label={`Up to ${result.obligationLimitPercent}% can go towards all repayments`} value={formatINR(allowed)} muted />
          <Row label="Existing EMIs" value={`− ${formatINR(result.existingEmi)}`} />
          <div className="border-t border-dashed border-slate-200 pt-3">
            <Row label="Estimated repayment capacity" value={`${formatINR(result.repaymentCapacity)}/mo`} strong />
          </div>
        </dl>
        <p className="mt-4 text-[13px] leading-relaxed text-slate-500">
          That capacity, repaid over {result.tenureMonths} months at an illustrative {result.illustrativeRatePercent}% p.a., supports up to{" "}
          {formatINR(result.eligibleAmount)}.
        </p>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, muted, strong }: { label: string; value: string; muted?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={strong ? "font-semibold text-slate-900" : muted ? "text-[13.5px] text-slate-500" : "text-slate-700"}>{label}</dt>
      <dd className={`tabular-nums ${strong ? "font-semibold text-brand-800" : muted ? "text-[13.5px] text-slate-500" : "font-medium text-slate-900"}`}>{value}</dd>
    </div>
  );
}

export function HowCalculatedDialog({ result }: { result: EligibilityResult }) {
  return (
    <Dialog>
      <DialogTrigger className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-brand-700 hover:text-brand-900">
        <Calculator className="size-3.5" aria-hidden />
        How was this calculated?
      </DialogTrigger>
      <DialogContent title="How your indicative estimate was calculated" description="A simplified, transparent calculation for this prototype — not the lender's credit model.">
        <ol className="space-y-4 text-[14.5px] leading-relaxed text-slate-700">
          <Step n={1} title="How much of your income can go to repayments">
            Lenders usually look at what share of monthly income can safely go towards all EMIs. In this prototype we use {result.obligationLimitPercent}% for your
            business vintage: {formatINR(result.monthlyIncome)} × {result.obligationLimitPercent}% ={" "}
            {formatINR((result.monthlyIncome * result.obligationLimitPercent) / 100)}.
          </Step>
          <Step n={2} title="Minus what you already repay">
            Your existing EMIs of {formatINR(result.existingEmi)} are subtracted, leaving {formatINR(result.repaymentCapacity)} a month for a new EMI.
          </Step>
          <Step n={3} title="What that EMI could repay">
            We work out the loan amount that {formatINR(result.repaymentCapacity)} a month could repay over {result.tenureMonths} months at an illustrative{" "}
            {result.illustrativeRatePercent}% p.a., capped at 12× your monthly income. Result: up to {formatINR(result.eligibleAmount)}.
          </Step>
        </ol>
        <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-[13.5px] leading-relaxed text-amber-900">
          <p className="font-medium">What this doesn&apos;t include</p>
          <p className="mt-1">
            Your credit history, verified bank statements and the lender&apos;s own policies. The {result.illustrativeRatePercent}% rate is only for illustration —
            it is not a quoted rate. Final eligibility, amount and terms are decided by the lender after verification and credit assessment.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[12.5px] font-semibold text-brand-800 ring-1 ring-brand-200">{n}</span>
      <div>
        <p className="font-medium text-slate-900">{title}</p>
        <p className="mt-0.5">{children}</p>
      </div>
    </li>
  );
}
