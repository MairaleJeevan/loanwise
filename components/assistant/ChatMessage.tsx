import { AlertTriangle, RotateCw, Sparkles } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/lib/journey/types";
import { cn } from "@/lib/utils";

/** Minimal, safe markdown: paragraphs, bullet/numbered lists and **bold**. No HTML injection. */
function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function RichText({ content }: { content: string }) {
  const blocks = content.trim().split(/\n{2,}/);
  return (
    <div className="space-y-2.5">
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter(Boolean);
        const bullet = /^\s*([-*•])\s+/;
        const numbered = /^\s*\d+[.)]\s+/;
        if (lines.every((l) => bullet.test(l))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 marker:text-brand-500">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(bullet, ""))}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => numbered.test(l))) {
          return (
            <ol key={i} className="list-decimal space-y-1 pl-5 marker:text-brand-600">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(numbered, ""))}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {renderInline(l.replace(/^#+\s*/, ""))}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export function AssistantAvatar({ className }: { className?: string }) {
  return (
    <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white", className)} aria-hidden>
      <Sparkles className="size-3.5" />
    </span>
  );
}

export function ChatMessage({ message, onRetry }: { message: ChatMessageType; onRetry?: () => void }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-700 px-4 py-2.5 text-[14.5px] leading-relaxed text-white">{message.content}</div>
      </div>
    );
  }

  if (message.mode === "unavailable") {
    return (
      <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-900">
        <div className="flex gap-2.5">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p>{message.content}</p>
            {onRetry && (
              <button onClick={onRetry} className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-amber-900 underline underline-offset-2">
                <RotateCw className="size-3.5" aria-hidden /> Try again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5">
      <AssistantAvatar className="mt-0.5" />
      <div className="max-w-[88%] min-w-0">
        <div className="rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-[14.5px] leading-relaxed text-slate-800">
          <RichText content={message.content} />
        </div>
        {message.mode === "fallback" && <p className="mt-1 pl-1 text-[11.5px] text-slate-500">Answered from saved guidance</p>}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-2.5" aria-live="polite" aria-label="Loan Assistant is typing">
      <AssistantAvatar />
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
    </div>
  );
}
