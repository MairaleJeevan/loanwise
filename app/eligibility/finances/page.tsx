"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { AskAssistantLink } from "@/components/assistant/AskAssistantButton";
import { ErrorState } from "@/components/common/ErrorState";
import { PrivacyNote } from "@/components/common/TrustCard";
import { JourneyShell } from "@/components/layout/JourneyShell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChoiceGroup } from "@/components/ui/choice-group";
import { CurrencyInput, Field } from "@/components/ui/field";
import { InfoToggle } from "@/components/ui/info-toggle";
import { track } from "@/lib/analytics";
import { TENURES } from "@/lib/journey/constants";
import { useJourney } from "@/lib/journey/store";
import type { FinancialInfo } from "@/lib/journey/types";
import { validateFinances, type FinanceErrors } from "@/lib/journey/validation";
import { NetworkError } from "@/lib/simulation";
import { eligibilityService } from "@/services/eligibilityService";

type Errors = FinanceErrors;

export default function FinancesPage() {
  const router = useRouter();
  const { state, hydrated, actions } = useJourney();
  const [errors, setErrors] = useState<Errors>({});
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const f = state.finances;
  const missingBusiness = hydrated && (!state.business.businessType || !state.business.vintage);

  const set = (patch: Partial<FinancialInfo>) => {
    actions.setFinances(patch);
    if (triedSubmit) setErrors(validateFinances({ ...f, ...patch }));
  };

  const onCheck = async () => {
    setTriedSubmit(true);
    const e = validateFinances(f);
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setServiceError(null);
    try {
      const { result, options } = await eligibilityService.estimateEligibility({ business: state.business, finances: f });
      actions.setEligibility(result, options);
      track("financial_info_completed", { tenure: f.tenureMonths });
      router.push("/eligibility/result");
    } catch (err) {
      setServiceError(err instanceof NetworkError ? err.message : err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (missingBusiness) {
    return (
      <JourneyShell step={2} title="Tell us about your finances">
        <ErrorState
          variant="info"
          title="We need a few business details first"
          message="Your business type and how long it has been running help us work out your estimate. It only takes a moment."
        >
          <ButtonLink href="/eligibility/business" size="sm">
            Go to business details
          </ButtonLink>
        </ErrorState>
      </JourneyShell>
    );
  }

  const errorCount = Object.keys(errors).length;

  return (
    <JourneyShell
      step={2}
      title="Tell us about your finances"
      subtitle="Rough figures are fine. You can change them later, and nothing here is a commitment."
      actions={
        <>
          <ButtonLink href="/eligibility/business" variant="ghost" className="hidden sm:inline-flex">
            <ArrowLeft className="size-4" aria-hidden /> Back
          </ButtonLink>
          <Button size="lg" onClick={onCheck} loading={loading} className="w-full sm:w-auto">
            {loading ? "Checking…" : "Check My Eligibility"}
            {!loading && <ArrowRight className="size-4" aria-hidden />}
          </Button>
        </>
      }
    >
      {serviceError && (
        <ErrorState variant="network" className="mb-5" title="We couldn't calculate your estimate" message={serviceError} onRetry={onCheck} retrying={loading} />
      )}
      {errorCount > 0 && (
        <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Please check the highlighted {errorCount === 1 ? "field" : "fields"}.
        </p>
      )}
      <Card>
        <CardContent className="space-y-7">
          <Field
            label="Average monthly income"
            hint="What the business brings home each month on average — after business expenses."
            error={errors.monthlyIncome}
          >
            {({ id, describedBy, invalid }) => (
              <>
                <CurrencyInput id={id} describedBy={describedBy} invalid={invalid} value={f.monthlyIncome} onChange={(v) => set({ monthlyIncome: v })} placeholder="1,00,000" />
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <InfoToggle label="My income changes every month">
                    That&apos;s normal for many businesses. Add up what the business earned over the last 6–12 months and divide by the number of months. Bank
                    statements later help show the pattern behind the average.
                  </InfoToggle>
                </div>
              </>
            )}
          </Field>

          <Field label="Existing monthly EMIs" hint="Total of all loan and card EMIs you pay today. Enter 0 if none." error={errors.existingEmi}>
            {({ id, describedBy, invalid }) => (
              <>
                <CurrencyInput id={id} describedBy={describedBy} invalid={invalid} value={f.existingEmi} onChange={(v) => set({ existingEmi: v })} placeholder="0" />
                <InfoToggle label="Why do we ask about existing EMIs?" className="pt-1">
                  Existing repayments help us understand your current monthly obligations. Include business, home, vehicle and personal loans, and credit card
                  EMIs — so a new EMI never stretches your cash flow.
                </InfoToggle>
              </>
            )}
          </Field>

          <Field label="Loan amount you're considering" error={errors.requestedAmount}>
            {({ id, describedBy, invalid }) => (
              <>
                <CurrencyInput id={id} describedBy={describedBy} invalid={invalid} value={f.requestedAmount} onChange={(v) => set({ requestedAmount: v })} placeholder="8,00,000" />
                <InfoToggle label="Not sure how much to ask for?" className="pt-1">
                  Start with what the business actually needs — stock, equipment or working capital. We&apos;ll show you what&apos;s indicatively possible and a few
                  options to compare, so you can adjust later.
                </InfoToggle>
              </>
            )}
          </Field>

          <ChoiceGroup
            legend="Preferred tenure"
            name="tenure"
            options={TENURES.map((t) => ({ value: t, label: `${t} mo` }))}
            value={f.tenureMonths}
            onChange={(v) => set({ tenureMonths: v })}
            error={errors.tenureMonths}
            columns={5}
            compact
            legendExtra={<span className="text-[12.5px] text-slate-500">Longer = lower EMI, more interest</span>}
          />
        </CardContent>
      </Card>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PrivacyNote>
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          No credit check. This doesn&apos;t affect your credit score.
        </PrivacyNote>
        <AskAssistantLink question="How is eligibility calculated?">How is eligibility calculated?</AskAssistantLink>
      </div>
    </JourneyShell>
  );
}
