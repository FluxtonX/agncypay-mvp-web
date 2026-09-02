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
        "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0D0D12]/70 backdrop-blur-md px-6 py-12 text-center flex flex-col items-center justify-center transition-all duration-300",
        className
      )}
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      {badgeText && (
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium tracking-wide text-[#A1A1AA]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {badgeText}
        </span>
      )}

      <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] text-white shadow-inner">
        <Icon className="h-7 w-7 text-white/90" />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20 pointer-events-none" />
      </div>

      <h3 className="text-base font-semibold text-white tracking-tight sm:text-lg mb-2">
        {title}
      </h3>
      
      <p className="max-w-md text-xs sm:text-sm text-[#8E8E93] leading-relaxed mb-6">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              variant="primary"
              size="sm"
              className="bg-white text-black hover:bg-white/90 font-medium px-4 py-2 text-xs rounded-xl shadow-lg transition-transform active:scale-95"
            >
              {ActionIcon && <ActionIcon className="h-3.5 w-3.5 mr-1.5" />}
              {actionLabel}
            </Button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
              size="sm"
              className="border-white/10 bg-white/[0.03] text-[#D4D4D8] hover:bg-white/[0.08] hover:text-white text-xs rounded-xl"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
