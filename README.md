# LoanWise

**Know your eligibility. Understand your options. Apply with confidence.**

A working prototype of a digital loan-acquisition journey for self-employed customers of a mid-sized NBFC, built for the BOMBAYDC Product Builder Challenge.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start   # production build
```

Everything works without any configuration. To use live AI answers, copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | No | Enables live Loan Assistant answers (server-side only) |
| `ANTHROPIC_MODEL` | No | Defaults to `claude-opus-5` |
| `LOANWISE_AI_MODE` | No | Set to `mock` to force demo mode |

## 7-minute demo script

1. **Landing**: open the **Demo** button (bottom-left) and choose **Start Demo**. This loads a fictional customer, Rahul Sharma of Sharma Electricals.
2. **Business → Finances**: the fields are prefilled. Open a "Why do we ask this?" note, then click **Check My Eligibility**.
3. **Estimate**: ₹10,90,000 indicative. Open **How was this calculated?**, then ask Loan Assistant how the estimate was calculated. It answers using Rahul's own figures.
4. **Options**: pick **Balanced**, then ask the assistant which option fits.
5. **Documents**: use **Use sample** on each card. In the Demo panel, turn on **Upload failure** to show the failed state and retry.
6. **Application → Review → Submit**: try an invalid mobile number, **Save & Come Back Later**, then submit.
7. **Status**: timeline, **View Application**, and **Simulate next status update**.
8. **Edge cases** (Demo panel): Can't proceed right now, Unable to estimate, Network failure, AI unavailable, Session timeout.
9. **/story** covers the problem, decisions, what wasn't built, AI and metrics. **/dev/analytics** shows the tracked funnel.

`Shift + D` hides the Demo button for clean screenshots.

## Structure

```
app/                      routes: / , eligibility/{business,finances,result}, options, documents,
                          apply, review, submitted, status, story, dev/analytics, api/assistant
components/
  assistant/              LoanAssistant panel, ChatMessage, ChatInput, SuggestedQuestions, provider
  eligibility/ loan/ documents/ application/ status/   journey components
  layout/ navigation/ ui/ common/                      shell, header, primitives, ErrorState, TrustCard
lib/
  ai/                     context.ts (journey → AI context), prompts.ts (system prompt),
                          assistant.ts (server Claude call), mockAssistant.ts (demo mode)
  journey/                types, store (React context + localStorage), validation, constants, demo data
  analytics.ts            mock event collector
  simulation.ts           presenter failure toggles
services/                 eligibilityService, documentService, applicationService, aiService
```

## How AI works

- The browser calls `/api/assistant`. The API key stays on the server and never reaches the browser.
- Each request carries the current page and a **privacy-minimised** journey context: business profile, figures, estimate, options, document status and application stage. It never includes the customer's name, phone number or email.
- The system prompt (`lib/ai/prompts.ts`) lets the assistant explain, and forbids guarantees, lending decisions, invented rates or policies, and collecting ID numbers. It separates "indicative estimate" from "final lender decision", and it can only use the product facts listed in the prompt.
- The chat input blocks messages that look like PAN, Aadhaar or account numbers before they are sent.
- Server-side refusal fallback (`fallbacks: "default"`) is enabled on the Claude request.

## Demo mode (no key)

With no key, or if the model call fails, `lib/ai/mockAssistant.ts` answers common questions with pre-approved, context-aware responses. Those answers include the customer's own numbers where relevant. The panel shows a "Demo mode" badge. If the endpoint can't be reached, the panel says *"Loan Assistant is temporarily unavailable. You can continue your application and return later."* The journey itself never depends on the assistant.

## Eligibility engine

`services/eligibilityService.ts` contains a **demo-only illustrative calculation, not a credit decision**:

- repayment capacity = income × allowed share (40/45/50% by business vintage) − existing EMIs
- amount = what that capacity repays over the tenure at an illustrative 14% p.a., capped at 12× monthly income and ₹50 lakh

The engine is deterministic, so every number on screen can be explained.

## Known limitations

- All services are mocks. No data or files leave the browser, and uploads only record file name and size.
- State lives in `localStorage` per device. There is no authentication, and applications can't be tracked from another device.
- The illustrative rate and FOIR thresholds are placeholders, not lender policy.
- Analytics are stored locally only.
