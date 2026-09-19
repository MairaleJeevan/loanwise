"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Sparkles, X } from "lucide-react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { Logo } from "@/components/layout/Logo";
import { buttonClasses } from "@/components/ui/button";
import { useAssistant } from "@/components/assistant/AssistantProvider";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/eligibility/business", label: "Eligibility", match: "/eligibility" },
  { href: "/documents", label: "Documents", match: "/documents" },
  { href: "/#help", label: "Help" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { openAssistant } = useAssistant();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:shadow">
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden flex-1 items-center gap-1 lg:flex">
          {LINKS.map((l) => {
            const active = l.match && pathname.startsWith(l.match);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-[14.5px] font-medium transition-colors",
                  active ? "text-brand-800" : "text-slate-600 hover:text-slate-900",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Link href="/status" className={buttonClasses({ variant: "ghost", size: "sm" })}>
            Track Application
          </Link>
          <button onClick={() => openAssistant()} className={buttonClasses({ variant: "secondary", size: "sm" })}>
            <Sparkles className="size-4" aria-hidden />
            Ask Loan Assistant
          </button>
        </div>

        {/* Mobile */}
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <button onClick={() => openAssistant()} className="rounded-lg p-2.5 text-brand-700 hover:bg-brand-50" aria-label="Ask Loan Assistant">
            <Sparkles className="size-5" />
          </button>
          <RadixDialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <RadixDialog.Trigger className="rounded-lg p-2.5 text-slate-700 hover:bg-slate-100" aria-label="Open menu">
              <Menu className="size-5" />
            </RadixDialog.Trigger>
            <RadixDialog.Portal>
              <RadixDialog.Overlay className="fixed inset-0 z-50 bg-slate-950/30 data-[state=open]:animate-fade-in" />
              <RadixDialog.Content className="fixed inset-x-0 top-0 z-50 rounded-b-3xl bg-white p-4 pb-6 shadow-raised data-[state=open]:animate-fade-in">
                <div className="mb-3 flex items-center justify-between">
                  <RadixDialog.Title className="sr-only">Menu</RadixDialog.Title>
                  <RadixDialog.Description className="sr-only">Site navigation</RadixDialog.Description>
                  <Logo />
                  <RadixDialog.Close className="rounded-lg p-2.5 text-slate-600 hover:bg-slate-100" aria-label="Close menu">
                    <X className="size-5" />
                  </RadixDialog.Close>
                </div>
                <nav aria-label="Mobile" className="flex flex-col">
                  {[...LINKS, { href: "/status", label: "Track Application" }, { href: "/story", label: "Product story" }].map((l) => (
                    <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-50">
                      {l.label}
                    </Link>
                  ))}
                </nav>
              </RadixDialog.Content>
            </RadixDialog.Portal>
          </RadixDialog.Root>
        </div>
      </div>
    </header>
  );
}
