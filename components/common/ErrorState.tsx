import { AlertTriangle, WifiOff, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = "Try again",
  retrying,
  variant = "error",
  icon,
  children,
  className,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  retrying?: boolean;
  variant?: "error" | "network" | "info";
  icon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
}) {
  const Icon = icon ?? (variant === "network" ? WifiOff : AlertTriangle);
  return (
    <div
      role={variant === "info" ? "status" : "alert"}
      className={cn(
        "rounded-2xl border p-5",
        variant === "info" ? "border-slate-200 bg-white" : "border-rose-200 bg-rose-50/60",
        className,
      )}
    >
      <div className="flex gap-3.5">
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", variant === "info" ? "bg-slate-100 text-slate-600" : "bg-rose-100 text-rose-700")}>
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{message}</p>
          {(onRetry || children) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry} loading={retrying}>
                  {retryLabel}
                </Button>
              )}
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
