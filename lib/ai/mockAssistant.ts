/**
 * Demo-mode Loan Assistant.
 *
 * Used when no AI API key is configured (or the live model fails). Answers
 * common questions with predefined, compliance-safe responses, personalised
 * with the customer's own journey figures where helpful. It follows the same
 * rules as the live assistant: no guarantees, no invented rates or policies.
 */
import { formatINR } from "@/lib/format";
import { getDocumentChecklist } from "@/services/documentService";
import type { AssistantContext } from "./context";

interface Intent {
  id: string;
  match: RegExp;
  reply: (ctx: AssistantContext) => string;
}

const hasEstimate = (ctx: AssistantContext) => ctx.eligibility?.status === "estimated";

const INTENTS: Intent[] = [
  {
    id: "guarantee",
    match: /(guarantee|\bsure\b|definitely|confirm(ed)?|approved|approval|sanction|is this (an )?(offer|approval)|will i get)/i,
    reply: () =>
      "I can't confirm approval — and nobody should at this stage. What you see here is an indicative estimate based on the details you entered. The final decision, amount and terms come from the lender after document verification and credit assessment.\n\nWhat the estimate does tell you is whether it's worth taking the next step, and roughly what that step might look like.",
  },
  {
    id: "calc",
    match: /(how (is|was) (my |this |the )?(eligibility|estimate)|calculat|work(ed)? out|formula|how did you get)/i,
    reply: (ctx) => {
      const e = ctx.eligibility;
      if (e && e.status === "estimated") {
        return `Here's how this prototype worked out your indicative estimate:\n\n- Monthly income: ${formatINR(ctx.finances?.monthlyIncome)}\n- Up to ${e.obligationLimitPercent}% of income is treated as available for all repayments: ${formatINR(((ctx.finances?.monthlyIncome ?? 0) * e.obligationLimitPercent) / 100)}\n- Minus existing EMIs of ${formatINR(ctx.finances?.existingEmi)}\n- Leaves an estimated repayment capacity of ${formatINR(e.repaymentCapacity)} a month\n\nThat capacity, over ${e.tenureMonths} months at an illustrative ${e.illustrativeRatePercent}% p.a., supports up to about ${formatINR(e.eligibleAmount)}.\n\nThis is a simplified demo calculation, not the lender's credit model. The final assessment can differ.`;
      }
      return "In this prototype, the indicative estimate looks at three things:\n\n- Your average monthly income\n- How much already goes to existing EMIs\n- How long your business has been running\n\nWe work out how much of your income could reasonably go towards a new EMI (your repayment capacity), then what loan amount that EMI could support over your chosen tenure. It's a simplified, transparent estimate — the lender's final assessment also looks at credit history and verified documents.";
    },
  },
  {
    id: "variable_income",
    match: /(income (changes|varies|vary|fluctuat)|variable income|seasonal|irregular|not fixed|different every month|changes every month)/i,
    reply: () =>
      "Yes, variable income does not automatically prevent you from checking eligibility. Your income pattern and supporting financial information may be considered during assessment. Let's continue with your average monthly income.\n\nA simple way to work it out: add up what the business earned over the last 6–12 months and divide by the number of months. Bank statements later help show the pattern behind that average.",
  },
  {
    id: "existing_emi",
    match: /(existing emi|what (is|does) (an )?emi|emi mean|current (loan|emi)|obligation)/i,
    reply: (ctx) =>
      `An EMI (Equated Monthly Instalment) is the fixed amount you pay each month towards a loan. "Existing EMIs" means the total of all loan repayments you're already making — business loans, home, car or personal loans, and credit card EMIs.\n\nExisting repayments help us understand your current monthly obligations. The more of your income that already goes to EMIs, the less room there is for a new one.${ctx.finances?.existingEmi != null ? ` You've entered ${formatINR(ctx.finances.existingEmi)} a month.` : ""} If you have none, enter 0.`,
  },
  {
    id: "amount_advice",
    match: /(what (loan )?amount|how much should i|how much (can|could) i|consider borrowing|right amount)/i,
    reply: (ctx) => {
      if (hasEstimate(ctx)) {
        const e = ctx.eligibility!;
        return `Your indicative estimate is up to ${formatINR(e.eligibleAmount)} over ${e.tenureMonths} months. A useful rule of thumb is to borrow what the business actually needs, not the maximum — every rupee borrowed adds interest.\n\nAsk yourself: what will the money be used for, and will it generate enough to comfortably cover an EMI of around ${formatINR(e.estimatedEmi)}?`;
      }
      return "Start with what the business actually needs — stock, equipment, working capital — rather than the most you might get. Borrowing less keeps your EMI and total interest lower.\n\nOnce you enter your income and existing EMIs, I can show you an indicative range so you can see how different amounts would feel month to month.";
    },
  },
  {
    id: "lower_than_asked",
    match: /(lower than|less than (i|what i) (asked|requested)|why (is|was) (my )?(estimate|amount) (lower|less|reduced))/i,
    reply: (ctx) => {
      const e = ctx.eligibility;
      if (e && e.status === "estimated" && e.eligibleAmount < (ctx.finances?.requestedAmount ?? 0)) {
        return `You asked for ${formatINR(ctx.finances?.requestedAmount)}, but an EMI for that amount over ${e.tenureMonths} months would be more than your estimated repayment capacity of ${formatINR(e.repaymentCapacity)} a month.\n\nTwo things usually help: a longer tenure (lower EMI, more interest overall) or reducing existing EMIs before you apply. The loan options screen shows a longer-tenure option you can compare.`;
      }
      return "Your estimate depends on how much of your monthly income is free after existing EMIs. If the EMI for the amount you asked for is higher than that, the estimate comes down. A longer tenure or fewer existing obligations usually increases it.";
    },
  },
  {
    id: "improve",
    match: /(improve|increase|higher (amount|eligibility)|get more)/i,
    reply: () =>
      "Things that typically help:\n\n- Closing or reducing existing EMIs, so more income is free for a new repayment\n- Choosing a longer tenure, which lowers the EMI (but increases total interest)\n- Showing consistent income through bank statements and ITRs\n- Paying existing EMIs and cards on time, which supports your credit history\n\nI can't tell you how a specific lender will weigh each of these — that depends on their assessment.",
  },
  {
    id: "business_type",
    match: /(business type|sole proprietor|proprietor|partnership|private limited|pvt|which type|freelanc|self.?employed professional)/i,
    reply: () =>
      "Choose the option that matches how your business is legally set up:\n\n- Sole Proprietor: you own and run it yourself (most small shops and traders)\n- Partnership: two or more partners, including LLPs\n- Private Limited: a registered company with directors\n- Other: freelancers, consultants and professional practices\n\nIt mainly affects which registration documents may be asked for later.",
  },
  {
    id: "which_option",
    match: /(which option|best option|option (fits|suits)|choose|compare|recommend)/i,
    reply: (ctx) => {
      if (ctx.options?.length) {
        const lines = ctx.options.map(
          (o) => `- ${o.label}: ${formatINR(o.amount)} over ${o.tenureMonths} months — about ${formatINR(o.emi)}/month, ${formatINR(o.totalInterest)} total interest, ${o.capacityUsedPercent}% of your repayment capacity`,
        );
        return `Here's how your illustrative options compare:\n\n${lines.join("\n")}\n\nA lower EMI gives your business more breathing room each month; a shorter tenure costs less overall. I can't choose for you, but a good question is: which EMI could you still pay in a slow month?`;
      }
      return "Each option trades off three things: the amount, the monthly EMI and the total interest. Longer tenures lower the EMI but cost more overall. Once you have your indicative estimate, I can compare the options side by side for you.";
    },
  },
  {
    id: "tenure",
    match: /(tenure|longer|shorter|how many months|repayment period)/i,
    reply: () =>
      "Tenure is how long you take to repay. A longer tenure means a smaller EMI each month but more interest in total; a shorter tenure means a higher EMI but less interest overall.\n\nFor a business with uneven cash flow, some people prefer a slightly longer tenure so a slow month doesn't strain repayments — but it's a trade-off only you can weigh.",
  },
  {
    id: "rate",
    match: /(interest rate|rate of interest|\broi\b|what rate|apr|processing fee|charges|fees)/i,
    reply: (ctx) =>
      `I can't quote an interest rate or fees — those are set by the lender after assessing your application, and they're shared with you in the final terms before you accept anything.\n\nTo show example EMIs, this prototype uses an illustrative rate of ${ctx.eligibility?.illustrativeRatePercent ?? 14}% p.a. It is not an offer or a quoted rate.`,
  },
  {
    id: "total_interest",
    match: /(total interest|total (cost|repay)|how much will i pay)/i,
    reply: () =>
      "Total interest is the extra you pay on top of the amount borrowed over the full tenure. It's EMI × number of months, minus the loan amount. The options screen shows it for each configuration so you can see the real cost of a longer tenure — all calculated with the prototype's illustrative rate.",
  },
  {
    id: "bank_statement",
    match: /(bank statement|statement)/i,
    reply: () =>
      "Bank statements can help verify income and understand cash flow. The exact documents required may depend on your profile and the lender's process.\n\nA PDF downloaded from net banking for your main business account usually works best, as it's easy to read and verify.",
  },
  {
    id: "change_amount",
    match: /(change (my )?(loan )?amount|edit (the )?amount|change (the )?tenure)/i,
    reply: () =>
      "You can change the amount or tenure in the Loan details section of your application. The illustrative EMI updates as you go, and if the amount is above your indicative estimate we'll flag it so there are no surprises. The final amount is always decided by the lender.",
  },
  {
    id: "upload_later",
    match: /(all (the )?documents now|upload later|later.*upload|don'?t have (all|a|the|my)|missing (a )?document)/i,
    reply: () =>
      "You don't have to upload everything right now. You can submit your application and add the remaining documents later from the status page. Verification can only be completed once the required documents are in, so uploading them sooner usually means fewer delays.",
  },
  {
    id: "more_docs",
    match: /(more|additional|extra|other) documents? (are |is )?(needed|required|asked)/i,
    reply: () =>
      "If the lender needs anything else, you'll be told what it is and why, and you can upload it from the status page. Needing an extra document is common and doesn't mean something is wrong with your application.",
  },
  {
    id: "action_needed",
    match: /(do i (need|have) to do|anything (i need|now|from me)|action (needed|required))/i,
    reply: (ctx) => {
      const pending = ctx.documents?.filter((d) => d.requirement === "required" && d.status !== "uploaded") ?? [];
      if (pending.length) return `One thing would help: ${pending.length} required document${pending.length > 1 ? "s are" : " is"} still missing (${pending.map((d) => d.name).join(", ")}). You can upload ${pending.length > 1 ? "them" : "it"} from the status page. Otherwise, nothing is needed unless you're contacted.`;
      return "Nothing right now. Your documents are with the team, and you'll be contacted if anything else is needed. You can check progress on the status page any time.";
    },
  },
  {
    id: "pdf",
    match: /(pdf|format|file type|jpg|png|photo|scan|file size|upload)/i,
    reply: () =>
      "Yes — you can upload PDF, JPG or PNG files up to 5 MB each. A clear PDF from net banking or a well-lit photo where all four corners are visible works well.\n\nIn this prototype, files aren't actually sent anywhere — we only use the file name and size to show the upload.",
  },
  {
    id: "gst",
    match: /(gst|not registered|itr|income tax return|tax return)/i,
    reply: () =>
      "GST documents and ITRs are marked as \"potentially required\" because they depend on your situation — for example, GST documents usually only apply if your business is GST-registered. Not having them doesn't stop you from checking eligibility or applying.\n\nIf the lender needs something else during verification, they'll tell you.",
  },
  {
    id: "pan",
    match: /(\bpan\b|aadhaar|kyc|identity|id proof)/i,
    reply: () =>
      "Your PAN helps confirm your identity and, with your consent at the application stage, lets the lender check your credit history. A KYC document (Aadhaar, passport, voter ID or driving licence) is needed because regulated lenders must verify who you are before lending.\n\nPlease don't type ID numbers into this chat — upload documents on the documents screen instead.",
  },
  {
    id: "documents",
    match: /(document|papers|what do i need|need to upload|checklist)/i,
    reply: (ctx) => {
      const docs = ctx.documents;
      if (docs?.length) {
        const req = docs.filter((d) => d.requirement === "required");
        const done = req.filter((d) => d.status === "uploaded").length;
        return `You'll most likely need:\n\n${req.map((d) => `- ${d.name}${d.status === "uploaded" ? " (uploaded)" : ""}`).join("\n")}\n\nYou've uploaded ${done} of ${req.length}. GST documents, ITRs and business registration proof may also be requested depending on your business. Each card on this page explains why a document is needed.`;
      }
      return "You'll most likely need:\n\n- PAN card\n- An identity/KYC document\n- Recent bank statements (about 6 months)\n- Business or income proof\n\nGST documents, ITRs and business registration proof may also be requested depending on your business. You don't need any of these to check your eligibility.";
    },
  },
  {
    id: "credit_score",
    match: /(credit score|cibil|affect my (score|credit)|hard (enquiry|inquiry)|credit report)/i,
    reply: () =>
      "Checking your indicative eligibility here doesn't involve a credit bureau check — it only uses the information you enter, so it doesn't affect your credit score.\n\nA credit check happens only if you choose to submit an application, and you're asked for consent before that.",
  },
  {
    id: "vintage",
    match: /(how long.*business|vintage|years in business|new business|just started|less than (a|1) year)/i,
    reply: () =>
      "How long your business has been running helps indicate how stable its income is over time. In this prototype, a longer trading history allows a slightly larger share of income towards repayments.\n\nIf your business is less than a year old, the prototype can't show an online estimate yet — that's a design choice for this demo, not a statement of any lender's policy.",
  },
  {
    id: "mobile",
    match: /(mobile|phone|email|contact|why.*(number|details))/i,
    reply: () =>
      "Your mobile number and email are used to send you updates about your application and to reach you if the lender needs anything else. They aren't used for your eligibility estimate.",
  },
  {
    id: "save",
    match: /(save|come back|finish later|continue later|resume)/i,
    reply: () =>
      "Yes. Use \"Save & Come Back Later\" on the application screen. In this prototype, your progress is saved on this device, so you can pick up where you left off.",
  },
  {
    id: "commitment",
    match: /(commit|obligat(ed|ion) to (borrow|accept)|cancel|withdraw|change.*after submit)/i,
    reply: () =>
      "Submitting an application isn't a commitment to borrow. If the lender approves it, you'll see the final amount, rate and terms, and you decide whether to accept them. If you need to change details after submitting, the lender's team can help during verification.",
  },
  {
    id: "verification_time",
    match: /(how long|timeline|when will|how many days|verification take)/i,
    reply: (ctx) =>
      `Timelines vary by lender and by how complete the documents are, so I can't give you an exact number of days. You can track each stage on the status page${ctx.application ? ` for ${ctx.application.reference}` : ""}, and you'll be told if anything else is needed.\n\nUploading all required documents clearly is the single biggest thing that avoids delays.`,
  },
  {
    id: "credit_assessment",
    match: /(credit assessment|assess|underwrit)/i,
    reply: () =>
      "Credit assessment is when the lender reviews your application in detail: your verified income and cash flow, existing repayments, and credit history. It's how they decide whether to lend, how much, and on what terms. The indicative estimate you saw earlier is a simplified preview — this step is the real assessment.",
  },
  {
    id: "next",
    match: /(what happens (next|after)|after (i )?(apply|submit)|next step|process)/i,
    reply: (ctx) => {
      const base =
        "Your application typically moves through document verification, credit assessment and a final decision. If additional information is required, you'll be informed.";
      if (ctx.application) return `${base}\n\nRight now, ${ctx.application.reference} is at "${ctx.application.stageLabel}". You don't need to do anything unless you're contacted.`;
      return `${base}\n\nIf approved, you'll see the final terms before you accept anything, and disbursement happens after you sign.`;
    },
  },
  {
    id: "status",
    match: /(status|where is my|track)/i,
    reply: (ctx) =>
      ctx.application
        ? `Your application ${ctx.application.reference} is currently at "${ctx.application.stageLabel}". The status page shows each stage, and you'll be told if anything else is needed.`
        : "You haven't submitted an application on this device yet. Once you do, the status page shows each stage — from document verification to decision.",
  },
  {
    id: "privacy",
    match: /(safe|secure|privacy|data|share my|confidential)/i,
    reply: () =>
      "Your details are used only to estimate eligibility and process your application. We ask for the minimum needed at each step — no ID numbers or documents are needed just to check eligibility.\n\nThis is a prototype: nothing is sent to a lender, and uploaded files never leave your device.",
  },
  {
    id: "how_it_works",
    match: /(how does (this|it|the eligibility check) work|how it works|what is loanwise)/i,
    reply: () =>
      "Three steps:\n\n1. Tell us about your business and finances — about 2 minutes, no documents needed\n2. See an indicative estimate and illustrative loan options, with the calculation shown\n3. Apply only if you're ready, with a clear document checklist\n\nNothing is final until the lender assesses your application.",
  },
  {
    id: "greeting",
    match: /^(hi|hello|hey|namaste|hii+)\b/i,
    reply: () => "Hello! I can help with eligibility, loan terms, documents or what happens after you apply. What would you like to know?",
  },
];

/** "Why do you need my X?" — answer from the same checklist the documents screen uses. */
function documentReason(question: string): string | null {
  if (!/why (do|would) you need|why is .* (needed|required)|what is .* for/i.test(question)) return null;
  const q = question.toLowerCase();
  const doc = getDocumentChecklist().find((d) => d.id !== "bank_statement" && q.includes(d.name.toLowerCase()));
  if (!doc) return null;
  return `${doc.why}

What usually works: ${doc.examples}.${doc.appliesWhen ? ` ${doc.appliesWhen}` : ""}

The exact documents required may depend on your profile and the lender's process.`;
}

export function mockReply(question: string, ctx: AssistantContext): string {
  const docAnswer = documentReason(question);
  if (docAnswer) return docAnswer;
  const intent = INTENTS.find((i) => i.match.test(question));
  if (intent) return intent.reply(ctx);
  return "I don't have specific information on that in this prototype, and I'd rather not guess. I can help with:\n\n- How your indicative eligibility is calculated\n- What loan terms like EMI and tenure mean\n- Which documents you'll likely need and why\n- What happens after you apply\n\nFor anything specific to the lender's policies, their team can help once you apply.";
}
