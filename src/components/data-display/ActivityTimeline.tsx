"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { Check, Clock, AlertCircle, ArrowUpRight } from "lucide-react";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status: "completed" | "current" | "pending" | "failed";
  badge?: string;
}

export interface ActivityTimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function ActivityTimeline({ items, className }: ActivityTimelineProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        let iconNode = (
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>
        );

        if (item.status === "completed") {
          iconNode = (
            <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Check className="w-3.5 h-3.5" />
            </div>
          );
        } else if (item.status === "current") {
          iconNode = (
            <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white border-2 border-slate-900 dark:border-white flex items-center justify-center text-white dark:text-slate-900">
              <Clock className="w-3 h-3 animate-spin" />
            </div>
          );
        } else if (item.status === "failed") {
          iconNode = (
            <div className="w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          );
        }

        return (
          <div key={item.id} className="relative flex items-start gap-3">
            {!isLast && (
              <span
                className="absolute left-3 top-6 -bottom-4 w-[1px] bg-slate-200 dark:bg-slate-800 -translate-x-1/2"
                aria-hidden="true"
              />
            )}
            <div className="shrink-0">{iconNode}</div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {item.timestamp}
                </span>
              </div>
              {item.description && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              )}
              {item.badge && (
                <div className="mt-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {item.badge}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
