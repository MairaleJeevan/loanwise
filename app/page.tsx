"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  Hourglass,
  Lock,
  MessageSquareText,
  Play,
  Route,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { AskAssistantButton } from "@/components/assistant/AskAssistantButton";
import { useAssistant } from "@/components/assistant/AssistantProvider";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { TrustCard } from "@/components/common/TrustCard";
import { track } from "@/lib/analytics";
import { formatINR, relativeDay } from "@/lib/format";
import { useJourney } from "@/lib/journey/store";

const STEPS = [
  { n: "01", title: "Tell us about your business", body: "A few questions about your business and monthly finances. About 2 minutes. No documents, no credit check." },
  { n: "02", title: "Understand your eligibility", body: "See an indicative estimate, how it was calculated, and illustrative loan options side by side." },
  { n: "03", title: "Apply when you're ready", body: "Know exactly which documents you'll need and why. Apply only if it makes sense for you." },
];

const FAQS = [
  {
    q: "Will checking my eligibility affect my credit score?",
    a: "No. The eligibility check uses only the information you enter. A credit check happens only if you choose to submit an application, and we ask for your consent first.",
  },
  {
    q: "Is the estimate an approval or an offer?",
    a: "No. It's an indicative estimate to help you decide whether to apply. The lender makes the final decision on eligibility, amount, rate and terms after verifying your documents and assessing your application.",
  },
  {
    q: "My income changes every month. Can I still check?",
    a: "Yes. Use your average monthly income over the last 6–12 months. Bank statements later help the lender understand the pattern behind it.",
  },
  {
    q: "What documents will I need?",
    a: "Usually PAN, an identity/KYC document, recent bank statements and business/income proof. GST documents, ITRs or registration proof may be requested depending on your business. You don't need any documents to check eligibility.",
  },
  {
    q: "What happens after I apply?",
    a: "Your application moves through document verification, credit assessment and a decision. You can track every stage, and you'll be told if anything else is needed. Submitting isn't a commitment to borrow.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { state, hydrated, actions } = useJourney();
  const { openAssistant } = useAssistant();

  useEffect(() => track("landing_viewed"), []);

  const hasProgress = hydrated && !state.submitted && state.lastPath && (state.business.businessType || state.finances.monthlyIncome);

  const startCheck = () => {
    router.push("/eligibility/business");
  };

  const startDemo = () => {
    actions.loadDemo();
    track("demo_started");
    router.push("/eligibility/business");
  };

  return (
    <div>
      {/* Resume / track banners */}
      {hydrated && state.submitted && (
        <div className="border-b border-brand-100 bg-brand-50">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <p className="text-sm text-brand-900">
              <span className="font-medium">Application {state.submitted.reference}</span> is in progress.
            </p>
            <Link href="/status" className="inline-flex items-center gap-1 text-sm font-medium text-brand-800 hover:underline">
              Track application <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      )}
      {hasProgress && (
        <div className="border-b border-brand-100 bg-brand-50">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <p className="text-sm text-brand-900">
              <span className="font-medium">Welcome back.</span> Your progress is saved
              {state.applicationSavedAt ? ` (${relativeDay(state.applicationSavedAt)})` : ""}.
            </p>
            <Link href={state.lastPath!} className="inline-flex items-center gap-1 text-sm font-medium text-brand-800 hover:underline">
              Continue where you left off <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-12 pb-16 sm:px-6 md:pt-20 md:pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="animate-fade-up">
            <Badge tone="brand" className="mb-5">
              <Sparkles className="size-3" aria-hidden /> For self-employed business owners
            </Badge>
            <h1 className="text-[40px] leading-[1.08] font-semibold tracking-tight text-slate-900 sm:text-[54px]">
              Know your loan eligibility <span className="text-brand-700">before you apply.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Get an indicative estimate in minutes, understand what you need, and apply with confidence.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={startCheck}>
                Check My Eligibility <ArrowRight className="size-4" aria-hidden />
              </Button>
              <ButtonLink href="#how-it-works" variant="outline" size="lg">
                How It Works
              </ButtonLink>
            </div>
            <ul className="mt-8 flex flex-col gap-2.5 text-[15px] text-slate-700 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {["Quick eligibility check", "Secure & confidential", "No obligation to apply"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4.5 text-brand-600" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <button onClick={startDemo} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700">
              <Play className="size-3.5" aria-hidden /> Start Demo with a sample customer
            </button>
          </div>

          {/* Illustrative product preview */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-label="Example of an indicative estimate">
            <div className="absolute -inset-6 -z-0 rounded-[40px] bg-brand-50/70" aria-hidden />
            <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-raised">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Example estimate</p>
                <Badge tone="indicative">Indicative</Badge>
              </div>
              <p className="mt-4 text-sm text-slate-600">You may be able to borrow up to</p>
              <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900 tabular-nums">{formatINR(1090000)}</p>
              <p className="mt-1 text-sm text-slate-500">over 48 months · illustrative EMI ~{formatINR(21861)}/month for ₹8 lakh</p>
              <div className="mt-5 space-y-2.5 rounded-2xl bg-slate-50 p-4 text-sm">
                {[
                  ["Monthly income", formatINR(100000)],
                  ["Existing EMIs", `− ${formatINR(20000)}`],
                  ["Repayment capacity", formatINR(30000)],
                ].map(([k, v], i) => (
                  <div key={k} className={`flex justify-between ${i === 2 ? "border-t border-slate-200 pt-2.5 font-medium text-slate-900" : "text-slate-600"}`}>
                    <span>{k}</span>
                    <span className="tabular-nums">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-3.5">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white">
                  <Sparkles className="size-3.5" aria-hidden />
                </span>
                <p className="text-[13.5px] leading-relaxed text-slate-700">
                  &ldquo;Your existing EMIs use part of your income, so the estimate is based on the ₹30,000 left for a new repayment.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you'll know */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Answers first. Forms later.</h2>
          <p className="mt-3 text-lg text-slate-600">Most loan journeys ask for everything up front. We start with the four things you actually want to know.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TrustCard icon={BadgeCheck} title="Am I likely to be eligible?">
            An indicative view in about 2 minutes — before you share documents or consent to a credit check.
          </TrustCard>
          <TrustCard icon={Wallet} title="How much could I borrow?">
            An indicative amount and illustrative EMIs, with the calculation shown step by step.
          </TrustCard>
          <TrustCard icon={FileCheck2} title="What will I need?">
            A document checklist tailored to your business, with a plain reason for every item.
          </TrustCard>
          <TrustCard icon={Hourglass} title="What happens after?">
            Every stage from verification to decision is visible, so you&apos;re never left wondering.
          </TrustCard>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-y border-slate-200/70 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">How it works</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="relative rounded-2xl border border-slate-200 bg-canvas p-6">
                <span className="text-sm font-semibold tracking-wider text-brand-600 tabular-nums">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={startCheck}>
              Check My Eligibility <ArrowRight className="size-4" aria-hidden />
            </Button>
            <ButtonLink href="/documents" variant="outline" size="lg">
              See the document checklist
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Assistant */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge tone="brand" className="mb-4">
              <Sparkles className="size-3" aria-hidden /> Loan Assistant
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">A guide at every step — not a gatekeeper.</h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-600">
              Ask why a document is needed, what an EMI means, or how your estimate was worked out. Loan Assistant knows where you are in the journey and
              explains things in plain language — in English or Hindi.
            </p>
            <ul className="mt-6 space-y-3 text-[15px] text-slate-700">
              {[
                [Calculator, "Explains your own numbers, not generic FAQs"],
                [Route, "Knows which step you're on and what comes next"],
                [ShieldCheck, "Never promises approval or invents rates"],
              ].map(([Icon, text]) => {
                const I = Icon as typeof Calculator;
                return (
                  <li key={text as string} className="flex items-center gap-3">
                    <I className="size-5 text-brand-600" aria-hidden />
                    {text as string}
                  </li>
                );
              })}
            </ul>
            <AskAssistantButton className="mt-8" size="lg" variant="secondary" />
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
            <div className="space-y-4 text-[14.5px] leading-relaxed">
              <div className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-700 px-4 py-2.5 text-white">My income changes every month. Can I still apply?</p>
              </div>
              <div className="flex gap-2.5">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white">
                  <Sparkles className="size-3.5" aria-hidden />
                </span>
                <p className="max-w-[88%] rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-slate-800">
                  Yes, variable income does not automatically prevent you from checking eligibility. Your income pattern and supporting financial information
                  may be considered during assessment. Let&apos;s continue with your average monthly income.
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Why do you need my bank statement?", "What happens after I apply?"].map((q) => (
                <button
                  key={q}
                  onClick={() => openAssistant(q)}
                  className="rounded-full border border-brand-200 px-3 py-1.5 text-[13px] font-medium text-brand-800 hover:bg-brand-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Promises */}
      <section className="border-y border-slate-200/70 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Transparent by design</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <TrustCard icon={Lock} title="Only what's needed, when it's needed">
              No PAN, Aadhaar or documents to check eligibility. We ask for identity details only if you decide to apply.
            </TrustCard>
            <TrustCard icon={Calculator} title="Every number explained">
              Estimates are clearly labelled as indicative, with the calculation shown. No &ldquo;instant approval&rdquo; claims.
            </TrustCard>
            <TrustCard icon={MessageSquareText} title="You stay in control">
              Compare options, save and come back later, and see every stage after you apply. Applying never commits you to borrow.
            </TrustCard>
          </div>
        </div>
      </section>

      {/* FAQ / Help */}
      <section id="help" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-16 sm:px-6 md:py-20">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Questions people ask</h2>
        <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {FAQS.map((f) => (
            <details key={f.q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-900">
                {f.q}
                <ChevronDown className="size-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-start gap-3 rounded-2xl bg-brand-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px] text-brand-900">Have a question that isn&apos;t here?</p>
          <AskAssistantButton variant="primary" />
        </div>
      </section>
    </div>
  );
}
