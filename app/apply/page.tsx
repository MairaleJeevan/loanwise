"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Briefcase, CheckCircle2, IndianRupee, Landmark, Pencil, Save, User } from "lucide-react";
import { ErrorState } from "@/components/common/ErrorState";
import { JourneyShell } from "@/components/layout/JourneyShell";
import { Button, ButtonLink } from "@/components/ui/button";
import { ChoiceGroup } from "@/components/ui/choice-group";
import { CurrencyInput, Field, Input, Select } from "@/components/ui/field";
import { InfoToggle } from "@/components/ui/info-toggle";
import { useToast } from "@/components/ui/toast";
import { track } from "@/lib/analytics";
import { formatINR, relativeDay } from "@/lib/format";
import { BUSINESS_TYPES, CITIES, TENURES } from "@/lib/journey/constants";
import { useJourney } from "@/lib/journey/store";
import type { BusinessType } from "@/lib/journey/types";
import { normaliseMobile, validateFinances, validatePersonal } from "@/lib/journey/validation";
import { cn } from "@/lib/utils";
import { applicationService } from "@/services/applicationService";
import { buildLoanOptions, calculateEligibility, calculateEmi } from "@/services/eligibilityService";

type SectionId = "personal" | "business" | "financial" | "loan";
const SECTIONS: { id: SectionId; title: string; icon: typeof User }[] = [
  { id: "personal", title: "Personal details", icon: User },
  { id: "business", title: "Business details", icon: Briefcase },
  { id: "financial", title: "Financial details", icon: Landmark },
  { id: "loan", title: "Loan details", icon: IndianRupee },
];

export default function ApplicationPage() {
  const router = useRouter();
  const toast = useToast();
  const { state, hydrated, actions, selectedOption } = useJourney();
  const { application, business, finances, eligibility } = state;
  const [open, setOpen] = useState<SectionId | null>(null);
  const [showErrors, setShowErrors] = useState<Partial<Record<SectionId, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const [loan, setLoan] = useState<{ amount: number | null; tenure: number | null }>({ amount: null, tenure: null });
  const started = useRef(false);

  // Initialise the loan draft and the open section once state is restored.
  useEffect(() => {
    if (!hydrated || started.current) return;
    started.current = true;
    track("application_started", { demo: state.demoMode });
    setLoan({ amount: selectedOption?.amount ?? finances.requestedAmount, tenure: selectedOption?.tenureMonths ?? finances.tenureMonths });
    const hash = window.location.hash.replace("#", "") as SectionId;
    setOpen(SECTIONS.some((s) => s.id === hash) ? hash : "personal");
  }, [hydrated, selectedOption, finances, state.demoMode]);

  const personalErrors = validatePersonal(application.personal);
  const businessErrors = {
    businessName: !application.businessName.trim() ? "Please enter your business name." : undefined,
    businessType: !business.businessType ? "Please choose your business type." : undefined,
    location: !business.location.trim() ? "Please enter your business location." : undefined,
  };
  const financeErrors = validateFinances({ ...finances, requestedAmount: loan.amount ?? finances.requestedAmount, tenureMonths: loan.tenure ?? finances.tenureMonths });
  const loanErrors = {
    amount: loan.amount == null ? "Please enter a loan amount." : loan.amount < 50_000 ? "The minimum amount is ₹50,000." : loan.amount > 50_00_000 ? "Online applications are available up to ₹50 lakh." : undefined,
    tenure: !loan.tenure ? "Please choose a tenure." : undefined,
  };
  const valid: Record<SectionId, boolean> = {
    personal: Object.keys(personalErrors).length === 0,
    business: !Object.values(businessErrors).some(Boolean),
    financial: !financeErrors.monthlyIncome && !financeErrors.existingEmi,
    loan: !Object.values(loanErrors).some(Boolean),
  };
  const doneCount = SECTIONS.filter((s) => valid[s.id]).length;

  // Illustrative EMI + estimate check for the loan the customer is setting.
  const liveEstimate = useMemo(() => {
    if (!business.vintage || finances.monthlyIncome == null || finances.existingEmi == null || !loan.amount || !loan.tenure) return null;
    try {
      return calculateEligibility({ business, finances: { ...finances, requestedAmount: loan.amount, tenureMonths: loan.tenure } });
    } catch {
      return null;
    }
  }, [business, finances, loan]);

  const financeChanged =
    eligibility && (eligibility.monthlyIncome !== finances.monthlyIncome || eligibility.existingEmi !== finances.existingEmi);

  const commitLoan = () => {
    if (!loan.amount || !loan.tenure) return;
    if (financeChanged && liveEstimate) actions.setEligibility(liveEstimate, buildLoanOptions(liveEstimate));
    actions.setCustomLoan(loan.amount, loan.tenure);
  };

  const continueFrom = (id: SectionId) => {
    setShowErrors((s) => ({ ...s, [id]: true }));
    if (!valid[id]) return;
    const next = SECTIONS.find((s) => !valid[s.id] && s.id !== id);
    setOpen(next?.id ?? null);
    if (id === "loan") commitLoan();
  };

  const onReview = () => {
    setShowErrors({ personal: true, business: true, financial: true, loan: true });
    const firstInvalid = SECTIONS.find((s) => !valid[s.id]);
    if (firstInvalid) {
      setOpen(firstInvalid.id);
      toast({ tone: "error", title: "A few details need attention", description: `Please complete ${firstInvalid.title.toLowerCase()}.` });
      document.getElementById(`section-${firstInvalid.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    actions.setApplication({ personal: { ...application.personal, mobile: normaliseMobile(application.personal.mobile) } });
    commitLoan();
    router.push("/review");
  };

  const onSave = async () => {
    setSaving(true);
    try {
      commitLoan();
      const { savedAt } = await applicationService.saveDraft();
      actions.markSaved(savedAt);
      track("application_saved");
      toast({ tone: "success", title: "Application saved", description: "Pick up where you left off any time from the home page on this device." });
    } catch (err) {
      toast({ tone: "error", title: "Couldn't save right now", description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (hydrated && (!eligibility || eligibility.status !== "estimated")) {
    return (
      <JourneyShell step={3} title="Your application">
        <ErrorState
          variant="info"
          title="Let's check your eligibility first"
          message="It takes about 2 minutes and means you'll only apply if it makes sense for you. We'll prefill your application with what you tell us."
        >
          <ButtonLink href="/eligibility/business" size="sm">
            Check my eligibility
          </ButtonLink>
        </ErrorState>
      </JourneyShell>
    );
  }

  const p = application.personal;
  const err = (id: SectionId) => Boolean(showErrors[id]);

  return (
    <JourneyShell
      step={3}
      title="Your application"
      subtitle="We've prefilled what you told us. Check each section, change anything, and save to finish later if you need to."
      actions={
        <>
          <Button variant="outline" size="lg" onClick={onSave} loading={saving} className="w-full sm:w-auto">
            {!saving && <Save className="size-4" aria-hidden />} Save &amp; Come Back Later
          </Button>
          <Button size="lg" onClick={onReview} className="w-full sm:w-auto">
            Review Application <ArrowRight className="size-4" aria-hidden />
          </Button>
        </>
      }
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-[13.5px]">
        <p className="text-slate-600">
          <span className="font-semibold text-slate-900">{doneCount} of 4</span> sections complete
        </p>
        {state.applicationSavedAt && <p className="text-slate-500">Last saved {relativeDay(state.applicationSavedAt)}</p>}
      </div>

      <div className="space-y-3">
        {SECTIONS.map(({ id, title, icon: Icon }) => {
          const isOpen = open === id;
          const summary = {
            personal: p.fullName ? `${p.fullName} · ${p.mobile || "no mobile"}` : "Name, mobile and email",
            business: application.businessName ? `${application.businessName} · ${business.location}` : "Business name, type and location",
            financial: `${formatINR(finances.monthlyIncome)} income · ${formatINR(finances.existingEmi)} EMIs`,
            loan: loan.amount ? `${formatINR(loan.amount)} over ${loan.tenure} months` : "Amount and tenure",
          }[id];
          return (
            <section key={id} id={`section-${id}`} className={cn("scroll-mt-24 rounded-2xl border bg-white shadow-card", isOpen ? "border-brand-300" : "border-slate-200")}>
              <h2>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`panel-${id}`}
                  onClick={() => setOpen(isOpen ? null : id)}
                  className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left sm:px-6"
                >
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", valid[id] ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                    {valid[id] ? <CheckCircle2 className="size-5" aria-hidden /> : <Icon className="size-4.5" aria-hidden />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-slate-900">{title}</span>
                    {!isOpen && <span className="block truncate text-[13.5px] text-slate-500">{summary}</span>}
                  </span>
                  {!isOpen && (
                    <span className="flex items-center gap-1 text-[13px] font-medium text-brand-700">
                      <Pencil className="size-3.5" aria-hidden /> Edit
                    </span>
                  )}
                  {valid[id] ? <span className="sr-only">Complete</span> : err(id) ? <span className="sr-only">Needs attention</span> : null}
                </button>
              </h2>

              {isOpen && (
                <div id={`panel-${id}`} className="animate-fade-up space-y-5 border-t border-slate-100 px-5 pt-5 pb-6 sm:px-6">
                  {id === "personal" && (
                    <>
                      <Field label="Full name" hint="As it appears on your PAN card" error={err(id) ? personalErrors.fullName : null}>
                        {({ id: fid, describedBy, invalid }) => (
                          <Input id={fid} aria-describedby={describedBy} invalid={invalid} autoComplete="name" value={p.fullName} onChange={(e) => actions.setApplication({ personal: { ...p, fullName: e.target.value } })} />
                        )}
                      </Field>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Mobile number" error={err(id) ? personalErrors.mobile : null} hint="For updates about your application">
                          {({ id: fid, describedBy, invalid }) => (
                            <div className="relative">
                              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">+91</span>
                              <Input
                                id={fid}
                                aria-describedby={describedBy}
                                invalid={invalid}
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel-national"
                                maxLength={14}
                                className="pl-12 tabular-nums"
                                value={p.mobile}
                                onChange={(e) => actions.setApplication({ personal: { ...p, mobile: e.target.value.replace(/[^\d\s+-]/g, "") } })}
                              />
                            </div>
                          )}
                        </Field>
                        <Field label="Email" error={err(id) ? personalErrors.email : null}>
                          {({ id: fid, describedBy, invalid }) => (
                            <Input id={fid} aria-describedby={describedBy} invalid={invalid} type="email" autoComplete="email" value={p.email} onChange={(e) => actions.setApplication({ personal: { ...p, email: e.target.value } })} />
                          )}
                        </Field>
                      </div>
                      <InfoToggle label="Why do we need these?">
                        Your mobile and email are used only to send updates about this application and to reach you if the lender needs anything. They aren&apos;t used
                        for your eligibility estimate.
                      </InfoToggle>
                    </>
                  )}

                  {id === "business" && (
                    <>
                      <Field label="Business name" error={err(id) ? businessErrors.businessName : null} hint="Trading name is fine">
                        {({ id: fid, describedBy, invalid }) => (
                          <Input id={fid} aria-describedby={describedBy} invalid={invalid} autoComplete="organization" value={application.businessName} onChange={(e) => actions.setApplication({ businessName: e.target.value })} />
                        )}
                      </Field>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Business type" error={err(id) ? businessErrors.businessType : null}>
                          {({ id: fid, describedBy, invalid }) => (
                            <Select id={fid} aria-describedby={describedBy} invalid={invalid} value={business.businessType ?? ""} onChange={(e) => actions.setBusiness({ businessType: e.target.value as BusinessType })}>
                              <option value="" disabled>
                                Choose
                              </option>
                              {BUSINESS_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </Select>
                          )}
                        </Field>
                        <Field label="Business location" error={err(id) ? businessErrors.location : null}>
                          {({ id: fid, describedBy, invalid }) => (
                            <>
                              <Input id={fid} aria-describedby={describedBy} invalid={invalid} list="apply-city-list" value={business.location} onChange={(e) => actions.setBusiness({ location: e.target.value })} />
                              <datalist id="apply-city-list">
                                {CITIES.map((c) => (
                                  <option key={c} value={c} />
                                ))}
                              </datalist>
                            </>
                          )}
                        </Field>
                      </div>
                    </>
                  )}

                  {id === "financial" && (
                    <>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Average monthly income" error={err(id) ? financeErrors.monthlyIncome : null}>
                          {({ id: fid, describedBy, invalid }) => (
                            <CurrencyInput id={fid} describedBy={describedBy} invalid={invalid} value={finances.monthlyIncome} onChange={(v) => actions.setFinances({ monthlyIncome: v })} />
                          )}
                        </Field>
                        <Field label="Existing monthly obligations (EMIs)" error={err(id) ? financeErrors.existingEmi : null}>
                          {({ id: fid, describedBy, invalid }) => (
                            <CurrencyInput id={fid} describedBy={describedBy} invalid={invalid} value={finances.existingEmi} onChange={(v) => actions.setFinances({ existingEmi: v })} />
                          )}
                        </Field>
                      </div>
                      {financeChanged && (
                        <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-[13.5px] text-amber-900">
                          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                          You&apos;ve changed figures used in your estimate. We&apos;ll update your indicative estimate when you review.
                        </p>
                      )}
                    </>
                  )}

                  {id === "loan" && (
                    <>
                      <Field label="Requested amount" error={err(id) ? loanErrors.amount : null}>
                        {({ id: fid, describedBy, invalid }) => <CurrencyInput id={fid} describedBy={describedBy} invalid={invalid} value={loan.amount} onChange={(v) => setLoan((l) => ({ ...l, amount: v }))} />}
                      </Field>
                      <ChoiceGroup
                        legend="Tenure"
                        name="apply-tenure"
                        options={TENURES.map((t) => ({ value: t, label: `${t} mo` }))}
                        value={loan.tenure}
                        onChange={(v) => setLoan((l) => ({ ...l, tenure: v }))}
                        error={err(id) ? loanErrors.tenure : null}
                        columns={5}
                        compact
                      />
                      {loan.amount && loan.tenure && loan.amount >= 50_000 && (
                        <div className="rounded-xl bg-slate-50 px-4 py-3 text-[14px]">
                          <p className="text-slate-600">
                            Illustrative EMI: <span className="font-semibold text-slate-900 tabular-nums">{formatINR(calculateEmi(loan.amount, loan.tenure))}/month</span>
                          </p>
                          {liveEstimate?.status === "estimated" && loan.amount > liveEstimate.eligibleAmount && (
                            <p className="mt-1.5 flex items-start gap-1.5 text-amber-800">
                              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                              This is above your indicative estimate of {formatINR(liveEstimate.eligibleAmount)} for {loan.tenure} months. You can still apply, but the
                              lender may offer a different amount.
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-end">
                    <Button variant="secondary" onClick={() => continueFrom(id)}>
                      {SECTIONS.findIndex((s) => s.id === id) === SECTIONS.length - 1 ? "Done" : "Continue"}
                    </Button>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </JourneyShell>
  );
}
