import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrustCard({ icon: Icon, title, children, className }: { icon: LucideIcon; title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card", className)}>
      <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Icon className="size-5" aria-hidden />
      </span>
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      <div className="mt-1.5 text-[14.5px] leading-relaxed text-slate-600">{children}</div>
    </div>
  );
}

/** Small reassurance note used beside forms. */
export function PrivacyNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("flex items-start gap-2 text-[13px] leading-relaxed text-slate-500", className)}>{children}</p>;
}
