import type { ApplicationStage, BusinessType, BusinessVintage } from "./types";

export const BUSINESS_TYPES: { value: BusinessType; label: string; hint: string }[] = [
  { value: "sole_proprietor", label: "Sole Proprietor", hint: "You own and run the business yourself" },
  { value: "partnership", label: "Partnership", hint: "Two or more partners, including LLPs" },
  { value: "private_limited", label: "Private Limited", hint: "Registered company with directors" },
  { value: "other", label: "Other", hint: "Freelancer, professional practice or anything else" },
];

export const VINTAGES: { value: BusinessVintage; label: string }[] = [
  { value: "lt1", label: "Less than 1 year" },
  { value: "1to3", label: "1–3 years" },
  { value: "3to5", label: "3–5 years" },
  { value: "5plus", label: "5+ years" },
];

export const INDUSTRIES = [
  "Retail & trading",
  "Wholesale & distribution",
  "Manufacturing",
  "Services",
  "Professional practice (CA, doctor, architect…)",
  "Food & hospitality",
  "Transport & logistics",
  "Construction & contracting",
  "Healthcare & pharmacy",
  "Education & coaching",
  "Agri-allied business",
  "Other",
];

export const CITIES = [
  "Mumbai", "Pune", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad",
  "Surat", "Jaipur", "Lucknow", "Indore", "Nagpur", "Nashik", "Coimbatore", "Kochi", "Chandigarh",
  "Bhopal", "Vadodara", "Ludhiana", "Rajkot", "Thane", "Navi Mumbai", "Visakhapatnam", "Patna",
];

export const TENURES = [12, 24, 36, 48, 60];

export const labelFor = {
  businessType: (v: BusinessType | null) => BUSINESS_TYPES.find((b) => b.value === v)?.label ?? "—",
  vintage: (v: BusinessVintage | null) => VINTAGES.find((b) => b.value === v)?.label ?? "—",
};

export const STAGES: { id: ApplicationStage; label: string; description: string }[] = [
  { id: "submitted", label: "Application submitted", description: "We've received your application and documents." },
  { id: "document_verification", label: "Document verification", description: "We check your documents are complete and readable, and match your details." },
  { id: "credit_assessment", label: "Credit assessment", description: "The lender reviews your income, repayments and credit history to assess the loan." },
  { id: "decision", label: "Decision", description: "You receive the lender's decision, with final amount, rate and terms if approved." },
  { id: "disbursement", label: "Disbursement", description: "After you accept the terms and sign the agreement, funds are transferred to your account." },
];

export const STAGE_ORDER = STAGES.map((s) => s.id);

export const STATUS_HEADLINE: Record<ApplicationStage, { title: string; message: string }> = {
  submitted: {
    title: "Application received",
    message: "Your application has been received and is queued for document verification.",
  },
  document_verification: {
    title: "Documents under verification",
    message: "We're reviewing the documents you provided. If anything else is required, we'll let you know.",
  },
  credit_assessment: {
    title: "Credit assessment in progress",
    message: "Your documents are verified. The lender is now assessing your application. No action is needed from you right now.",
  },
  decision: {
    title: "Decision shared",
    message: "The lender has shared a decision on your application. Review the final terms before you accept anything.",
  },
  disbursement: {
    title: "Disbursement in progress",
    message: "You've accepted the terms. Funds are being transferred to your registered bank account.",
  },
};
