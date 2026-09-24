"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  badgeText?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  badgeText,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center flex flex-col items-center justify-center transition-all duration-200",
        className
      )}
    >
      {badgeText && (
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium tracking-wide text-slate-600 shadow-2xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {badgeText}
        </span>
      )}

      <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-700 shadow-2xs">
        <Icon className="h-7 w-7 text-slate-700" />
      </div>

      <h3 className="text-base font-bold text-slate-900 tracking-tight sm:text-lg mb-1.5">
        {title}
      </h3>
      
      <p className="max-w-md text-sm text-slate-500 leading-relaxed mb-6">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              variant="primary"
              size="sm"
            >
              {ActionIcon && <ActionIcon className="h-3.5 w-3.5 mr-1.5" />}
              {actionLabel}
            </Button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="secondary"
              size="sm"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
