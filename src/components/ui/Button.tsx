import {
  forwardRef,
  type ButtonHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white shadow-sm hover:bg-brand-strong focus-visible:ring-brand",
  secondary:
    "bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus-visible:ring-slate-900",
  outline:
    "border border-border bg-white text-foreground hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-brand",
  ghost:
    "bg-transparent text-foreground hover:bg-slate-100 focus-visible:ring-brand",
  destructive:
    "bg-danger text-white shadow-sm hover:bg-red-700 focus-visible:ring-danger",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, ...props }, ref) => (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, fullWidth, className })}
      {...props}
    />
  ),
);

Button.displayName = "Button";
