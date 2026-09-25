"use client";

import React from "react";
import { cn } from "../../lib/utils";

export interface MoneyProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number | string | null | undefined;
  currency?: string;
  isMasked?: boolean;
  colorize?: boolean; // green for positive, red for negative
  showSign?: boolean; // force + for positive
  compact?: boolean;  // 1.2M, 45.5k
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

export function Money({
  amount,
  currency = "USD",
  isMasked = false,
  colorize = false,
  showSign = false,
  compact = false,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
  size = "md",
  className,
  ...props
}: MoneyProps) {
  if (isMasked) {
    return (
      <span
        className={cn(
          "font-mono tracking-widest text-slate-400 select-none",
          className
        )}
        {...props}
      >
        $••••••
      </span>
    );
  }

  const numeric = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  const isNan = Number.isNaN(numeric);
  const safeAmount = isNan ? 0 : numeric;
  const isNegative = safeAmount < 0;
  const isPositive = safeAmount > 0;

  // Formatting options
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase() === "USDC" || currency.toUpperCase() === "USDT" ? "USD" : currency,
    notation: compact ? "compact" : "standard",
    minimumFractionDigits: compact ? 0 : minimumFractionDigits,
    maximumFractionDigits: compact ? 1 : maximumFractionDigits,
  }).format(Math.abs(safeAmount));

  // If crypto, prepend/append token symbol
  let displayValue = formatted;
  if (currency.toUpperCase() === "USDC") {
    displayValue = `${formatted} USDC`;
  } else if (currency.toUpperCase() === "USDT") {
    displayValue = `${formatted} USDT`;
  } else if (currency.toUpperCase() === "BTC") {
    displayValue = `₿${safeAmount.toFixed(6)}`;
  }

  const sign = isNegative ? "-" : showSign && isPositive ? "+" : "";

  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base font-semibold",
    lg: "text-lg font-semibold",
    xl: "text-xl font-bold tracking-tight",
    "2xl": "text-2xl font-bold tracking-tight",
    "3xl": "text-3xl sm:text-4xl font-extrabold tracking-tight",
  };

  const colorClass = colorize
    ? isPositive
      ? "text-emerald-600 dark:text-emerald-400"
      : isNegative
      ? "text-rose-600 dark:text-rose-400"
      : "text-slate-600 dark:text-slate-400"
    : "text-slate-900 dark:text-slate-100";

  return (
    <span
      className={cn(
        "inline-flex items-baseline font-mono tabular-nums leading-none tracking-tight",
        sizeClasses[size],
        colorClass,
        className
      )}
      {...props}
    >
      {sign}
      {displayValue}
    </span>
  );
}
