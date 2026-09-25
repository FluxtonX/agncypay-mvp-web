"use client";

import React from "react";
import { cn } from "../../lib/utils";

export interface FinancialNumberProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number | string | null | undefined;
  type?: "number" | "percent" | "delta";
  decimals?: number;
  showSign?: boolean;
  colorizeDelta?: boolean;
  prefix?: string;
  suffix?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

export function FinancialNumber({
  value,
  type = "number",
  decimals = 1,
  showSign = false,
  colorizeDelta = true,
  prefix,
  suffix,
  size = "md",
  className,
  ...props
}: FinancialNumberProps) {
  const numeric = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  const isNan = Number.isNaN(numeric);
  const safeVal = isNan ? 0 : numeric;
  const isPositive = safeVal > 0;
  const isNegative = safeVal < 0;

  let formattedValue = "";
  if (type === "percent") {
    formattedValue = `${(safeVal).toFixed(decimals)}%`;
  } else {
    formattedValue = safeVal.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  }

  const sign = showSign || type === "delta" ? (isPositive ? "+" : isNegative ? "-" : "") : "";
  const absDisplay = type === "delta" ? `${(Math.abs(safeVal)).toFixed(decimals)}%` : formattedValue;

  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base font-semibold",
    lg: "text-lg font-semibold",
    xl: "text-xl font-bold",
    "2xl": "text-2xl font-bold",
  };

  let colorClass = "text-slate-800 dark:text-slate-200";
  if (colorizeDelta && (type === "delta" || showSign)) {
    if (isPositive) colorClass = "text-emerald-600 dark:text-emerald-400";
    else if (isNegative) colorClass = "text-rose-600 dark:text-rose-400";
    else colorClass = "text-slate-500 dark:text-slate-400";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono tabular-nums",
        sizeClasses[size],
        colorClass,
        className
      )}
      {...props}
    >
      {prefix && <span className="mr-0.5">{prefix}</span>}
      {sign}
      {absDisplay}
      {suffix && <span className="ml-0.5">{suffix}</span>}
    </span>
  );
}
