import Link from "next/link";
import { AlertTriangle, CheckCircle2, Circle, Pencil } from "lucide-react";
import { formatINR } from "@/lib/format";
import { labelFor } from "@/lib/journey/constants";
import type { DocumentState, JourneyState, LoanOption } from "@/lib/journey/types";
import type { DocumentDefinition } from "@/services/documentService";

export function SummaryCard({
  title,
  editHref,
  children,
  readOnly,
}: {
  title: string;
  editHref?: string;
  children: React.ReactNode;
  readOnly?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-label={title}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        {!readOnly && editHref && (
          <Link href={editHref} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[13.5px] font-medium text-brand-700 hover:bg-brand-50" aria-label={`Edit ${title}`}>
            <Pencil className="size-3.5" aria-hidden /> Edit
          </Link>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function SummaryRows({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt className="text-[13px] text-slate-500">{k}</dt>
          <dd className="mt-0.5 text-[15px] font-medium break-words text-slate-900">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

/** All review cards, reused read-only on the status page ("View Application"). */
export function ApplicationSummary({
  state,
  selectedOption,
  checklist,
  readOnly,
}: {
  state: JourneyState;
  selectedOption: LoanOption | null;
  checklist: DocumentDefinition[];
  readOnly?: boolean;
}) {
  const { application, business, finances, eligibility } = state;
  const docState = (id: string): DocumentState => state.documents[id] ?? { id, status: "not_uploaded" };
  const required = checklist.filter((d) => d.requirement === "required");
  const optional = checklist.filter((d) => d.requirement === "maybe" && docState(d.id).status === "uploaded");
  const pending = required.filter((d) => docState(d.id).status !== "uploaded");
  const aboveEstimate = selectedOption && eligibility?.status === "estimated" && selectedOption.amount > eligibility.eligibleAmount && selectedOption.tenureMonths === eligibility.tenureMonths;

  return (
    <div className="space-y-4">
      <SummaryCard title="Personal Details" editHref="/apply#personal" readOnly={readOnly}>
        <SummaryRows
          rows={[
            ["Full name", application.personal.fullName],
            ["Mobile", application.personal.mobile ? `+91 ${application.personal.mobile}` : ""],
            ["Email", application.personal.email],
          ]}
        />
      </SummaryCard>

      <SummaryCard title="Business Details" editHref="/apply#business" readOnly={readOnly}>
        <SummaryRows
          rows={[
            ["Business name", application.businessName],
            ["Business type", labelFor.businessType(business.businessType)],
            ["Business vintage", labelFor.vintage(business.vintage)],
            ["Location", business.location],
            ["Category", business.industry],
          ]}
        />
      </SummaryCard>

      <SummaryCard title="Financial Information" editHref="/apply#financial" readOnly={readOnly}>
        <SummaryRows
          rows={[
            ["Average monthly income", formatINR(finances.monthlyIncome)],
            ["Existing monthly EMIs", formatINR(finances.existingEmi)],
          ]}
        />
      </SummaryCard>

      <SummaryCard title="Loan Selection" editHref="/options" readOnly={readOnly}>
        {selectedOption ? (
          <>
            <SummaryRows
              rows={[
                ["Amount", formatINR(selectedOption.amount)],
                ["Tenure", `${selectedOption.tenureMonths} months`],
                ["Illustrative EMI", `${formatINR(selectedOption.emi)}/month`],
                ["Option", selectedOption.label],
              ]}
            />
            <p className="mt-4 text-[12.5px] text-slate-500">Illustrative figures. The final amount, rate and EMI are set by the lender after assessment.</p>
            {aboveEstimate && (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[13.5px] text-amber-900">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                This amount is above your indicative estimate of {formatINR(eligibility!.eligibleAmount)}. The lender may offer a different amount.
              </p>
            )}
          </>
        ) : (
          <p className="text-[14.5px] text-slate-600">No option selected yet.</p>
        )}
      </SummaryCard>

      <SummaryCard title="Documents" editHref="/documents" readOnly={readOnly}>
        <ul className="space-y-2">
          {[...required, ...optional].map((d) => {
            const s = docState(d.id);
            const done = s.status === "uploaded";
            return (
              <li key={d.id} className="flex items-center justify-between gap-3 text-[14.5px]">
                <span className="flex items-center gap-2 text-slate-800">
                  {done ? <CheckCircle2 className="size-4 text-emerald-600" aria-hidden /> : <Circle className="size-4 text-slate-300" aria-hidden />}
                  {d.name}
                </span>
                <span className={done ? "text-[13px] text-emerald-700" : "text-[13px] text-slate-500"}>{done ? "Uploaded" : "Not uploaded yet"}</span>
              </li>
            );
          })}
        </ul>
        {pending.length > 0 && !readOnly && (
          <p className="mt-4 rounded-xl bg-slate-50 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-slate-600">
            You can submit now and upload the remaining {pending.length === 1 ? "document" : `${pending.length} documents`} later from your status page.
            Verification can only be completed once everything is in.
          </p>
        )}
      </SummaryCard>
    </div>
  );
}
