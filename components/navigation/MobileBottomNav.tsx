"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, FileText, Home, Sparkles, Activity } from "lucide-react";
import { useAssistant } from "@/components/assistant/AssistantProvider";
import { cn } from "@/lib/utils";

/** Shown on non-journey pages only; journey pages use a sticky CTA instead. */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { openAssistant } = useAssistant();
  const items = [
    { href: "/", label: "Home", icon: Home, active: pathname === "/" },
    { href: "/eligibility/business", label: "Eligibility", icon: ClipboardCheck, active: pathname.startsWith("/eligibility") },
    { href: "/documents", label: "Documents", icon: FileText, active: pathname.startsWith("/documents") },
    { href: "/status", label: "Track", icon: Activity, active: pathname.startsWith("/status") },
  ];
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon, active }) => (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium", active ? "text-brand-700" : "text-slate-500")}>
            <Icon className="size-5" aria-hidden />
            {label}
          </Link>
        ))}
        <button onClick={() => openAssistant()} className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-slate-500">
          <Sparkles className="size-5" aria-hidden />
          Assistant
        </button>
      </div>
    </nav>
  );
}
