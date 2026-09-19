import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className ?? ""}`} aria-label="LoanWise home">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="9" className="fill-brand-700" />
        <path d="M9 9v14h9" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M16 17.5l3 3 5.5-7" stroke="#7fcfc2" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <span className="text-[19px] font-semibold tracking-tight text-slate-900">
        Loan<span className="text-brand-700">Wise</span>
      </span>
    </Link>
  );
}
