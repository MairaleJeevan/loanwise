import { cn } from "@/lib/utils";

export function SuggestedQuestions({
  questions,
  onPick,
  disabled,
  className,
}: {
  questions: string[];
  onPick: (q: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  if (!questions.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label="Suggested questions">
      {questions.map((q) => (
        <li key={q}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onPick(q)}
            className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-left text-[13px] font-medium text-brand-800 transition-colors hover:border-brand-400 hover:bg-brand-50 disabled:opacity-50"
          >
            {q}
          </button>
        </li>
      ))}
    </ul>
  );
}
