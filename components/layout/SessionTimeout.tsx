"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Clock } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { onSessionTimeout } from "@/lib/simulation";

const JOURNEY_PREFIXES = ["/eligibility", "/options", "/documents", "/apply", "/review"];
const IDLE_MS = 15 * 60 * 1000;

/**
 * Pauses the session after 15 minutes of inactivity on journey screens.
 * Progress is kept, so timing out never costs the customer their work.
 */
export function SessionTimeout() {
  const pathname = usePathname();
  const [timedOut, setTimedOut] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inJourney = JOURNEY_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => onSessionTimeout(() => setTimedOut(true)), []);

  useEffect(() => {
    if (!inJourney) return;
    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setTimedOut(true), IDLE_MS);
    };
    const events = ["pointerdown", "keydown", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [inJourney]);

  return (
    <Dialog open={timedOut} onOpenChange={setTimedOut}>
      <DialogContent title="Your session timed out" hideClose>
        <div className="flex gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Clock className="size-5" aria-hidden />
          </span>
          <div className="space-y-2 text-[15px] leading-relaxed text-slate-600">
            <p>For your security, we pause your session after 15 minutes of inactivity.</p>
            <p className="font-medium text-slate-800">Don&apos;t worry — your progress is saved on this device.</p>
          </div>
        </div>
        <Button className="mt-6 w-full" onClick={() => setTimedOut(false)}>
          Continue where I left off
        </Button>
      </DialogContent>
    </Dialog>
  );
}
