"use client";

import { useState } from "react";
import { ArrowRight, Check, CheckCircle2, Copy, FileWarning, Sparkles } from "lucide-react";
import { AskAssistantButton } from "@/components/assistant/AskAssistantButton";
import { ErrorState } from "@/components/common/ErrorState";
import { StatusTimeline } from "@/components/status/StatusTimeline";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { relativeDay } from "@/lib/format";
import { useJourney } from "@/lib/journey/store";
import { getDocumentChecklist } from "@/services/documentService";

export default function SubmittedPage() {
  const { state, hydrated } = useJourney();
  const [copied, setCopied] = useState(false);
  const app = state.submitted;

  if (!hydrated) return <div className="min-h-[60vh]" />;

  if (!app) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <ErrorState variant="info" title="No submitted application yet" message="Once you submit an application, its reference number and progress will appear here.">
          <ButtonLink href="/eligibility/business" size="sm">
            Check my eligibility
          </ButtonLink>
        </ErrorState>
      </div>
    );
  }

  const pending = getDocumentChecklist(state.business).filter((d) => d.requirement === "required" && state.documents[d.id]?.status !== "uploaded");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(app.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — reference is visible anyway */
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-10 pb-36 sm:px-6 md:pb-16">
      <div className="animate-fade-up text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
          <CheckCircle2 className="size-9" aria-hidden />
        </span>
        <h1 className="mt-6 text-[30px] font-semibold tracking-tight text-slate-900 sm:text-[36px]">Application submitted</h1>
        <p className="mt-2 text-[17px] text-slate-600">Your application has been received.</p>

        <div className="mx-auto mt-6 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white py-2.5 pr-2.5 pl-5 shadow-card">
          <div className="text-left">
            <p className="text-[12px] font-medium tracking-wide text-slate-500 uppercase">Application reference</p>
            <p className="font-mono text-lg font-semibold tracking-wide text-slate-900">{app.reference}</p>
          </div>
          <button onClick={copy} className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Copy application reference">
            {copied ? <Check className="size-5 text-emerald-600" aria-hidden /> : <Copy className="size-5" aria-hidden />}
          </button>
        </div>
        <p className="mt-2 text-[13px] text-slate-500" aria-live="polite">
          {copied ? "Copied to clipboard" : `Submitted ${relativeDay(app.submittedAt)}. We've also sent this to your mobile and email (demo).`}
        </p>
      </div>

      <Card className="mt-10">
        <CardContent>
          <h2 className="mb-5 font-semibold text-slate-900">Where your application is now</h2>
          <StatusTimeline stage={app.stage} showDescriptions={false} />
        </CardContent>
      </Card>

      {pending.length > 0 && (
        <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[14px] text-amber-900">
          <FileWarning className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>
            {pending.length === 1 ? "One document is" : `${pending.length} documents are`} still needed ({pending.map((d) => d.name).join(", ")}). Upload{" "}
            {pending.length === 1 ? "it" : "them"} from your status page so verification can be completed.
          </p>
        </div>
      )}

      <Card className="mt-4">
        <CardContent>
          <h2 className="font-semibold text-slate-900">What happens next?</h2>
          <ol className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-slate-600">
            <li>
              <span className="font-medium text-slate-800">Document verification.</span> We check your documents are complete and match your details.
            </li>
            <li>
              <span className="font-medium text-slate-800">Credit assessment.</span> The lender reviews your income, repayments and credit history.
            </li>
            <li>
              <span className="font-medium text-slate-800">Decision.</span> You see the final amount, rate and terms — and choose whether to accept.
            </li>
          </ol>
          <p className="mt-3 text-[14px] text-slate-500">If anything else is needed, we&apos;ll tell you what and why. You don&apos;t need to do anything right now.</p>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-brand-50 p-3.5">
            <Sparkles className="size-4 shrink-0 text-brand-700" aria-hidden />
            <p className="flex-1 text-[14px] text-brand-900">Want this explained for your situation?</p>
            <AskAssistantButton question="What happens next?" size="sm" variant="primary">
              Ask
            </AskAssistantButton>
          </div>
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0">
        <ButtonLink href="/status" size="lg" className="w-full md:mx-auto md:flex md:w-auto">
          Track Application <ArrowRight className="size-4" aria-hidden />
        </ButtonLink>
      </div>
    </div>
  );
}
