"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BellRing, FileText, Pencil, PhoneCall, SearchX, Sparkles, TrendingDown } from "lucide-react";
import { AskAssistantButton } from "@/components/assistant/AskAssistantButton";
import { ErrorState } from "@/components/common/ErrorState";
import { CalculationBreakdown } from "@/components/eligibility/CalculationBreakdown";
import { EligibilityCard } from "@/components/eligibility/EligibilityCard";
import { JourneyShell } from "@/components/layout/JourneyShell";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { track } from "@/lib/analytics";
import { useJourney } from "@/lib/journey/store";

export default function EligibilityResultPage() {
  const router = useRouter();
  const { state, hydrated } = useJourney();
  const result = state.eligibility;
  const tracked = useRef(false);

  useEffect(() => {
    if (result && !tracked.current) {
      tracked.current = true;
      track("eligibility_result_viewed", { status: result.status });
    }
  }, [result]);

  if (!hydrated) return <JourneyShell step={2} stepCaption="Your estimate" title="Your indicative estimate">{null}</JourneyShell>;

  if (!result) {
    return (
      <JourneyShell step={2} stepCaption="Your estimate" title="Your indicative estimate">
        <ErrorState
          variant="info"
          title="We don't have your details yet"
          message="Tell us about your business and finances — it takes about 2 minutes — and we'll show your indicative estimate here."
        >
          <ButtonLink href="/eligibility/business" size="sm">
            Check my eligibility
          </ButtonLink>
        </ErrorState>
      </JourneyShell>
    );
  }

  if (result.status === "not_eligible_now") return <NotRightNow reasons={result.reasons} />;
  if (result.status === "unable_to_estimate") return <UnableToEstimate reasons={result.reasons} />;

  return (
    <JourneyShell
      step={2}
      stepCaption="Your estimate"
      eyebrow={
        <Badge tone="brand" className="text-[13px]">
          Your indicative view is ready
        </Badge>
      }
      title="Here's what you may be able to borrow"
      subtitle="Based on what you've told us. Nothing is final yet, and there's no obligation to apply."
      aside={
        <>
          <CalculationBreakdown result={result} />
          <Card>
            <CardContent>
              <p className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
                <Sparkles className="size-4 text-brand-600" aria-hidden /> Questions about your estimate?
              </p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600">Loan Assistant can walk you through your own numbers.</p>
              <AskAssistantButton question="How was this estimate calculated?" size="sm" variant="secondary" className="mt-4 w-full">
                Ask Loan Assistant
              </AskAssistantButton>
            </CardContent>
          </Card>
        </>
      }
      actions={
        <>
          <ButtonLink href="/eligibility/finances" variant="ghost" className="hidden sm:inline-flex">
            <Pencil className="size-4" aria-hidden /> Edit my details
          </ButtonLink>
          <div className="flex w-full flex-col-reverse gap-2.5 sm:w-auto sm:flex-row">
            <AskAssistantButton size="lg" className="hidden md:inline-flex" />
            <Button size="lg" onClick={() => router.push("/options")} className="w-full sm:w-auto">
              Explore Loan Options <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        </>
      }
    >
      <EligibilityCard result={result} />

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-[15px] font-semibold text-slate-900">What happens next — only if you want to</p>
        <ol className="mt-3 grid gap-3 text-[14px] text-slate-600 sm:grid-cols-3">
          {[
            ["1", "Compare 3 illustrative options", "Pick the EMI that fits your cash flow."],
            ["2", "See your document checklist", "Know what you'll need and why."],
            ["3", "Apply when you're ready", "Save and come back any time."],
          ].map(([n, t, d]) => (
            <li key={n} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[12.5px] font-semibold text-brand-800">{n}</span>
              <span>
                <span className="block font-medium text-slate-800">{t}</span>
                {d}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <Link href="/eligibility/finances" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline sm:hidden">
        <Pencil className="size-3.5" aria-hidden /> Edit my details
      </Link>
    </JourneyShell>
  );
}

/** Edge case: the customer can't proceed right now. No dead end, no rejection language. */
function NotRightNow({ reasons }: { reasons: string[] }) {
  const toast = useToast();
  const [reminded, setReminded] = useState(false);
  return (
    <JourneyShell
      step={2}
      stepCaption="Your estimate"
      title="We can't show an estimate right now"
      subtitle="This isn't a final decision — it's what the details you entered suggest today."
      actions={
        <>
          <AskAssistantButton question="How can I improve my eligibility?" size="lg">
            Ask what could help
          </AskAssistantButton>
          <ButtonLink href="/eligibility/finances" size="lg">
            <Pencil className="size-4" aria-hidden /> Adjust my details
          </ButtonLink>
        </>
      }
    >
      <Card>
        <CardContent className="space-y-5">
          <div className="flex gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <TrendingDown className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-semibold text-slate-900">Why we couldn&apos;t estimate</p>
              <ul className="mt-2 space-y-1.5 text-[15px] leading-relaxed text-slate-600">
                {reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[14.5px] font-medium text-slate-900">Things that often help</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[14.5px] text-slate-600 marker:text-brand-500">
              <li>Closing or reducing an existing loan before applying</li>
              <li>Checking your income figure is a monthly average, after business expenses</li>
              <li>Coming back once your business has a longer trading history</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={reminded}
              onClick={() => {
                setReminded(true);
                toast({ tone: "success", title: "We'll remind you in 3 months", description: "Demo only — no message will be sent." });
              }}
            >
              <BellRing className="size-4" aria-hidden /> {reminded ? "Reminder set" : "Remind me to check again"}
            </Button>
            <ButtonLink href="/documents" variant="ghost" size="sm">
              <FileText className="size-4" aria-hidden /> See the document checklist anyway
            </ButtonLink>
          </div>
        </CardContent>
      </Card>
    </JourneyShell>
  );
}

/** Edge case: outside the range an online estimate can cover. Route to a human. */
function UnableToEstimate({ reasons }: { reasons: string[] }) {
  const toast = useToast();
  const [requested, setRequested] = useState(false);
  return (
    <JourneyShell
      step={2}
      stepCaption="Your estimate"
      title="We can't give an online estimate for this request"
      subtitle="Your request needs a closer look than an online calculator can give."
      actions={
        <>
          <ButtonLink href="/eligibility/finances" variant="outline" size="lg">
            <Pencil className="size-4" aria-hidden /> Change amount
          </ButtonLink>
          <Button
            size="lg"
            disabled={requested}
            onClick={() => {
              setRequested(true);
              toast({ tone: "success", title: "Callback requested", description: "A specialist would call within 1 working day. (Demo — no call will be made.)" });
            }}
          >
            <PhoneCall className="size-4" aria-hidden /> {requested ? "Callback requested" : "Talk to a specialist"}
          </Button>
        </>
      }
    >
      <Card>
        <CardContent className="flex gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <SearchX className="size-5" aria-hidden />
          </span>
          <div className="space-y-2 text-[15px] leading-relaxed text-slate-600">
            {reasons.map((r) => (
              <p key={r}>{r}</p>
            ))}
            <p>A specialist can review your business in more detail and explain your options. You&apos;re under no obligation.</p>
          </div>
        </CardContent>
      </Card>
    </JourneyShell>
  );
}
