"use client";

import React from "react";
import { cn } from "../../lib/utils";

export type TransactionStatus =
  | "COMPLETED"
  | "PAID"
  | "SETTLED"
  | "SUCCESS"
  | "PENDING"
  | "PROCESSING"
  | "IN_TRANSIT"
  | "SCHEDULED"
  | "QUEUED"
  | "FAILED"
  | "REJECTED"
  | "CANCELLED"
  | "REFUNDED"
  | "ESCROWED"
  | "IN_REVIEW"
  | "HELD"
  | "DRAFT"
  | "UNPAID"
  | string;

export interface TransactionStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: TransactionStatus;
  size?: "xs" | "sm" | "md";
  showDot?: boolean;
}

export function TransactionStatusBadge({
  status,
  size = "sm",
  showDot = true,
  className,
  ...props
}: TransactionStatusBadgeProps) {
  const norm = (status || "UNKNOWN").toUpperCase();

  let styleConfig = {
    bg: "bg-slate-50 dark:bg-slate-900/40",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-800",
    dot: "bg-slate-400",
    label: norm,
  };

  if (["COMPLETED", "PAID", "SETTLED", "SUCCESS", "CONFIRMED"].includes(norm)) {
    styleConfig = {
      bg: "bg-emerald-50/80 dark:bg-emerald-950/30",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-200/80 dark:border-emerald-800/50",
      dot: "bg-emerald-500",
      label: norm === "COMPLETED" ? "Completed" : norm === "PAID" ? "Paid" : "Settled",
    };
  } else if (["PENDING", "PROCESSING", "IN_TRANSIT", "SCHEDULED", "QUEUED"].includes(norm)) {
    styleConfig = {
      bg: "bg-amber-50/80 dark:bg-amber-950/30",
      text: "text-amber-800 dark:text-amber-300",
      border: "border-amber-200/80 dark:border-amber-800/50",
      dot: "bg-amber-500 animate-pulse",
      label: norm === "IN_TRANSIT" ? "In Transit" : norm === "PROCESSING" ? "Processing" : "Pending",
    };
  } else if (["FAILED", "REJECTED", "CANCELLED", "OVERDUE"].includes(norm)) {
    styleConfig = {
      bg: "bg-rose-50/80 dark:bg-rose-950/30",
      text: "text-rose-700 dark:text-rose-400",
      border: "border-rose-200/80 dark:border-rose-800/50",
      dot: "bg-rose-500",
      label: norm === "CANCELLED" ? "Cancelled" : norm === "REJECTED" ? "Rejected" : "Failed",
    };
  } else if (["ESCROWED", "IN_REVIEW", "HELD"].includes(norm)) {
    styleConfig = {
      bg: "bg-indigo-50/80 dark:bg-indigo-950/30",
      text: "text-indigo-700 dark:text-indigo-400",
      border: "border-indigo-200/80 dark:border-indigo-800/50",
      dot: "bg-indigo-500",
      label: norm === "ESCROWED" ? "In Escrow" : norm === "IN_REVIEW" ? "Under Review" : "On Hold",
    };
  } else if (["DRAFT", "UNPAID"].includes(norm)) {
    styleConfig = {
      bg: "bg-slate-100/70 dark:bg-slate-800/50",
      text: "text-slate-600 dark:text-slate-300",
      border: "border-slate-200 dark:border-slate-700",
      dot: "bg-slate-400",
      label: norm === "DRAFT" ? "Draft" : "Unpaid",
    };
  }

  const sizes = {
    xs: "px-2 py-0.5 text-[11px] gap-1",
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3 py-1.5 text-sm gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border tracking-normal select-none transition-colors",
        sizes[size],
        styleConfig.bg,
        styleConfig.text,
        styleConfig.border,
        className
      )}
      {...props}
    >
      {showDot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", styleConfig.dot)} />}
      <span>{styleConfig.label}</span>
    </span>
  );
}
