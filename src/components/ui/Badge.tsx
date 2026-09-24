import React from "react";
import { cn } from "../../lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "neutral";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "neutral",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 font-medium rounded-full border tracking-wide whitespace-nowrap";
  
  const variants = {
    primary: "bg-slate-900 text-white border-slate-900 font-semibold",
    secondary: "bg-slate-100 text-slate-800 border-slate-200 font-medium",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium",
    warning: "bg-amber-50 text-amber-700 border-amber-200 font-medium",
    error: "bg-rose-50 text-rose-700 border-rose-200 font-medium",
    info: "bg-blue-50 text-blue-700 border-blue-200 font-medium",
    neutral: "bg-slate-50 text-slate-600 border-slate-200 font-medium",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
