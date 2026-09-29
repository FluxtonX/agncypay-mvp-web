"use client";

import React from "react";
import { cn } from "../../lib/utils";

export interface CurrencyBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  currency: string;
  size?: "xs" | "sm" | "md";
  showSymbol?: boolean;
}

export function CurrencyBadge({
  currency = "USD",
  size = "sm",
  showSymbol = true,
  className,
  ...props
}: CurrencyBadgeProps) {
  const norm = currency.toUpperCase();

  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "CA$",
    AUD: "A$",
    USDC: "₮",
    USDT: "₮",
    BTC: "₿",
  };

  const sizes = {
    xs: "text-[10px] px-1.5 py-0.5",
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300",
        sizes[size],
        className
      )}
      {...props}
    >
      {showSymbol && <span className="text-slate-400 font-sans">{symbols[norm] || ""}</span>}
      <span>{norm}</span>
    </span>
  );
}
