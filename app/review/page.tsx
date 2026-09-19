"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, ShieldCheck } from "lucide-react";
import { ApplicationSummary } from "@/components/application/ApplicationSummary";
import { ErrorState } from "@/components/common/ErrorState";
import { JourneyShell } from "@/components/layout/JourneyShell";
import { Button, ButtonLink } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { useJourney } from "@/lib/journey/store";
import { validatePersonal } from "@/lib/journey/validation";
import { applicationService } from "@/services/applicationService";
import { getDocumentChecklist } from "@/services/documentService";

export default function ReviewPage() {
  const router = useRouter();
  const { state, hydrated, actions, selectedOption } = useJourney();
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const checklist = useMemo(() => getDocumentChecklist(state.business), [state.business]);

  const incomplete = hydrated && (Object.keys(validatePersonal(state.application.personal)).length > 0 || !state.application.businessName || !selectedOption);

  const onSubmit = async () => {
    if (!confirmed) {
      setConfirmError(true);
      document.getElementById("confirm-accurate")?.focus();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const submitted = await applicationService.submit({ demoMode: state.demoMode });
      setJustSubmitted(true);
      actions.submit(submitted);
      const docsUploaded = Object.values(state.documents).filter((d) => d.status === "uploaded").length;
      track("application_submitted", { docsUploaded, demo: state.demoMode });
      router.push("/submitted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (hydrated && state.submitted && !justSubmitted) {
    return (
      <JourneyShell step={4} title="Review your application">
        <ErrorState variant="info" title="This application has already been submitted" message={`Reference ${state.submitted.reference}. You can follow its progress on the status page.`}>
          <ButtonLink href="/status" size="sm">
            Track application
          </ButtonLink>
        </ErrorState>
      </JourneyShell>
    );
  }

  if (incomplete) {
    return (
      <JourneyShell step={4} title="Review your application">
        <ErrorState variant="info" title="A few details are still missing" message="Please complete your application before reviewing it. Everything you've entered so far is saved.">
          <ButtonLink href={selectedOption ? "/apply" : "/options"} size="sm">
            {selectedOption ? "Complete my application" : "Choose a loan option"}
          </ButtonLink>
        </ErrorState>
      </JourneyShell>
    );
  }

  return (
    <JourneyShell
      step={4}
      title="Review your application"
      subtitle="Check everything is right. You can edit any section before you submit."
      actions={
        <>
          <ButtonLink href="/apply" variant="ghost" className="hidden sm:inline-flex">
            <ArrowLeft className="size-4" aria-hidden /> Back to application
          </ButtonLink>
          <Button size="lg" onClick={onSubmit} loading={submitting} className="w-full sm:w-auto">
            {!submitting && <Send className="size-4" aria-hidden />}
            {submitting ? "Submitting…" : "Submit Application"}
          </Button>
        </>
      }
    >
      {error && <ErrorState variant="network" className="mb-5" title="Your application wasn't submitted" message={error} onRetry={onSubmit} retrying={submitting} />}

      {hydrated && <ApplicationSummary state={state} selectedOption={selectedOption} checklist={checklist} />}

      <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <label htmlFor="confirm-accurate" className="flex cursor-pointer items-start gap-3">
          <input
            id="confirm-accurate"
            type="checkbox"
            checked={confirmed}
            onChange={(e) => {
              setConfirmed(e.target.checked);
              if (e.target.checked) setConfirmError(false);
            }}
            aria-invalid={confirmError || undefined}
            aria-describedby={confirmError ? "confirm-error" : undefined}
            className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-brand-700"
          />
          <span className="text-[15px] font-medium text-slate-900">I confirm that the information provided is accurate.</span>
        </label>
        {confirmError && (
          <p id="confirm-error" role="alert" className="text-[13px] font-medium text-rose-700">
            Please confirm your information is accurate before submitting.
          </p>
        )}
        <p className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-500">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
          Submitting lets the lender verify your documents and, with your consent, check your credit history. It isn&apos;t a commitment to borrow — you&apos;ll see
          the final terms before accepting anything.
        </p>
      </div>
    </JourneyShell>
  );
}
