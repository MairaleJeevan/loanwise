"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export function DialogContent({
  title,
  description,
  children,
  className,
  hideClose,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  hideClose?: boolean;
}) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
      <RadixDialog.Content
        {...(description ? {} : { "aria-describedby": undefined })}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-raised data-[state=open]:animate-fade-up",
          "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <RadixDialog.Title className="text-lg font-semibold tracking-tight text-slate-900">{title}</RadixDialog.Title>
            {description && <RadixDialog.Description className="mt-1 text-sm text-slate-600">{description}</RadixDialog.Description>}
          </div>
          {!hideClose && (
            <RadixDialog.Close className="-m-1.5 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label="Close">
              <X className="size-5" />
            </RadixDialog.Close>
          )}
        </div>
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
