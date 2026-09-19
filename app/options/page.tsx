"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Info, Sparkles } from "lucide-react";
import { AskAssistantButton } from "@/components/assistant/AskAssistantButton";
import { ErrorState } from "@/components/common/ErrorState";
import { JourneyShell } from "@/components/layout/JourneyShell";
import { LoanOptionCard } from "@/components/loan/LoanOptionCard";
import { Button, ButtonLink } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { useJourney } from "@/lib/journey/store";

export default function LoanOptionsPage() {
  const router = useRouter();
  const { state, hydrated, actions } = useJourney();
  const [error, setError] = useState<string | null>(null);
  const options = state.loanOptions.filter((o) => o.id !== "custom");
  const custom = state.loanOptions.find((o) => o.id === "custom");
  const all = custom ? [...options, custom] : options;

  if (!hydrated) return <JourneyShell step={3} stepCaption="Choose an option" title="Compare your options">{null}</JourneyShell>;

  if (!state.eligibility || state.eligibility.status !== "estimated" || !options.length) {
    return (
      <JourneyShell step={3} stepCaption="Choose an option" title="Compare your options">
        <ErrorState
          variant="info"
          title="Options appear after your eligibility check"
          message="We build illustrative options from your indicative estimate, so we need your business and financial details first."
        >
          <ButtonLink href={state.eligibility ? "/eligibility/result" : "/eligibility/business"} size="sm">
            {state.eligibility ? "Back to my estimate" : "Check my eligibility"}
          </ButtonLink>
        </ErrorState>
      </JourneyShell>
    );
  }

  const onContinue = () => {
    if (!state.selectedOptionId) {
      setError("Please choose one option to continue. You can change it later.");
      return;
    }
    router.push("/documents");
  };

  return (
    <JourneyShell
      wide
      step={3}
      stepCaption="Choose an option"
      title="Compare your options"
      subtitle="Three ways to shape your loan. Pick the one whose EMI your business could comfortably pay — even in a slow month."
      actions={
        <>
          <ButtonLink href="/eligibility/result" variant="ghost" className="hidden sm:inline-flex">
            <ArrowLeft className="size-4" aria-hidden /> Back to estimate
          </ButtonLink>
          <Button size="lg" onClick={onContinue} className="w-full sm:w-auto">
            Continue with this option <ArrowRight className="size-4" aria-hidden />
          </Button>
        </>
      }
    >
      <p className="mb-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] leading-relaxed text-amber-900">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          <strong className="font-semibold">Illustrative options for this prototype</strong> — not loan offers. EMIs use an illustrative{" "}
          {state.eligibility.illustrativeRatePercent}% p.a. rate. The lender sets the actual rate and terms after assessment.
        </span>
      </p>

      {error && (
        <p role="alert" className="mb-4 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      <div role="radiogroup" aria-label="Illustrative loan options" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {all.map((o) => (
          <LoanOptionCard
            key={o.id}
            option={o}
            selected={state.selectedOptionId === o.id}
            onSelect={() => {
              actions.selectOption(o.id);
              setError(null);
              track("loan_option_selected", { option: o.id, tenure: o.tenureMonths });
            }}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden />
          <div>
            <p className="font-semibold text-brand-950">Not sure which option fits you?</p>
            <p className="text-[14px] text-brand-900/80">Loan Assistant can compare the trade-offs using your numbers.</p>
          </div>
        </div>
        <AskAssistantButton question="Which option fits me best?" variant="primary" className="shrink-0" />
      </div>
    </JourneyShell>
  );
}
