"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { Money } from "../financial/Money";
import { FinancialNumber } from "../financial/FinancialNumber";
import { TrendingUp, TrendingDown, HelpCircle } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: number | string;
  isCurrency?: boolean;
  currency?: string;
  isMasked?: boolean;
  delta?: number; // e.g. 14.2 for +14.2%
  deltaPeriod?: string; // "vs last month"
  icon?: React.ReactNode;
  tooltip?: string;
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  isCurrency = true,
  currency = "USD",
  isMasked = false,
  delta,
  deltaPeriod = "vs last month",
  icon,
  tooltip,
  className,
  onClick,
}: MetricCardProps) {
  const isPositiveDelta = delta !== undefined && delta > 0;
  const isNegativeDelta = delta !== undefined && delta < 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs transition-all duration-200",
        onClick && "cursor-pointer hover:border-slate-300 hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
            {title}
          </span>
          {tooltip && (
            <span title={tooltip} className="cursor-help text-slate-400 hover:text-slate-600">
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 min-w-0">
        {isCurrency ? (
          <Money
            amount={value}
            currency={currency}
            isMasked={isMasked}
            compact={typeof value === "number" && Math.abs(value) >= 1_000_000}
            size="2xl"
            className="text-slate-900 truncate"
          />
        ) : (
          <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight truncate">
            {value}
          </span>
        )}
      </div>

      {delta !== undefined && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div
            className={cn(
              "flex items-center gap-0.5 font-medium font-mono text-[11px] px-1.5 py-0.5 rounded-md",
              isPositiveDelta
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                : isNegativeDelta
                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600"
            )}
          >
            {isPositiveDelta ? (
              <TrendingUp className="w-3 h-3" />
            ) : isNegativeDelta ? (
              <TrendingDown className="w-3 h-3" />
            ) : null}
            <FinancialNumber value={delta} type="delta" />
          </div>
          <span className="text-slate-400 text-[11px]">{deltaPeriod}</span>
        </div>
      )}
    </div>
  );
}
