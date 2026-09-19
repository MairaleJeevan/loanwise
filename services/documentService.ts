/**
 * Document service (mock).
 *
 * Nothing is uploaded anywhere. We read only the file's name, size and type
 * to validate it and simulate upload progress. File contents are never read,
 * stored or transmitted. A production version would request a pre-signed
 * URL from the lender's document store and upload directly to it.
 */
import type { BusinessProfile } from "@/lib/journey/types";
import { NetworkError, simulation } from "@/lib/simulation";
import { delay } from "@/lib/utils";

export interface DocumentDefinition {
  id: string;
  name: string;
  why: string;
  examples: string;
  requirement: "required" | "maybe";
  /** When a "maybe" document is likely to apply. */
  appliesWhen?: string;
}

export const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png";
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function getDocumentChecklist(business?: BusinessProfile): DocumentDefinition[] {
  const registrationHint =
    business?.businessType === "private_limited"
      ? "Likely needed for your business — for a private limited company this is usually the Certificate of Incorporation."
      : business?.businessType === "partnership"
        ? "Likely needed for your business — for a partnership this is usually the partnership deed."
        : "May be requested depending on how your business is set up.";

  return [
    {
      id: "pan",
      name: "PAN card",
      why: "Confirms your identity for tax purposes and lets the lender check your credit history — with your consent, at the application stage.",
      examples: "Your personal PAN card",
      requirement: "required",
    },
    {
      id: "kyc",
      name: "Identity / KYC document",
      why: "Regulated lenders must verify who you are and where you live (KYC) before lending.",
      examples: "Aadhaar, passport, voter ID or driving licence",
      requirement: "required",
    },
    {
      id: "bank_statement",
      name: "Recent bank statements",
      why: "Used to understand income and cash-flow patterns — especially useful when income varies month to month.",
      examples: "Last 6 months of your main business account, as a PDF from net banking",
      requirement: "required",
    },
    {
      id: "income_proof",
      name: "Business / income proof",
      why: "Shows that your business exists and is operating, which supports the income you've declared.",
      examples: "Udyam registration, shop & establishment licence, or trade licence",
      requirement: "required",
    },
    {
      id: "gst",
      name: "GST documents",
      why: "GST returns can support your business turnover figures.",
      examples: "GST registration certificate and recent returns",
      requirement: "maybe",
      appliesWhen: "Usually requested if your business is GST-registered.",
    },
    {
      id: "itr",
      name: "Income Tax Returns (ITR)",
      why: "Filed returns give a longer view of your income across years.",
      examples: "ITR acknowledgements for the last 1–2 years",
      requirement: "maybe",
      appliesWhen: "Often requested for larger loan amounts.",
    },
    {
      id: "registration",
      name: "Business registration proof",
      why: "Confirms the legal structure of your business and who is authorised to borrow for it.",
      examples: "Partnership deed, Certificate of Incorporation, or MOA/AOA",
      requirement: "maybe",
      appliesWhen: registrationHint,
    },
  ];
}

export class UploadError extends Error {}

export function validateFile(file: { name: string; size: number; type: string }) {
  const typeOk = ACCEPTED_TYPES.includes(file.type) || /\.(pdf|jpe?g|png)$/i.test(file.name);
  if (!typeOk) return "This file type isn't supported. Please upload a PDF, JPG or PNG.";
  if (file.size > MAX_FILE_BYTES) return "This file is larger than 5 MB. Try compressing it or uploading fewer pages.";
  if (file.size === 0) return "This file appears to be empty. Please choose another file.";
  return null;
}

export const documentService = {
  /**
   * Simulates an upload with progress callbacks. Only metadata is used.
   */
  async upload(
    file: { name: string; size: number; type: string },
    onProgress: (percent: number) => void,
  ): Promise<{ uploadedAt: string }> {
    const validationError = validateFile(file);
    if (validationError) {
      await delay(400);
      throw new UploadError(validationError);
    }
    for (const p of [12, 34, 58, 81]) {
      await delay(220);
      onProgress(p);
      if (p === 58 && simulation.get().uploadFailure) {
        throw new UploadError("The upload was interrupted. Your file wasn't saved — please try again.");
      }
    }
    if (simulation.consumeNetworkFailure()) throw new NetworkError("Upload failed because the connection dropped. Please try again.");
    await delay(250);
    onProgress(100);
    return { uploadedAt: new Date().toISOString() };
  },
};
