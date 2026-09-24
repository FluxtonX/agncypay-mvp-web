import React from "react";
import { cn } from "../../lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs hover:shadow-xs hover:border-slate-300/80 transition-all duration-200 flex flex-col justify-between min-h-[135px]",
        className
      )}
    >
      <div className="flex justify-between items-start gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 shrink-0">
            {icon}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2.5">
          {value}
        </h3>
        {(description || trend) && (
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] border",
                  trend.isPositive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                    : "bg-rose-50 text-rose-700 border-rose-200/60"
                )}
              >
                {trend.value}
              </span>
            )}
            {description && (
              <span className="text-slate-500 font-normal truncate">{description}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
