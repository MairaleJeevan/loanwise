"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { AskAssistantLink } from "@/components/assistant/AskAssistantButton";
import { JourneyShell } from "@/components/layout/JourneyShell";
import { PrivacyNote } from "@/components/common/TrustCard";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChoiceGroup } from "@/components/ui/choice-group";
import { Field, Input, Select } from "@/components/ui/field";
import { InfoToggle } from "@/components/ui/info-toggle";
import { track } from "@/lib/analytics";
import { BUSINESS_TYPES, CITIES, INDUSTRIES, VINTAGES } from "@/lib/journey/constants";
import { useJourney } from "@/lib/journey/store";
import type { BusinessProfile } from "@/lib/journey/types";

type Errors = Partial<Record<keyof BusinessProfile, string>>;

function validate(b: BusinessProfile): Errors {
  const e: Errors = {};
  if (!b.businessType) e.businessType = "Please choose your business type.";
  if (!b.vintage) e.vintage = "Please tell us how long your business has been running.";
  if (!b.location.trim()) e.location = "Please enter the city or town where your business operates.";
  else if (b.location.trim().length < 2) e.location = "Please enter a valid city or town.";
  if (!b.industry) e.industry = "Please choose the category closest to your business.";
  return e;
}

export default function BusinessProfilePage() {
  const router = useRouter();
  const { state, hydrated, actions } = useJourney();
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const b = state.business;

  useEffect(() => {
    if (hydrated) track("eligibility_started", { demo: state.demoMode });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per visit
  }, [hydrated]);

  // Re-validate live once the user has tried to continue.
  const set = (patch: Partial<BusinessProfile>) => {
    actions.setBusiness(patch);
    if (submitted) setErrors(validate({ ...b, ...patch }));
  };

  const onContinue = () => {
    setSubmitted(true);
    const e = validate(b);
    setErrors(e);
    if (Object.keys(e).length) {
      document.querySelector<HTMLElement>("[aria-invalid='true'] input, [aria-invalid='true']")?.focus();
      return;
    }
    track("business_profile_completed", { businessType: b.businessType, vintage: b.vintage });
    router.push("/eligibility/finances");
  };

  const errorCount = Object.keys(errors).length;

  return (
    <JourneyShell
      step={1}
      title="Let's understand your business"
      subtitle="This helps us estimate your indicative eligibility."
      actions={
        <>
          <ButtonLink href="/" variant="ghost" className="hidden sm:inline-flex">
            Back
          </ButtonLink>
          <Button size="lg" onClick={onContinue} className="w-full sm:w-auto">
            Continue <ArrowRight className="size-4" aria-hidden />
          </Button>
        </>
      }
    >
      {errorCount > 0 && (
        <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {errorCount === 1 ? "One detail is missing." : `${errorCount} details are missing.`} Please check the highlighted fields.
        </p>
      )}
      <Card>
        <CardContent className="space-y-7">
          <ChoiceGroup
            legend="Business type"
            name="businessType"
            options={BUSINESS_TYPES.map((t) => ({ value: t.value, label: t.label, hint: t.hint }))}
            value={b.businessType}
            onChange={(v) => set({ businessType: v })}
            error={errors.businessType}
          />
          <InfoToggle>
            Your business structure helps us understand which registration documents may apply later. It doesn&apos;t change your estimate in this prototype.
          </InfoToggle>

          <div>
            <ChoiceGroup
              legend="How long has your business been running?"
              name="vintage"
              options={VINTAGES}
              value={b.vintage}
              onChange={(v) => set({ vintage: v })}
              error={errors.vintage}
              columns={4}
              compact
            />
            <InfoToggle className="mt-3">
              A longer trading history gives a better picture of how steady your business income is. In this estimate, businesses running for longer can put a
              slightly larger share of income towards repayments.
            </InfoToggle>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Business location" hint="City or town where you operate" error={errors.location}>
              {({ id, describedBy, invalid }) => (
                <>
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    invalid={invalid}
                    list="city-list"
                    autoComplete="address-level2"
                    placeholder="e.g. Pune"
                    value={b.location}
                    onChange={(e) => set({ location: e.target.value })}
                  />
                  <datalist id="city-list">
                    {CITIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </>
              )}
            </Field>
            <Field label="Industry / business category" error={errors.industry}>
              {({ id, describedBy, invalid }) => (
                <Select id={id} aria-describedby={describedBy} invalid={invalid} value={b.industry} onChange={(e) => set({ industry: e.target.value })}>
                  <option value="" disabled>
                    Choose a category
                  </option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PrivacyNote>
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          No documents or ID numbers needed to check eligibility.
        </PrivacyNote>
        <AskAssistantLink question="Why do you ask how long I've been in business?">Not sure what to choose?</AskAssistantLink>
      </div>
    </JourneyShell>
  );
}
