import type { ApplicationDetails, BusinessProfile, FinancialInfo } from "./types";

/** Fictional sample customer for presentations. Not a real person. */
export const DEMO_CUSTOMER: {
  business: BusinessProfile;
  finances: FinancialInfo;
  application: ApplicationDetails;
} = {
  business: {
    businessType: "sole_proprietor",
    vintage: "5plus",
    location: "Pune",
    industry: "Retail & trading",
  },
  finances: {
    monthlyIncome: 100000,
    existingEmi: 20000,
    requestedAmount: 800000,
    tenureMonths: 48,
  },
  application: {
    personal: {
      fullName: "Rahul Sharma",
      mobile: "9876543210",
      email: "rahul.sharma@example.com",
    },
    businessName: "Sharma Electricals",
  },
};

/** Alternative scenarios the presenter can load to show edge cases. */
export const DEMO_SCENARIOS = {
  highObligations: {
    label: "Existing EMIs too high",
    business: DEMO_CUSTOMER.business,
    finances: { monthlyIncome: 60000, existingEmi: 32000, requestedAmount: 500000, tenureMonths: 36 },
  },
  outsideRange: {
    label: "Large request (no online estimate)",
    business: { ...DEMO_CUSTOMER.business, businessType: "private_limited" as const },
    finances: { monthlyIncome: 900000, existingEmi: 100000, requestedAmount: 7500000, tenureMonths: 60 },
  },
};

export const DEMO_REFERENCE = "APP-2026-00124";
