"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, BookOpen, FastForward, FlaskConical, Play, RotateCcw, Timer } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { track } from "@/lib/analytics";
import { DEMO_CUSTOMER, DEMO_SCENARIOS } from "@/lib/journey/demoData";
import { useJourney } from "@/lib/journey/store";
import { simulation, triggerSessionTimeout, useSimulation, type SimulationFlags } from "@/lib/simulation";
import { cn } from "@/lib/utils";
import { getDocumentChecklist } from "@/services/documentService";
import { buildLoanOptions, calculateEligibility } from "@/services/eligibilityService";

type FastForwardTarget = "result" | "documents" | "review" | "status";

/**
 * Presenter controls. Lets the journey be demonstrated in ~7 minutes and
 * edge cases be shown on demand. Toggle visibility with Shift + D.
 */
export function DemoPanel() {
  const router = useRouter();
  const toast = useToast();
  const flags = useSimulation();
  const { actions } = useJourney();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "d" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        setHidden((h) => !h);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const startDemo = () => {
    actions.loadDemo();
    track("demo_started");
    go("/eligibility/business");
  };

  const fastForward = (target: FastForwardTarget) => {
    actions.loadDemo();
    const result = calculateEligibility({ business: DEMO_CUSTOMER.business, finances: DEMO_CUSTOMER.finances });
    const options = buildLoanOptions(result);
    actions.setEligibility(result, options);
    const balanced = options.find((o) => o.id === "balanced") ?? options[0];
    if (target !== "result") actions.selectOption(balanced.id);
    if (target === "review" || target === "status") {
      const now = new Date().toISOString();
      getDocumentChecklist(DEMO_CUSTOMER.business)
        .filter((d) => d.requirement === "required")
        .forEach((d) => actions.setDocument(d.id, { status: "uploaded", fileName: `${d.id.replace("_", "-")}-sample.pdf`, fileSize: 412_000, progress: 100, uploadedAt: now }));
    }
    if (target === "status") {
      const now = new Date().toISOString();
      actions.submit({ reference: "APP-2026-00124", submittedAt: now, stage: "document_verification", lastUpdated: now });
    }
    go({ result: "/eligibility/result", documents: "/documents", review: "/review", status: "/status" }[target]);
  };

  const loadScenario = (key: keyof typeof DEMO_SCENARIOS) => {
    const s = DEMO_SCENARIOS[key];
    actions.loadScenario(s.business, s.finances);
    toast({ tone: "info", title: `Scenario loaded: ${s.label}`, description: "Press “Check My Eligibility” to see how it's handled." });
    go("/eligibility/finances");
  };

  const toggle = (key: keyof SimulationFlags, label: string) => {
    const next = !flags[key];
    simulation.set({ [key]: next });
    toast({ tone: "info", title: `${label}: ${next ? "on" : "off"}` });
  };

  if (hidden) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[92px] left-4 z-40 flex items-center gap-1.5 rounded-full border border-slate-300 bg-white/95 px-3 py-2 text-[12.5px] font-medium text-slate-700 shadow-card backdrop-blur hover:bg-white sm:bottom-6 sm:left-6"
        aria-label="Open presenter demo controls"
      >
        <FlaskConical className="size-4 text-brand-700" aria-hidden />
        Demo
        {(flags.networkFailure || flags.uploadFailure || flags.aiUnavailable) && <span className="size-2 rounded-full bg-amber-500" aria-label="Simulation active" />}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title="Presenter controls" description="Run the journey quickly with a fictional sample customer, or trigger edge cases. Shift + D hides this button.">
          <div className="space-y-6">
            <section>
              <Button className="w-full" size="lg" onClick={startDemo}>
                <Play className="size-4" aria-hidden /> Start Demo — Rahul Sharma, Sharma Electricals
              </Button>
              <p className="mt-2 text-[12.5px] text-slate-500">
                Prefills a fictional sole proprietor (5+ years, Pune) earning ₹1,00,000/month with ₹20,000 EMIs, asking for ₹8,00,000 over 48 months.
              </p>
            </section>

            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold tracking-wide text-slate-500 uppercase">
                <FastForward className="size-3.5" aria-hidden /> Jump ahead with sample data
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["result", "Eligibility result"],
                    ["documents", "Documents"],
                    ["review", "Review"],
                    ["status", "Application status"],
                  ] as [FastForwardTarget, string][]
                ).map(([t, label]) => (
                  <Button key={t} variant="outline" size="sm" onClick={() => fastForward(t)}>
                    {label}
                  </Button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-[13px] font-semibold tracking-wide text-slate-500 uppercase">Edge-case scenarios</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="outline" size="sm" onClick={() => loadScenario("highObligations")}>
                  Can&apos;t proceed right now
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadScenario("outsideRange")}>
                  Unable to estimate
                </Button>
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-[13px] font-semibold tracking-wide text-slate-500 uppercase">Simulate failures</h3>
              <div className="space-y-2">
                {(
                  [
                    ["networkFailure", "Network failure", "The next save, estimate, upload or submit fails once"],
                    ["uploadFailure", "Upload failure", "Every document upload fails until switched off"],
                    ["aiUnavailable", "AI unavailable", "Loan Assistant can't be reached"],
                  ] as [keyof SimulationFlags, string, string][]
                ).map(([key, label, hint]) => (
                  <label key={key} className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 px-3.5 py-2.5 hover:bg-slate-50">
                    <span>
                      <span className="block text-sm font-medium text-slate-800">{label}</span>
                      <span className="block text-[12.5px] text-slate-500">{hint}</span>
                    </span>
                    <input type="checkbox" role="switch" checked={flags[key]} onChange={() => toggle(key, label)} className="peer sr-only" />
                    <span aria-hidden className={cn("relative h-6 w-10 shrink-0 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600", flags[key] ? "bg-brand-600" : "bg-slate-300")}>
                      <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", flags[key] ? "left-[18px]" : "left-0.5")} />
                    </span>
                  </label>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                    setTimeout(triggerSessionTimeout, 250);
                  }}
                >
                  <Timer className="size-4" aria-hidden /> Trigger session timeout now
                </Button>
              </div>
            </section>

            <section className="flex flex-wrap gap-2 border-t border-slate-100 pt-5">
              <Button variant="ghost" size="sm" onClick={() => go("/story")}>
                <BookOpen className="size-4" aria-hidden /> Product story
              </Button>
              <Button variant="ghost" size="sm" onClick={() => go("/dev/analytics")}>
                <BarChart3 className="size-4" aria-hidden /> Analytics
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-700 hover:bg-rose-50"
                onClick={() => {
                  actions.reset();
                  simulation.set({ networkFailure: false, uploadFailure: false, aiUnavailable: false });
                  toast({ tone: "success", title: "Journey reset" });
                  go("/");
                }}
              >
                <RotateCcw className="size-4" aria-hidden /> Reset everything
              </Button>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
