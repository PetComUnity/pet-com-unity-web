import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => (
    <label className="block space-y-2">
      {label ? (
        <span className="text-sm font-medium text-foreground">{label}</span>
      ) : null}
      <input
        ref={ref}
        id={id}
        className={cn(
          "block h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20",
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

Input.displayName = "Input";
