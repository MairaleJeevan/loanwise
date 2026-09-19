"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { JourneyShell } from "@/components/layout/JourneyShell";
import { Button, ButtonLink } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { useJourney } from "@/lib/journey/store";
import type { DocumentState } from "@/lib/journey/types";
import { documentService, getDocumentChecklist } from "@/services/documentService";

export default function DocumentsPage() {
  const router = useRouter();
  const { state, hydrated, actions } = useJourney();
  const checklist = useMemo(() => getDocumentChecklist(state.business), [state.business]);
  const required = checklist.filter((d) => d.requirement === "required");
  const maybe = checklist.filter((d) => d.requirement === "maybe");
  const docState = (id: string): DocumentState => state.documents[id] ?? { id, status: "not_uploaded" };
  const readyCount = required.filter((d) => docState(d.id).status === "uploaded").length;
  const hasEstimate = state.eligibility?.status === "estimated";
  const startedTracked = useRef(false);
  const completedTracked = useRef(false);

  useEffect(() => {
    if (hydrated && readyCount === required.length && !completedTracked.current && required.length) {
      completedTracked.current = true;
      if (Object.keys(state.documents).length) track("document_completed", { required: required.length });
    }
  }, [hydrated, readyCount, required.length, state.documents]);

  const markStarted = () => {
    if (!startedTracked.current) {
      startedTracked.current = true;
      track("document_started");
    }
  };

  const upload = async (docId: string, meta: { name: string; size: number; type: string }) => {
    markStarted();
    actions.setDocument(docId, { status: "uploading", progress: 4, error: undefined, fileName: meta.name, fileSize: meta.size });
    try {
      const { uploadedAt } = await documentService.upload(meta, (progress) => actions.setDocument(docId, { progress }));
      actions.setDocument(docId, { status: "uploaded", progress: 100, uploadedAt });
    } catch (err) {
      actions.setDocument(docId, { status: "failed", progress: 0, error: err instanceof Error ? err.message : "Upload failed. Please try again." });
    }
  };

  return (
    <JourneyShell
      step={3}
      stepCaption="Documents"
      title="Here's what you'll likely need"
      subtitle="Every item has a reason. Upload what you have now — you can add the rest later, even after you apply."
      aside={
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-[13px] font-medium text-slate-500">Document readiness</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 tabular-nums">
            {readyCount} of {required.length}
            <span className="text-base font-normal text-slate-500"> likely-required ready</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={readyCount} aria-valuemin={0} aria-valuemax={required.length} aria-label="Required documents uploaded">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(readyCount / required.length) * 100}%` }} />
          </div>
          <ul className="mt-4 space-y-1.5 text-[13.5px] text-slate-600">
            <li>PDF, JPG or PNG · up to 5 MB each</li>
            <li>Clear, complete pages — all corners visible</li>
            <li>Bank statements: last 6 months, main business account</li>
          </ul>
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-[12.5px] leading-relaxed text-slate-600">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
            Prototype: files never leave your device. We only use the file name and size to show the upload.
          </p>
        </div>
      }
      actions={
        <>
          <ButtonLink href={hasEstimate ? "/options" : "/"} variant="ghost" className="hidden sm:inline-flex">
            <ArrowLeft className="size-4" aria-hidden /> Back
          </ButtonLink>
          {state.submitted ? (
            <ButtonLink href="/status" size="lg" className="w-full sm:w-auto">
              Back to application status <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          ) : hasEstimate ? (
            <Button size="lg" onClick={() => router.push("/apply")} className="w-full sm:w-auto">
              {readyCount === required.length ? "Continue to application" : "Continue — I'll upload the rest later"}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <ButtonLink href="/eligibility/business" size="lg" className="w-full sm:w-auto">
              Check my eligibility first <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          )}
        </>
      }
    >
      {!hasEstimate && hydrated && (
        <p className="mb-5 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-[14px] text-brand-900">
          This is the general checklist. Check your eligibility and we&apos;ll tailor it to your business.
        </p>
      )}

      <section aria-labelledby="required-heading">
        <h2 id="required-heading" className="mb-3 text-[13px] font-semibold tracking-wide text-slate-500 uppercase">
          Likely required
        </h2>
        <div className="space-y-3">
          {required.map((d) => (
            <DocumentCard
              key={d.id}
              doc={d}
              state={docState(d.id)}
              onFile={(file) => upload(d.id, { name: file.name, size: file.size, type: file.type })}
              onSample={state.demoMode ? () => upload(d.id, { name: `${d.id.replace("_", "-")}-sample.pdf`, size: 412_000, type: "application/pdf" }) : undefined}
              onRemove={() => actions.setDocument(d.id, { status: "not_uploaded", fileName: undefined, fileSize: undefined, progress: 0, error: undefined })}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="maybe-heading" className="mt-8">
        <h2 id="maybe-heading" className="mb-1 text-[13px] font-semibold tracking-wide text-slate-500 uppercase">
          Potentially required
        </h2>
        <p className="mb-3 text-[14px] text-slate-500">Depends on your business and the lender&apos;s process. Not needed to apply.</p>
        <div className="space-y-3">
          {maybe.map((d) => (
            <DocumentCard
              key={d.id}
              doc={d}
              state={docState(d.id)}
              onFile={(file) => upload(d.id, { name: file.name, size: file.size, type: file.type })}
              onRemove={() => actions.setDocument(d.id, { status: "not_uploaded", fileName: undefined, fileSize: undefined, progress: 0, error: undefined })}
            />
          ))}
        </div>
      </section>
    </JourneyShell>
  );
}
