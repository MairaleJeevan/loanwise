import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Ban,
  BarChart3,
  Bot,
  Compass,
  Eye,
  FileQuestion,
  HandCoins,
  HelpCircle,
  Lightbulb,
  ListChecks,
  ShieldAlert,
  Target,
  Timer,
  User,
  Wrench,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Product story — LoanWise",
  description: "Problem, insight, decisions, AI, journey and measurement behind the LoanWise prototype.",
};

const SECTIONS = [
  { id: "problem", label: "Problem" },
  { id: "insight", label: "Insight" },
  { id: "decisions", label: "Decisions" },
  { id: "not-built", label: "Not built" },
  { id: "ai", label: "AI" },
  { id: "journey", label: "Journey" },
  { id: "metrics", label: "Metrics" },
  { id: "built", label: "How it was built" },
];

const BLOCKERS = [
  { icon: HelpCircle, title: "“Am I even eligible?”", body: "No way to know without filling a long form and sharing ID — so many don't start." },
  { icon: HandCoins, title: "“How much can I get?”", body: "No sense of amount or EMI until late in the process, so the effort feels like a gamble." },
  { icon: FileQuestion, title: "“What documents do they want — and why?”", body: "Unclear lists, no reasons. Self-employed documentation is messy, so people stall here." },
  { icon: Eye, title: "“What happens after I submit?”", body: "A black box. People fear spam calls, silent rejections and hidden credit checks." },
  { icon: ListChecks, title: "“This is a form, not help.”", body: "Forty fields up front, no explanations, no one to ask. It feels like the lender's process, not theirs." },
];

const DECISIONS = [
  ["Eligibility first, application second.", "Answer the customer's first question in ~2 minutes with no documents, no ID and no credit check. Only then ask them to apply."],
  ["Explain why information is needed.", "Every field and document has a one-line reason (“Why do we ask this?”). Trust comes from knowing what your data is for."],
  ["Show an indicative estimate early.", "A number with a range of options creates momentum — and qualifies the lead before the lender spends effort on it."],
  ["Make the maths transparent.", "Income → share for repayments → minus EMIs → capacity → amount. Shown on screen, so the estimate is explainable, not magic."],
  ["Options, not a single offer.", "Three illustrative configurations with EMI, total interest and % of capacity used. The customer chooses the trade-off."],
  ["AI as a contextual guide, not a gatekeeper.", "The assistant explains; it never decides. The estimate is deterministic and auditable, so the AI can't hallucinate a number."],
  ["Make the post-submission journey visible.", "A reference number, a five-stage timeline, and a clear “what we need from you” — so nobody is left wondering."],
  ["Keep the customer in control.", "Save and come back, edit anything, upload later, and no rejection dead-ends — every “not now” has a next step."],
];

const NOT_BUILT = [
  ["Credit bureau pull or OTP at the start", "It adds friction and anxiety before we've given the customer any value. It belongs at application."],
  ["Account creation before the estimate", "Asking someone to sign up before telling them anything is the drop-off we're trying to fix."],
  ["“Instant approval” / “100% approval” claims", "They erode trust and create compliance risk. We say “indicative” every time."],
  ["A chatbot-first journey", "Conversation is slow for structured data. The form stays the backbone; AI helps around it."],
  ["AI-driven credit decisions", "Lending decisions need auditable, policy-driven models — not a language model."],
  ["Multiple loan products and a comparison marketplace", "One clear journey for one audience beats breadth for a 48-hour prototype."],
  ["Document OCR and auto-extraction", "Valuable, but only after the core journey is proven. It's first on the next-steps list."],
];

const JOURNEY = [
  ["Landing", "/"],
  ["Business profile", "/eligibility/business"],
  ["Financial information", "/eligibility/finances"],
  ["Eligibility estimate", "/eligibility/result"],
  ["Loan options", "/options"],
  ["Document readiness", "/documents"],
  ["Application", "/apply"],
  ["Review & submit", "/review"],
  ["Submitted", "/submitted"],
  ["Application status", "/status"],
];

const METRICS = [
  {
    name: "Eligibility completion rate",
    def: "Customers who see an estimate ÷ customers who start the eligibility check.",
    why: "Tests whether “answers first” removes the first drop-off.",
    events: "eligibility_started → eligibility_result_viewed",
  },
  {
    name: "Qualified lead conversion rate",
    def: "Customers with a positive indicative estimate who go on to submit ÷ all customers who see an estimate.",
    why: "The business outcome: more of the right applicants, not just more leads.",
    events: "eligibility_result_viewed (estimated) → application_submitted",
  },
  {
    name: "Application start → submission",
    def: "Submitted applications ÷ applications started.",
    why: "Tests whether prefilled, explained, save-able forms get finished.",
    events: "application_started → application_submitted",
  },
  {
    name: "Document completion rate",
    def: "Applications with all likely-required documents uploaded within 7 days of starting.",
    why: "Documents are the slowest part for self-employed customers; this drives time-to-decision.",
    events: "document_started → document_completed",
  },
  {
    name: "Journey drop-off rate by step",
    def: "Share of customers who leave at each screen, compared with the current journey's baseline.",
    why: "Shows exactly where uncertainty still bites, so we know what to fix next.",
    events: "Step-to-step funnel across all journey events",
  },
];

function SectionHeading({ id, icon: Icon, kicker, title }: { id: string; icon: typeof Target; kicker: string; title: string }) {
  return (
    <div id={id} className="scroll-mt-24">
      <p className="flex items-center gap-2 text-[13px] font-semibold tracking-wider text-brand-700 uppercase">
        <Icon className="size-4" aria-hidden /> {kicker}
      </p>
      <h2 className="mt-2 text-[28px] leading-tight font-semibold tracking-tight text-slate-900 sm:text-[32px]">{title}</h2>
    </div>
  );
}

export default function StoryPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-5xl px-4 pt-12 pb-20 sm:px-6 sm:pt-16">
        <p className="text-[13px] font-semibold tracking-wider text-slate-500 uppercase">BOMBAYDC Product Builder Challenge</p>
        <h1 className="mt-3 max-w-3xl text-[36px] leading-[1.1] font-semibold tracking-tight text-slate-900 sm:text-[48px]">
          Reduce uncertainty <span className="text-brand-700">before</span> asking for commitment.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
          LoanWise is a digital loan-acquisition experience for self-employed customers of a mid-sized NBFC. Its proposition:{" "}
          <strong className="font-semibold text-slate-900">Know your eligibility. Understand your options. Apply with confidence.</strong>
        </p>

        <div className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-canvas p-4 text-[13.5px] sm:grid-cols-4">
          {[
            ["3 min", "Problem & thinking"],
            ["7 min", "Working product"],
            ["3 min", "Decisions & trade-offs"],
            ["2 min", "Metrics & next steps"],
          ].map(([t, l]) => (
            <div key={l} className="flex items-center gap-2.5">
              <Timer className="size-4 text-brand-600" aria-hidden />
              <span>
                <span className="font-semibold text-slate-900">{t}</span> <span className="text-slate-600">{l}</span>
              </span>
            </div>
          ))}
        </div>

        <nav aria-label="Story sections" className="sticky top-16 z-20 -mx-4 mt-8 overflow-x-auto border-y border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
          <ul className="flex gap-1 text-[13.5px] whitespace-nowrap">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="rounded-lg px-2.5 py-1.5 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Problem */}
        <section className="mt-16 space-y-8">
          <SectionHeading id="problem" icon={User} kicker="1 · Understanding the problem" title="A business owner who needs money — and certainty." />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-canvas p-6">
              <p className="font-semibold text-slate-900">Who is the user?</p>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                Self-employed owners of small businesses — shopkeepers, traders, small manufacturers, clinics, contractors. Income varies month to month,
                paperwork is uneven, time is scarce, and many have been rejected or spammed before.
              </p>
            </div>
            <div className="rounded-2xl bg-canvas p-6">
              <p className="font-semibold text-slate-900">What is their real job?</p>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                &ldquo;Get the right amount of money for my business, at an EMI I can manage — without wasting days on a process that might end in
                rejection.&rdquo; The loan is a means; confidence in the decision is the need.
              </p>
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-900">What stops them today</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {BLOCKERS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-2xl border border-slate-200 p-5">
                  <Icon className="size-5 text-rose-500" aria-hidden />
                  <p className="mt-3 font-medium text-slate-900">{title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <p className="flex items-center gap-2 font-semibold text-brand-950">
              <Target className="size-5" aria-hidden /> Business outcome we&apos;re improving
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-brand-900">
              More <strong>qualified</strong> leads — applicants who are likely to fit, arrive with the right documents and complete the application — and
              customers who feel confident taking the next step. Not simply more form starts.
            </p>
          </div>
        </section>

        {/* Insight */}
        <section className="mt-20">
          <SectionHeading id="insight" icon={Lightbulb} kicker="2 · The insight" title="Drop-off is an uncertainty problem, not a form-length problem." />
          <p className="mt-5 max-w-3xl text-[17px] leading-relaxed text-slate-600">
            Customers abandon because they&apos;re asked to commit — time, identity, a credit check — before they know whether it&apos;s worth it. Shortening
            the form helps a little. Answering their questions <em>before</em> asking for commitment changes the decision. So the product front-loads answers
            (eligibility, amount, documents, what happens next) and back-loads commitment.
          </p>
        </section>

        {/* Decisions */}
        <section className="mt-20">
          <SectionHeading id="decisions" icon={Compass} kicker="3 · Product idea & key decisions" title="Eight decisions that shape the experience" />
          <ol className="mt-8 grid gap-4 md:grid-cols-2">
            {DECISIONS.map(([t, d], i) => (
              <li key={t} className="flex gap-4 rounded-2xl border border-slate-200 p-5">
                <span className="text-lg font-semibold text-brand-600 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-semibold text-slate-900">{t}</p>
                  <p className="mt-1 text-[14.5px] leading-relaxed text-slate-600">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Not built */}
        <section className="mt-20">
          <SectionHeading id="not-built" icon={Ban} kicker="What we removed or deliberately didn't build" title="Judgment is also what you leave out" />
          <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200">
            {NOT_BUILT.map(([t, d]) => (
              <div key={t} className="grid gap-1 p-5 sm:grid-cols-[280px_1fr] sm:gap-6">
                <p className="font-medium text-slate-900">{t}</p>
                <p className="text-[14.5px] leading-relaxed text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AI */}
        <section className="mt-20">
          <SectionHeading id="ai" icon={Bot} kicker="4 · Where AI genuinely helps" title="AI explains. Rules decide." />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 p-6">
              <p className="font-semibold text-emerald-950">Where it helps</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14.5px] text-emerald-900">
                <li>Explaining the customer&apos;s own estimate and options</li>
                <li>&ldquo;Why do you need this?&rdquo; for any field or document</li>
                <li>Plain-language terms (EMI, FOIR, tenure)</li>
                <li>What each post-submission stage means</li>
                <li>Hindi / Hinglish answers without extra build</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-rose-50 p-6">
              <p className="font-semibold text-rose-950">Where it doesn&apos;t</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14.5px] text-rose-900">
                <li>Calculating the estimate (deterministic code)</li>
                <li>Approving, rejecting or promising anything</li>
                <li>Quoting rates, fees or timelines</li>
                <li>Collecting data (the form does that)</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-canvas p-6">
              <p className="flex items-center gap-2 font-semibold text-slate-900">
                <ShieldAlert className="size-4.5" aria-hidden /> Guardrails
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14.5px] text-slate-700">
                <li>System prompt forbids guarantees and invented policy</li>
                <li>Context excludes name, phone, email</li>
                <li>ID/account numbers blocked before sending</li>
                <li>Server-side key; demo mode without it</li>
                <li>Graceful &ldquo;unavailable&rdquo; state — journey never breaks</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Journey */}
        <section className="mt-20">
          <SectionHeading id="journey" icon={Compass} kicker="5 · The customer journey" title="From “Am I eligible?” to “I know where my application is.”" />
          <ol className="mt-8 flex flex-wrap items-center gap-2">
            {JOURNEY.map(([label, href], i) => (
              <li key={href} className="flex items-center gap-2">
                <Link href={href} className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[13.5px] font-medium text-slate-700 hover:border-brand-300 hover:text-brand-800">
                  {label}
                </Link>
                {i < JOURNEY.length - 1 && <ArrowRight className="size-3.5 text-slate-300" aria-hidden />}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-[14px] text-slate-500">Loan Assistant is available on every step, with suggestions specific to that step.</p>
        </section>

        {/* Metrics */}
        <section className="mt-20">
          <SectionHeading id="metrics" icon={BarChart3} kicker="6 · Success" title="Metrics we would measure after launch" />
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-slate-600">
            No results are shown here — this is a prototype. Each metric is already instrumented as events (see the{" "}
            <Link href="/dev/analytics" className="font-medium text-brand-700 hover:underline">
              analytics view
            </Link>
            ) and would be compared with the current journey in an A/B test.
          </p>
          <div className="mt-8 space-y-3">
            {METRICS.map((m, i) => (
              <div key={m.name} className="grid gap-3 rounded-2xl border border-slate-200 p-5 md:grid-cols-[260px_1fr_1fr] md:gap-6">
                <p className="font-semibold text-slate-900">
                  <span className="mr-2 text-brand-600 tabular-nums">{i + 1}.</span>
                  {m.name}
                </p>
                <div className="text-[14px] leading-relaxed text-slate-600">
                  <p>{m.def}</p>
                  <p className="mt-1.5 font-mono text-[12px] text-slate-500">{m.events}</p>
                </div>
                <p className="text-[14px] leading-relaxed text-slate-600">
                  <span className="font-medium text-slate-800">Why: </span>
                  {m.why}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[14px] text-slate-500">
            Guardrails: gap between indicative estimate and final sanctioned amount (trust), and complaint rate about unexpected calls or credit checks.
          </p>
        </section>

        {/* How it was built */}
        <section className="mt-20">
          <SectionHeading id="built" icon={Wrench} kicker="How it was built" title="Tools, trade-offs and what's next" />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-6">
              <p className="font-semibold text-slate-900">Stack</p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">
                Next.js, TypeScript, Tailwind CSS, Radix primitives, Lucide icons. Claude (via the Anthropic API, server-side) powers Loan Assistant, with a
                built-in demo mode when no key is configured. Mock services for eligibility, documents and applications sit behind clean interfaces so real
                NBFC APIs can replace them.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6">
              <p className="font-semibold text-slate-900">What would come next</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[14.5px] text-slate-600">
                <li>Usability tests with 8–10 self-employed customers</li>
                <li>Connect the lender&apos;s eligibility API and policy rules</li>
                <li>Account Aggregator consent for bank data instead of PDFs</li>
                <li>Document OCR with instant quality checks</li>
                <li>WhatsApp/SMS status updates and resume links</li>
                <li>A/B test against the current journey on the five metrics</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="mt-20 flex flex-col items-start gap-4 rounded-3xl bg-brand-900 p-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xl font-semibold">See it working</p>
            <p className="mt-1 text-brand-100">Use the Demo button (bottom-left) to run the full journey with a sample customer.</p>
          </div>
          <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 font-medium text-brand-900 hover:bg-brand-50">
            Open the prototype <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
