/**
 * Eligibility service (mock).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Demo-only illustrative calculation. Not a real credit decision.
 * ────────────────────────────────────────────────────────────────────────
 * This is NOT a lender underwriting model. It exists so the prototype can
 * show a transparent, explainable indicative estimate. A production version
 * would call the NBFC's eligibility API (bureau data, bank-statement
 * analysis, policy rules) behind the same `estimateEligibility` interface.
 */
import type {
  BusinessProfile,
  BusinessVintage,
  EligibilityResult,
  FinancialInfo,
  LoanOption,
} from "@/lib/journey/types";
import { NetworkError, simulation } from "@/lib/simulation";
import { delay } from "@/lib/utils";

/** Illustrative annual rate used ONLY to show example EMIs in this prototype. */
export const ILLUSTRATIVE_RATE_PERCENT = 14;

/**
 * Share of monthly income the demo model allows for ALL repayments
 * (existing EMIs + new EMI). Commonly called FOIR. Values are illustrative.
 */
const OBLIGATION_LIMIT_BY_VINTAGE: Record<BusinessVintage, number> = {
  lt1: 0,
  "1to3": 0.4,
  "3to5": 0.45,
  "5plus": 0.5,
};

/** Illustrative cap: indicative amount never exceeds 12× monthly income. */
const INCOME_MULTIPLE_CAP = 12;
const MIN_LOAN = 50_000;
const MAX_ONLINE_ESTIMATE = 50_00_000;
const MAX_ONLINE_INCOME = 25_00_000;
const LONGEST_TENURE = 60;

export function calculateEmi(principal: number, tenureMonths: number, annualRatePercent = ILLUSTRATIVE_RATE_PERCENT) {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  const r = annualRatePercent / 12 / 100;
  const factor = Math.pow(1 + r, tenureMonths);
  return Math.round((principal * r * factor) / (factor - 1));
}

/** Largest principal whose EMI fits within `emi` over `tenureMonths`. */
function principalForEmi(emi: number, tenureMonths: number, annualRatePercent = ILLUSTRATIVE_RATE_PERCENT) {
  if (emi <= 0) return 0;
  const r = annualRatePercent / 12 / 100;
  return (emi * (1 - Math.pow(1 + r, -tenureMonths))) / r;
}

const roundDown = (value: number, step = 10_000) => Math.max(0, Math.floor(value / step) * step);

export interface EligibilityInput {
  business: BusinessProfile;
  finances: FinancialInfo;
}

export class EligibilityInputError extends Error {}

export function calculateEligibility({ business, finances }: EligibilityInput): EligibilityResult {
  const { monthlyIncome, existingEmi, requestedAmount, tenureMonths } = finances;
  if (!business.vintage || monthlyIncome == null || existingEmi == null || requestedAmount == null || !tenureMonths) {
    throw new EligibilityInputError("Some information is missing. Please complete your business and financial details.");
  }

  const limit = OBLIGATION_LIMIT_BY_VINTAGE[business.vintage];
  const repaymentCapacity = Math.max(0, Math.round(monthlyIncome * limit - existingEmi));
  const base = {
    requestedAmount,
    tenureMonths,
    monthlyIncome,
    existingEmi,
    obligationLimitPercent: Math.round(limit * 100),
    repaymentCapacity,
    illustrativeRatePercent: ILLUSTRATIVE_RATE_PERCENT,
    calculatedAt: new Date().toISOString(),
  };
  const none = { eligibleAmount: 0, maxAmountLongestTenure: 0, suggestedAmount: 0, estimatedEmi: 0 };

  // Outside the range an online indicative estimate can responsibly cover.
  if (requestedAmount > MAX_ONLINE_ESTIMATE || monthlyIncome > MAX_ONLINE_INCOME) {
    return {
      ...base,
      ...none,
      status: "unable_to_estimate",
      reasons: [
        "Requests above ₹50 lakh, or very high monthly incomes, need a specialist to look at your business in more detail.",
        "We'd rather not show you a number we can't stand behind.",
      ],
    };
  }

  if (business.vintage === "lt1") {
    return {
      ...base,
      ...none,
      status: "not_eligible_now",
      reasons: [
        "In this prototype, online estimates are available for businesses that have been operating for at least 1 year.",
        "A longer trading history gives lenders more information about how your business performs over time.",
      ],
    };
  }

  const incomeCap = monthlyIncome * INCOME_MULTIPLE_CAP;
  const eligibleAmount = roundDown(Math.min(principalForEmi(repaymentCapacity, tenureMonths), incomeCap, MAX_ONLINE_ESTIMATE));
  const maxAmountLongestTenure = roundDown(
    Math.min(principalForEmi(repaymentCapacity, LONGEST_TENURE), incomeCap, MAX_ONLINE_ESTIMATE),
  );

  if (eligibleAmount < MIN_LOAN) {
    return {
      ...base,
      ...none,
      status: "not_eligible_now",
      reasons: [
        `Your existing EMIs of ₹${existingEmi.toLocaleString("en-IN")} already use most of the share of income that can go towards repayments.`,
        "Adding another EMI right now could stretch your monthly cash flow.",
      ],
    };
  }

  const suggestedAmount = Math.min(requestedAmount, eligibleAmount);
  return {
    ...base,
    status: "estimated",
    eligibleAmount,
    maxAmountLongestTenure,
    suggestedAmount,
    estimatedEmi: calculateEmi(suggestedAmount, tenureMonths),
    reasons:
      requestedAmount > eligibleAmount
        ? [`Your requested amount is higher than the indicative estimate for a ${tenureMonths}-month tenure.`]
        : [],
  };
}

/** Builds 3 illustrative configurations. Never real offers. */
export function buildLoanOptions(result: EligibilityResult): LoanOption[] {
  if (result.status !== "estimated") return [];
  const capacity = result.repaymentCapacity;

  const make = (id: string, label: string, description: string, amount: number, tenureMonths: number, tag?: string): LoanOption => {
    const emi = calculateEmi(amount, tenureMonths);
    const totalRepayable = emi * tenureMonths;
    return {
      id,
      label,
      description,
      amount,
      tenureMonths,
      emi,
      totalRepayable,
      totalInterest: totalRepayable - amount,
      capacityUsedPercent: Math.round((emi / capacity) * 100),
      tag,
    };
  };

  const fits = (amount: number, tenure: number) => calculateEmi(amount, tenure) <= capacity;

  const candidates: LoanOption[] = [];
  const comfortable = roundDown(Math.min(result.eligibleAmount * 0.6, result.suggestedAmount * 0.75), 25_000);
  if (comfortable >= MIN_LOAN && fits(comfortable, result.tenureMonths)) {
    candidates.push(
      make("comfortable", "Comfortable", "A smaller amount at the same tenure — a lighter EMI and less interest overall, leaving more cash free for your business.", comfortable, result.tenureMonths),
    );
  }
  candidates.push(
    make(
      "balanced",
      "Balanced",
      result.requestedAmount <= result.eligibleAmount
        ? "Your requested amount at your preferred tenure."
        : "The closest to your request that fits your indicative repayment capacity.",
      result.suggestedAmount,
      result.tenureMonths,
      "Closest to your request",
    ),
  );
  if (result.maxAmountLongestTenure > result.suggestedAmount && fits(result.maxAmountLongestTenure, LONGEST_TENURE)) {
    candidates.push(make("maximum", "Maximum", "The highest indicative amount, spread over a longer tenure. You pay more interest overall.", result.maxAmountLongestTenure, LONGEST_TENURE));
  } else if (result.tenureMonths < LONGEST_TENURE) {
    candidates.push(make("lower-emi", "Lowest EMI", "Your requested amount over a longer tenure for a lighter monthly payment.", result.suggestedAmount, LONGEST_TENURE));
  }
  if (candidates.length < 3 && result.tenureMonths > 12) {
    const shorterTenure = Math.max(12, result.tenureMonths - 12);
    if (fits(result.suggestedAmount, shorterTenure)) {
      candidates.push(make("faster", "Repay sooner", "Your requested amount over a shorter tenure — a higher EMI, but less interest overall.", result.suggestedAmount, shorterTenure));
    }
  }
  return candidates.slice(0, 3);
}

export const eligibilityService = {
  async estimateEligibility(input: EligibilityInput): Promise<{ result: EligibilityResult; options: LoanOption[] }> {
    await delay(900);
    if (simulation.consumeNetworkFailure()) throw new NetworkError();
    const result = calculateEligibility(input);
    return { result, options: buildLoanOptions(result) };
  },
};
