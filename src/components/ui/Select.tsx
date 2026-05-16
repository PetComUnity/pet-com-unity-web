import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, children, ...props }, ref) => (
    <label className="block space-y-2">
      {label ? (
        <span className="text-sm font-medium text-foreground">{label}</span>
      ) : null}
      <span className="relative block">
        <select
          ref={ref}
          className={cn(
            "block h-11 w-full appearance-none rounded-lg border border-border bg-white px-3 pr-10 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20",
            error && "border-danger focus:border-danger focus:ring-danger/20",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </span>
      {error ? (
        <span className="text-sm text-danger">{error}</span>
      ) : hint ? (
        <span className="text-sm text-muted">{hint}</span>
      ) : null}
    </label>
  ),
);

Select.displayName = "Select";
