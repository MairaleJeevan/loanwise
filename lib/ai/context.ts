/**
 * Builds the journey context the Loan Assistant receives.
 *
 * Privacy by design: the assistant gets what it needs to explain the
 * customer's situation (profile, figures, estimate, stage) — never their
 * name, mobile number, email, or any document contents.
 */
import { STAGES, labelFor } from "@/lib/journey/constants";
import type { JourneyState } from "@/lib/journey/types";
import { getDocumentChecklist } from "@/services/documentService";

export type AssistantPage =
  | "landing"
  | "business"
  | "finances"
  | "result"
  | "options"
  | "documents"
  | "application"
  | "review"
  | "submitted"
  | "status"
  | "other";

export interface AssistantContext {
  page: AssistantPage;
  pageTitle: string;
  business?: { businessType: string; vintage: string; industry?: string; location?: string };
  finances?: { monthlyIncome: number | null; existingEmi: number | null; requestedAmount: number | null; tenureMonths: number | null };
  eligibility?: {
    status: string;
    eligibleAmount: number;
    maxAmountLongestTenure: number;
    suggestedAmount: number;
    estimatedEmi: number;
    tenureMonths: number;
    repaymentCapacity: number;
    obligationLimitPercent: number;
    illustrativeRatePercent: number;
    reasons: string[];
  };
  options?: { label: string; amount: number; tenureMonths: number; emi: number; totalInterest: number; capacityUsedPercent: number }[];
  selectedOption?: { label: string; amount: number; tenureMonths: number; emi: number; totalInterest: number };
  documents?: { name: string; requirement: "required" | "maybe"; status: string }[];
  application?: { reference: string; stage: string; stageLabel: string; submittedAt: string };
}

export function pageFromPath(pathname: string): AssistantPage {
  if (pathname === "/") return "landing";
  if (pathname.startsWith("/eligibility/business")) return "business";
  if (pathname.startsWith("/eligibility/finances")) return "finances";
  if (pathname.startsWith("/eligibility/result")) return "result";
  if (pathname.startsWith("/options")) return "options";
  if (pathname.startsWith("/documents")) return "documents";
  if (pathname.startsWith("/apply")) return "application";
  if (pathname.startsWith("/review")) return "review";
  if (pathname.startsWith("/submitted")) return "submitted";
  if (pathname.startsWith("/status")) return "status";
  return "other";
}

export const PAGE_GUIDES: Record<AssistantPage, { title: string; suggestions: string[] }> = {
  landing: {
    title: "Getting started",
    suggestions: ["How does the eligibility check work?", "Will checking affect my credit score?", "What documents will I need?", "Is my information safe?"],
  },
  business: {
    title: "Your business",
    suggestions: ["Why do you ask how long I've been in business?", "Which business type should I choose?", "I'm a freelancer. Can I still apply?", "Will checking affect my credit score?"],
  },
  finances: {
    title: "Your finances",
    suggestions: ["How is eligibility calculated?", "My income changes every month. Can I still apply?", "What does existing EMI mean?", "What loan amount should I consider?"],
  },
  result: {
    title: "Your indicative estimate",
    suggestions: ["How was this estimate calculated?", "Why is my estimate lower than I asked for?", "Is this an approval?", "How can I improve my eligibility?"],
  },
  options: {
    title: "Loan options",
    suggestions: ["Which option fits me best?", "Is a longer tenure better?", "What is the interest rate?", "What does total interest mean?"],
  },
  documents: {
    title: "Documents",
    suggestions: ["Why do you need my bank statement?", "What documents do I need?", "Can I upload a PDF?", "I'm not GST-registered. Is that a problem?"],
  },
  application: {
    title: "Your application",
    suggestions: ["Why do you need my mobile number?", "Can I save and finish later?", "What if I change my loan amount?", "What happens after I submit?"],
  },
  review: {
    title: "Review",
    suggestions: ["What happens after I submit?", "Can I change details after submitting?", "Do I have to upload all documents now?", "Is submitting a commitment to borrow?"],
  },
  submitted: {
    title: "Application submitted",
    suggestions: ["What happens next?", "How long does verification take?", "What does credit assessment mean?", "Do I need to do anything now?"],
  },
  status: {
    title: "Application status",
    suggestions: ["What happens next?", "How long does verification take?", "What does credit assessment mean?", "What if more documents are needed?"],
  },
  other: {
    title: "LoanWise",
    suggestions: ["How does the eligibility check work?", "What documents will I need?", "What happens after I apply?"],
  },
};

export function buildAssistantContext(state: JourneyState, page: AssistantPage): AssistantContext {
  const ctx: AssistantContext = { page, pageTitle: PAGE_GUIDES[page].title };
  const { business, finances, eligibility } = state;

  if (business.businessType || business.vintage) {
    ctx.business = {
      businessType: labelFor.businessType(business.businessType),
      vintage: labelFor.vintage(business.vintage),
      industry: business.industry || undefined,
      location: business.location || undefined,
    };
  }
  if (finances.monthlyIncome != null || finances.requestedAmount != null) ctx.finances = { ...finances };
  if (eligibility) {
    ctx.eligibility = {
      status: eligibility.status,
      eligibleAmount: eligibility.eligibleAmount,
      maxAmountLongestTenure: eligibility.maxAmountLongestTenure,
      suggestedAmount: eligibility.suggestedAmount,
      estimatedEmi: eligibility.estimatedEmi,
      tenureMonths: eligibility.tenureMonths,
      repaymentCapacity: eligibility.repaymentCapacity,
      obligationLimitPercent: eligibility.obligationLimitPercent,
      illustrativeRatePercent: eligibility.illustrativeRatePercent,
      reasons: eligibility.reasons,
    };
  }
  if (state.loanOptions.length) {
    ctx.options = state.loanOptions.map(({ label, amount, tenureMonths, emi, totalInterest, capacityUsedPercent }) => ({
      label, amount, tenureMonths, emi, totalInterest, capacityUsedPercent,
    }));
  }
  const selected = state.loanOptions.find((o) => o.id === state.selectedOptionId);
  if (selected) {
    ctx.selectedOption = { label: selected.label, amount: selected.amount, tenureMonths: selected.tenureMonths, emi: selected.emi, totalInterest: selected.totalInterest };
  }
  if (["documents", "application", "review", "submitted", "status"].includes(page) || Object.keys(state.documents).length) {
    ctx.documents = getDocumentChecklist(business).map((d) => ({
      name: d.name,
      requirement: d.requirement,
      status: state.documents[d.id]?.status ?? "not_uploaded",
    }));
  }
  if (state.submitted) {
    ctx.application = {
      reference: state.submitted.reference,
      stage: state.submitted.stage,
      stageLabel: STAGES.find((s) => s.id === state.submitted!.stage)?.label ?? state.submitted.stage,
      submittedAt: state.submitted.submittedAt,
    };
  }
  return ctx;
}

/** Opening line for each page — tells the customer what the assistant can help with *here*. */
export function greetingFor(ctx: AssistantContext): string {
  switch (ctx.page) {
    case "business":
      return "Hi, I'm Loan Assistant. I can explain why we ask about your business and how it's used in your indicative estimate. What would you like to know?";
    case "finances":
      return "I can help you understand how income and existing EMIs affect your indicative eligibility. Ask me anything about the numbers on this page.";
    case "result":
      return ctx.eligibility?.status === "estimated"
        ? "I can walk you through how your indicative estimate was worked out, and what it does and doesn't mean."
        : "I can explain why we couldn't show an online estimate and what options you have from here.";
    case "options":
      return "Not sure which option fits? I can compare the EMI, tenure and total interest of each one with you. I can't choose for you, but I can make the trade-offs clear.";
    case "documents":
      return "I can explain what each document is for, which formats work, and what to do if you don't have something.";
    case "application":
      return "I can explain why we ask for each detail and what happens once you submit.";
    case "review":
      return "Before you submit, I can explain what happens next and what submitting does and doesn't commit you to.";
    case "submitted":
    case "status":
      return ctx.application
        ? `Your application ${ctx.application.reference} is at "${ctx.application.stageLabel}". I can explain what that stage means and what usually comes next.`
        : "I can explain how applications move from verification to a decision.";
    default:
      return "Hi, I'm Loan Assistant. I can help you understand eligibility, documents, loan terms and what happens after you apply.";
  }
}
