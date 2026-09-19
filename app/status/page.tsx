"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, FileText, FileWarning, FlaskConical, RefreshCw, Upload } from "lucide-react";
import { ApplicationSummary } from "@/components/application/ApplicationSummary";
import { AskAssistantButton } from "@/components/assistant/AskAssistantButton";
import { ErrorState } from "@/components/common/ErrorState";
import { StatusTimeline } from "@/components/status/StatusTimeline";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { track } from "@/lib/analytics";
import { relativeDay } from "@/lib/format";
import { STAGE_ORDER, STATUS_HEADLINE } from "@/lib/journey/constants";
import { useJourney } from "@/lib/journey/store";
import { applicationService } from "@/services/applicationService";
import { getDocumentChecklist } from "@/services/documentService";

export default function StatusPage() {
  const toast = useToast();
  const { state, hydrated, actions, selectedOption } = useJourney();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tracked = useRef(false);
  const app = state.submitted;
  const checklist = useMemo(() => getDocumentChecklist(state.business), [state.business]);

  useEffect(() => {
    if (hydrated && !tracked.current) {
      tracked.current = true;
      track("application_status_viewed", { hasApplication: Boolean(app), stage: app?.stage });
    }
  }, [hydrated, app]);

  if (!hydrated) return <div className="min-h-[60vh]" />;

  if (!app) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-[30px] font-semibold tracking-tight text-slate-900">Track your application</h1>
        <p className="mt-2 text-[16px] text-slate-600">Follow every stage from verification to decision.</p>
        <ErrorState
          className="mt-8"
          variant="info"
          icon={FileText}
          title="No application on this device yet"
          message="Once you submit an application, you'll be able to see exactly where it is and what happens next. In this prototype, applications are tracked on the device they were submitted from."
        >
          <ButtonLink href="/eligibility/business" size="sm">
            Check my eligibility
          </ButtonLink>
          <AskAssistantButton size="sm" question="What happens after I apply?">
            What happens after I apply?
          </AskAssistantButton>
        </ErrorState>
      </div>
    );
  }

  const headline = STATUS_HEADLINE[app.stage];
  const pending = checklist.filter((d) => d.requirement === "required" && state.documents[d.id]?.status !== "uploaded");
  const isLast = STAGE_ORDER.indexOf(app.stage) === STAGE_ORDER.length - 1;

  const refresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await applicationService.getStatus(app);
      toast({ tone: "success", title: "Status is up to date" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium tracking-wide text-slate-500 uppercase">Application</p>
          <h1 className="font-mono text-[26px] font-semibold tracking-wide text-slate-900 sm:text-[30px]">{app.reference}</h1>
        </div>
        <p className="flex items-center gap-1.5 text-[13.5px] text-slate-500">
          <Clock className="size-4" aria-hidden /> Last updated: {relativeDay(app.lastUpdated)}
          <button onClick={refresh} disabled={refreshing} className="ml-1 rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-50" aria-label="Refresh status">
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
          </button>
        </p>
      </div>

      {error && <ErrorState variant="network" className="mt-6" title="We couldn't refresh your status" message={error} onRetry={refresh} retrying={refreshing} />}

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 bg-brand-50/60 px-5 py-5 sm:px-6">
              <p className="text-[13px] font-medium text-brand-800">Current status</p>
              <p className="mt-1 text-[22px] font-semibold tracking-tight text-slate-900">{headline.title}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{headline.message}</p>
            </div>
            <CardContent>
              <StatusTimeline stage={app.stage} submittedLabel={relativeDay(app.submittedAt)} />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          {pending.length > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="flex items-center gap-2 font-semibold text-amber-950">
                <FileWarning className="size-5" aria-hidden /> What we need from you
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] text-amber-900">
                {pending.map((d) => (
                  <li key={d.id}>{d.name}</li>
                ))}
              </ul>
              <ButtonLink href="/documents" size="sm" className="mt-4 w-full">
                <Upload className="size-4" aria-hidden /> Upload documents
              </ButtonLink>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-[14px] text-emerald-900">
              <p className="font-semibold">Nothing needed from you right now</p>
              <p className="mt-1">All likely-required documents are in. We&apos;ll contact you if anything else is needed.</p>
            </div>
          )}

          <Card>
            <CardContent className="space-y-2.5">
              <AskAssistantButton question="What happens next?" variant="primary" className="w-full" />
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <FileText className="size-4" aria-hidden /> View Application
                  </Button>
                </DialogTrigger>
                <DialogContent title={`Application ${app.reference}`} description="What you submitted. Contact the lender's team to change anything." className="sm:max-w-2xl">
                  <ApplicationSummary state={state} selectedOption={selectedOption} checklist={checklist} readOnly />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {state.demoMode && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-4">
              <p className="flex items-center gap-1.5 text-[12.5px] font-medium tracking-wide text-slate-500 uppercase">
                <FlaskConical className="size-3.5" aria-hidden /> Presenter only
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                disabled={isLast}
                onClick={() => actions.setStage(applicationService.nextStage(app.stage))}
              >
                Simulate next status update
              </Button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
