import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => (
    <label className="block space-y-2">
      {label ? (
        <span className="text-sm font-medium text-foreground">{label}</span>
      ) : null}
      <textarea
        ref={ref}
        className={cn(
          "block min-h-28 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="text-sm text-danger">{error}</span>
      ) : hint ? (
        <span className="text-sm text-muted">{hint}</span>
      ) : null}
    </label>
  ),
);

Textarea.displayName = "Textarea";
