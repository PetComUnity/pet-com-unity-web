import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AppShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AppShell({
  title,
  description,
  actions,
  children,
  className,
}: AppShellProps) {
  return (
    <section className={cn("mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8", className)}>
      <header className="flex flex-col gap-4 border-b border-white/70 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand">
            AnimalID MVP
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-muted">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </header>
      {children}
    </section>
  );
}
