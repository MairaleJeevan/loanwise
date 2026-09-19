export type BusinessType = "sole_proprietor" | "partnership" | "private_limited" | "other";
export type BusinessVintage = "lt1" | "1to3" | "3to5" | "5plus";

export interface BusinessProfile {
  businessType: BusinessType | null;
  vintage: BusinessVintage | null;
  location: string;
  industry: string;
}

export interface FinancialInfo {
  monthlyIncome: number | null;
  existingEmi: number | null;
  requestedAmount: number | null;
  tenureMonths: number | null;
}

export type EligibilityStatus = "estimated" | "unable_to_estimate" | "not_eligible_now";

export interface EligibilityResult {
  status: EligibilityStatus;
  /** Indicative maximum for the preferred tenure. 0 when not estimated. */
  eligibleAmount: number;
  /** Indicative maximum at the longest illustrative tenure. */
  maxAmountLongestTenure: number;
  requestedAmount: number;
  /** min(requested, eligible) — what we base the illustrative EMI on. */
  suggestedAmount: number;
  tenureMonths: number;
  estimatedEmi: number;
  monthlyIncome: number;
  existingEmi: number;
  /** Share of income the demo model allows for all repayments (FOIR). */
  obligationLimitPercent: number;
  repaymentCapacity: number;
  illustrativeRatePercent: number;
  reasons: string[];
  calculatedAt: string;
}

export interface LoanOption {
  id: string;
  label: string;
  description: string;
  amount: number;
  tenureMonths: number;
  emi: number;
  totalInterest: number;
  totalRepayable: number;
  capacityUsedPercent: number;
  tag?: string;
}

export type DocStatus = "not_uploaded" | "uploading" | "uploaded" | "failed";

export interface DocumentState {
  id: string;
  status: DocStatus;
  fileName?: string;
  fileSize?: number;
  progress?: number;
  error?: string;
  uploadedAt?: string;
}

export interface PersonalDetails {
  fullName: string;
  mobile: string;
  email: string;
}

export interface ApplicationDetails {
  personal: PersonalDetails;
  businessName: string;
}

export type ApplicationStage =
  | "submitted"
  | "document_verification"
  | "credit_assessment"
  | "decision"
  | "disbursement";

export interface SubmittedApplication {
  reference: string;
  submittedAt: string;
  stage: ApplicationStage;
  lastUpdated: string;
}

export type ChatMode = "live" | "demo" | "fallback" | "unavailable";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  mode?: ChatMode;
}

export interface JourneyState {
  version: 1;
  demoMode: boolean;
  business: BusinessProfile;
  finances: FinancialInfo;
  eligibility: EligibilityResult | null;
  loanOptions: LoanOption[];
  selectedOptionId: string | null;
  documents: Record<string, DocumentState>;
  application: ApplicationDetails;
  applicationSavedAt: string | null;
  submitted: SubmittedApplication | null;
  chat: ChatMessage[];
  lastPath: string | null;
  updatedAt: string | null;
}
