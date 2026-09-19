"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AssistantProvider } from "@/components/assistant/AssistantProvider";
import { LoanAssistant } from "@/components/assistant/LoanAssistant";
import { AssistantLauncher } from "@/components/assistant/AskAssistantButton";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { ToastProvider } from "@/components/ui/toast";
import { JourneyProvider, useJourney } from "@/lib/journey/store";
import { DemoPanel } from "./DemoPanel";
import { SessionTimeout } from "./SessionTimeout";
import { SiteFooter } from "./SiteFooter";

const JOURNEY_PREFIXES = ["/eligibility", "/options", "/documents", "/apply", "/review", "/submitted"];

/** Remembers where the customer is so the landing page can offer "continue where you left off". */
function RouteTracker({ inJourney }: { inJourney: boolean }) {
  const pathname = usePathname();
  const { actions, hydrated } = useJourney();
  useEffect(() => {
    if (hydrated && inJourney && pathname !== "/submitted") actions.setLastPath(pathname);
  }, [pathname, inJourney, hydrated, actions]);
  return null;
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const inJourney = JOURNEY_PREFIXES.some((p) => pathname.startsWith(p));
  return (
    <ToastProvider>
      <JourneyProvider>
        <AssistantProvider>
          <RouteTracker inJourney={inJourney} />
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          {!inJourney && (
            <>
              <div className="pb-[72px] md:pb-0">
                <SiteFooter />
              </div>
              <MobileBottomNav />
            </>
          )}
          <AssistantLauncher />
          <LoanAssistant />
          <SessionTimeout />
          <DemoPanel />
        </AssistantProvider>
      </JourneyProvider>
    </ToastProvider>
  );
}
