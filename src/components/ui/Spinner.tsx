import { cn } from "@/lib/utils";

export function Spinner({
  className,
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3 text-sm text-muted", className)}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand/25 border-t-brand" />
      <span>{label}</span>
    </span>
  );
}
