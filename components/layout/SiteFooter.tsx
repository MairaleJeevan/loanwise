import Link from "next/link";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Know your eligibility. Understand your options. Apply with confidence.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div className="space-y-2">
              <p className="font-medium text-slate-900">Journey</p>
              <Link href="/eligibility/business" className="block text-slate-600 hover:text-slate-900">Check eligibility</Link>
              <Link href="/documents" className="block text-slate-600 hover:text-slate-900">Document checklist</Link>
              <Link href="/status" className="block text-slate-600 hover:text-slate-900">Track application</Link>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-slate-900">Prototype</p>
              <Link href="/story" className="block text-slate-600 hover:text-slate-900">Product story</Link>
              <Link href="/dev/analytics" className="block text-slate-600 hover:text-slate-900">Analytics (dev)</Link>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-slate-100 pt-6 text-xs leading-relaxed text-slate-500">
          LoanWise is a prototype built for the BOMBAYDC Product Builder Challenge. All figures are indicative and illustrative, sample data is fictional,
          and no information or documents are sent to a lender. Final eligibility, loan amount, interest rate and terms are always subject to the
          lender&apos;s assessment.
        </p>
      </div>
    </footer>
  );
}
