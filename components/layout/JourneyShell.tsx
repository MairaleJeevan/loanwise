import { ProgressStepper } from "@/components/application/ProgressStepper";
import { cn } from "@/lib/utils";

/**
 * Standard layout for journey screens: progress, heading, content, and an
 * action bar that is sticky at the bottom on mobile.
 */
export function JourneyShell({
  step,
  stepCaption,
  eyebrow,
  title,
  subtitle,
  children,
  actions,
  aside,
  wide,
}: {
  step?: number;
  stepCaption?: string;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cn("mx-auto w-full px-4 pt-6 pb-36 sm:px-6 sm:pt-10 md:pb-16", wide ? "max-w-6xl" : aside ? "max-w-6xl" : "max-w-2xl")}>
      <div className={cn(aside && "lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10")}>
        <div className="min-w-0">
          {step && (
            <div className="mb-7">
              <ProgressStepper current={step} caption={stepCaption} />
            </div>
          )}
          {eyebrow && <div className="mb-3">{eyebrow}</div>}
          <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-slate-900 sm:text-[34px]">{title}</h1>
          {subtitle && <p className="mt-2 text-[16px] leading-relaxed text-slate-600">{subtitle}</p>}
          <div className="mt-7">{children}</div>
          {actions && <StickyActions>{actions}</StickyActions>}
        </div>
        {aside && <aside className="mt-8 space-y-4 lg:sticky lg:top-24 lg:mt-0 lg:self-start">{aside}</aside>}
      </div>
    </div>
  );
}

export function StickyActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">{children}</div>
    </div>
  );
}
