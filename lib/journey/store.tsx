"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { calculateEmi } from "@/services/eligibilityService";
import { DEMO_CUSTOMER } from "./demoData";
import type {
  ApplicationDetails,
  ApplicationStage,
  BusinessProfile,
  ChatMessage,
  DocumentState,
  EligibilityResult,
  FinancialInfo,
  JourneyState,
  LoanOption,
  SubmittedApplication,
} from "./types";

const STORAGE_KEY = "loanwise.journey.v1";

export const initialJourney: JourneyState = {
  version: 1,
  demoMode: false,
  business: { businessType: null, vintage: null, location: "", industry: "" },
  finances: { monthlyIncome: null, existingEmi: null, requestedAmount: null, tenureMonths: null },
  eligibility: null,
  loanOptions: [],
  selectedOptionId: null,
  documents: {},
  application: { personal: { fullName: "", mobile: "", email: "" }, businessName: "" },
  applicationSavedAt: null,
  submitted: null,
  chat: [],
  lastPath: null,
  updatedAt: null,
};

interface JourneyActions {
  setBusiness: (patch: Partial<BusinessProfile>) => void;
  setFinances: (patch: Partial<FinancialInfo>) => void;
  setEligibility: (result: EligibilityResult, options: LoanOption[]) => void;
  selectOption: (id: string) => void;
  /** Used when the customer edits amount/tenure directly in the application. */
  setCustomLoan: (amount: number, tenureMonths: number) => void;
  setDocument: (id: string, patch: Partial<DocumentState>) => void;
  setApplication: (patch: Partial<ApplicationDetails>) => void;
  markSaved: (savedAt: string) => void;
  submit: (app: SubmittedApplication) => void;
  setStage: (stage: ApplicationStage) => void;
  addChat: (message: ChatMessage) => void;
  clearChat: () => void;
  setLastPath: (path: string) => void;
  loadDemo: () => void;
  loadScenario: (business: BusinessProfile, finances: FinancialInfo) => void;
  reset: () => void;
}

interface JourneyContextValue {
  state: JourneyState;
  hydrated: boolean;
  actions: JourneyActions;
  selectedOption: LoanOption | null;
}

const JourneyContext = createContext<JourneyContextValue | null>(null);

export function JourneyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<JourneyState>(initialJourney);
  const [hydrated, setHydrated] = useState(false);
  const skipFirstWrite = useRef(true);

  // Restore after mount so server and client render the same first frame.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as JourneyState;
        if (parsed.version === 1) {
          // Uploads can't survive a refresh — anything mid-upload becomes "failed" so the user can retry.
          const documents = Object.fromEntries(
            Object.entries(parsed.documents ?? {}).map(([k, d]) => [
              k,
              d.status === "uploading" ? { ...d, status: "failed" as const, progress: 0, error: "Upload was interrupted. Please try again." } : d,
            ]),
          );
          setState({ ...initialJourney, ...parsed, documents });
        }
      }
    } catch {
      /* corrupted or unavailable storage — start fresh */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipFirstWrite.current) {
      skipFirstWrite.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked — the journey keeps working in memory */
    }
  }, [state, hydrated]);

  const update = useCallback((fn: (s: JourneyState) => JourneyState) => {
    setState((s) => ({ ...fn(s), updatedAt: new Date().toISOString() }));
  }, []);

  const actions = useMemo<JourneyActions>(
    () => ({
      setBusiness: (patch) => update((s) => ({ ...s, business: { ...s.business, ...patch } })),
      setFinances: (patch) => update((s) => ({ ...s, finances: { ...s.finances, ...patch } })),
      setEligibility: (result, options) =>
        update((s) => {
          // Keep the customer's selection if an equivalent option still exists.
          const prev = s.loanOptions.find((o) => o.id === s.selectedOptionId);
          const keep = prev && options.find((o) => o.amount === prev.amount && o.tenureMonths === prev.tenureMonths);
          return { ...s, eligibility: result, loanOptions: options, selectedOptionId: keep ? keep.id : null };
        }),
      selectOption: (id) => update((s) => ({ ...s, selectedOptionId: id })),
      setCustomLoan: (amount, tenureMonths) =>
        update((s) => {
          const finances = { ...s.finances, requestedAmount: amount, tenureMonths };
          const others = s.loanOptions.filter((o) => o.id !== "custom");
          const match = others.find((o) => o.amount === amount && o.tenureMonths === tenureMonths);
          if (match) return { ...s, finances, loanOptions: others, selectedOptionId: match.id };
          const emi = calculateEmi(amount, tenureMonths);
          const capacity = s.eligibility?.repaymentCapacity ?? 0;
          const custom: LoanOption = {
            id: "custom",
            label: "Your choice",
            description: "The amount and tenure you set in your application.",
            amount,
            tenureMonths,
            emi,
            totalRepayable: emi * tenureMonths,
            totalInterest: emi * tenureMonths - amount,
            capacityUsedPercent: capacity ? Math.round((emi / capacity) * 100) : 0,
          };
          return { ...s, finances, loanOptions: [...others, custom], selectedOptionId: "custom" };
        }),
      setDocument: (id, patch) =>
        update((s) => ({ ...s, documents: { ...s.documents, [id]: { ...(s.documents[id] ?? { id, status: "not_uploaded" }), ...patch } } })),
      setApplication: (patch) =>
        update((s) => ({
          ...s,
          application: { ...s.application, ...patch, personal: { ...s.application.personal, ...(patch.personal ?? {}) } },
        })),
      markSaved: (savedAt) => update((s) => ({ ...s, applicationSavedAt: savedAt })),
      submit: (app) => update((s) => ({ ...s, submitted: app })),
      setStage: (stage) =>
        update((s) => (s.submitted ? { ...s, submitted: { ...s.submitted, stage, lastUpdated: new Date().toISOString() } } : s)),
      addChat: (message) => update((s) => ({ ...s, chat: [...s.chat, message].slice(-60) })),
      clearChat: () => update((s) => ({ ...s, chat: [] })),
      setLastPath: (path) => setState((s) => (s.lastPath === path ? s : { ...s, lastPath: path })),
      loadDemo: () =>
        update(() => ({
          ...initialJourney,
          demoMode: true,
          business: { ...DEMO_CUSTOMER.business },
          finances: { ...DEMO_CUSTOMER.finances },
          application: { ...DEMO_CUSTOMER.application, personal: { ...DEMO_CUSTOMER.application.personal } },
        })),
      loadScenario: (business, finances) =>
        update((s) => ({ ...initialJourney, demoMode: true, business: { ...business }, finances: { ...finances }, chat: s.chat })),
      reset: () => update(() => ({ ...initialJourney })),
    }),
    [update],
  );

  const selectedOption = state.loanOptions.find((o) => o.id === state.selectedOptionId) ?? null;

  const value = useMemo(() => ({ state, hydrated, actions, selectedOption }), [state, hydrated, actions, selectedOption]);
  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error("useJourney must be used within JourneyProvider");
  return ctx;
}
