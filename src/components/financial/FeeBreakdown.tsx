"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { Money } from "./Money";

export interface FeeItem {
  label: string;
  amount: number;
  isDeduction?: boolean;
  tooltip?: string;
}

export interface FeeBreakdownProps {
  grossAmount: number;
  items: FeeItem[];
  netAmount: number;
  currency?: string;
  className?: string;
}

export function FeeBreakdown({
  grossAmount,
  items,
  netAmount,
  currency = "USD",
  className,
}: FeeBreakdownProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-4 text-xs font-mono space-y-2.5",
        className
      )}
    >
      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-sans font-medium">
        <span>Gross Invoice Amount</span>
        <Money amount={grossAmount} currency={currency} size="sm" />
      </div>

      <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-slate-500">
            <span className="font-sans">{item.label}</span>
            <div className="flex items-center gap-1">
              {item.isDeduction && <span>-</span>}
              <Money
                amount={item.amount}
                currency={currency}
                size="xs"
                className="text-slate-600 dark:text-slate-400"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-sans font-semibold">
        <span>Net Total Payout</span>
        <Money amount={netAmount} currency={currency} size="md" colorize={false} />
      </div>
    </div>
  );
}
