import type { FinancialInfo, PersonalDetails } from "./types";

export type FinanceErrors = Partial<Record<keyof FinancialInfo, string>>;
export type PersonalErrors = Partial<Record<keyof PersonalDetails, string>>;

export function validateFinances(f: FinancialInfo): FinanceErrors {
  const e: FinanceErrors = {};
  if (f.monthlyIncome == null) e.monthlyIncome = "Please enter your average monthly income.";
  else if (f.monthlyIncome < 5000) e.monthlyIncome = "Please enter a monthly income of at least ₹5,000. Use your average take-home from the business.";
  else if (f.monthlyIncome > 1_00_00_000) e.monthlyIncome = "That looks too high for a monthly figure. Please enter income per month, not per year.";

  if (f.existingEmi == null) e.existingEmi = "Please enter your existing EMIs. Enter 0 if you have none.";
  else if (f.monthlyIncome != null && f.existingEmi >= f.monthlyIncome) e.existingEmi = "Existing EMIs can't be equal to or more than your monthly income. Please check both figures.";

  if (f.requestedAmount == null) e.requestedAmount = "Please enter the loan amount you're considering.";
  else if (f.requestedAmount < 50_000) e.requestedAmount = "The minimum amount for this estimate is ₹50,000.";
  else if (f.requestedAmount > 5_00_00_000) e.requestedAmount = "Please enter an amount up to ₹5 crore.";

  if (!f.tenureMonths) e.tenureMonths = "Please choose a preferred tenure.";
  return e;
}

/** Indian mobile: 10 digits starting 6–9, optional +91 / 0 prefix. */
export function normaliseMobile(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function validatePersonal(p: PersonalDetails): PersonalErrors {
  const e: PersonalErrors = {};
  const name = p.fullName.trim();
  if (!name) e.fullName = "Please enter your full name.";
  else if (name.length < 3 || !/^[\p{L} .'-]+$/u.test(name)) e.fullName = "Please enter your name as it appears on your PAN (letters only).";

  const mobile = normaliseMobile(p.mobile);
  if (!p.mobile.trim()) e.mobile = "Please enter your mobile number.";
  else if (!/^[6-9]\d{9}$/.test(mobile)) e.mobile = "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.";

  if (!p.email.trim()) e.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email.trim())) e.email = "Please enter a valid email address, like name@example.com.";
  return e;
}
