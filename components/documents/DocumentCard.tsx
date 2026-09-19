"use client";

import { useRef } from "react";
import { AlertTriangle, CheckCircle2, Circle, FileText, Loader2, RotateCw, Upload, X } from "lucide-react";
import { AskAssistantLink } from "@/components/assistant/AskAssistantButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DocumentState } from "@/lib/journey/types";
import { cn } from "@/lib/utils";
import { ACCEPTED_EXTENSIONS, type DocumentDefinition } from "@/services/documentService";

const STATUS_LABEL: Record<DocumentState["status"], string> = {
  not_uploaded: "Not uploaded",
  uploading: "Uploading",
  uploaded: "Uploaded",
  failed: "Upload failed",
};

function formatSize(bytes?: number) {
  if (!bytes) return "";
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export function DocumentCard({
  doc,
  state,
  onFile,
  onSample,
  onRemove,
}: {
  doc: DocumentDefinition;
  state: DocumentState;
  onFile: (file: File) => void;
  onSample?: () => void;
  onRemove: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const status = state.status;
  const inputId = `upload-${doc.id}`;

  const StatusIcon = { not_uploaded: Circle, uploading: Loader2, uploaded: CheckCircle2, failed: AlertTriangle }[status];

  return (
    <article
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-card transition-colors",
        status === "uploaded" ? "border-emerald-200" : status === "failed" ? "border-rose-200" : "border-slate-200",
      )}
      aria-labelledby={`${doc.id}-title`}
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            status === "uploaded" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600",
          )}
        >
          <FileText className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 id={`${doc.id}-title`} className="font-semibold text-slate-900">
              {doc.name}
            </h3>
            <Badge tone={doc.requirement === "required" ? "brand" : "neutral"}>{doc.requirement === "required" ? "Likely required" : "May be needed"}</Badge>
          </div>
          <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-600">{doc.why}</p>
          <p className="mt-1 text-[13px] text-slate-500">
            <span className="font-medium text-slate-600">Accepted: </span>
            {doc.examples}
          </p>
          {doc.appliesWhen && <p className="mt-1 text-[13px] text-slate-500 italic">{doc.appliesWhen}</p>}

          <div className="mt-3">
            <AskAssistantLink question={doc.id === "bank_statement" ? "Why do you need my bank statement?" : `Why do you need my ${doc.name.toLowerCase()}?`}>
              Why do you need this?
            </AskAssistantLink>
          </div>

          {/* Status + actions */}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p
                className={cn(
                  "flex items-center gap-1.5 text-[13.5px] font-medium",
                  { not_uploaded: "text-slate-500", uploading: "text-brand-700", uploaded: "text-emerald-700", failed: "text-rose-700" }[status],
                )}
                aria-live="polite"
              >
                <StatusIcon className={cn("size-4", status === "uploading" && "animate-spin")} aria-hidden />
                {STATUS_LABEL[status]}
                {status === "uploaded" && state.fileName && (
                  <span className="max-w-[180px] truncate font-normal text-slate-500 sm:max-w-[260px]">
                    · {state.fileName} {formatSize(state.fileSize) && `(${formatSize(state.fileSize)})`}
                  </span>
                )}
              </p>

              <div className="flex items-center gap-2">
                <input
                  ref={input}
                  id={inputId}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS}
                  className="sr-only"
                  tabIndex={-1}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFile(file);
                    e.target.value = "";
                  }}
                />
                {status === "uploaded" ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => input.current?.click()}>
                      Replace
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`Remove ${doc.name}`}>
                      <X className="size-4" aria-hidden />
                    </Button>
                  </>
                ) : status === "uploading" ? null : (
                  <>
                    {onSample && (
                      <Button variant="ghost" size="sm" onClick={onSample}>
                        Use sample
                      </Button>
                    )}
                    <Button variant={status === "failed" ? "outline" : "secondary"} size="sm" onClick={() => input.current?.click()} aria-describedby={`${doc.id}-title`}>
                      {status === "failed" ? <RotateCw className="size-4" aria-hidden /> : <Upload className="size-4" aria-hidden />}
                      {status === "failed" ? "Try again" : "Upload"}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {status === "uploading" && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={state.progress ?? 0} aria-valuemin={0} aria-valuemax={100} aria-label={`Uploading ${doc.name}`}>
                <div className="h-full rounded-full bg-brand-600 transition-all duration-200" style={{ width: `${state.progress ?? 0}%` }} />
              </div>
            )}
            {status === "failed" && state.error && (
              <p role="alert" className="mt-2 text-[13px] text-rose-700">
                {state.error}
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
