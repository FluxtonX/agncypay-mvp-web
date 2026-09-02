"use client";

import React, { useState } from "react";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface LiveRefreshIndicatorProps {
  onRefresh: () => Promise<void> | void;
  lastUpdatedText?: string;
  isAutoRefreshing?: boolean;
  className?: string;
}

export function LiveRefreshIndicator({
  onRefresh,
  lastUpdatedText = "Just now",
  isAutoRefreshing = false,
  className,
}: LiveRefreshIndicatorProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [recentlyRefreshed, setRecentlyRefreshed] = useState(false);

  const handleClick = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    try {
      await onRefresh();
      setRecentlyRefreshed(true);
      setTimeout(() => setRecentlyRefreshed(false), 2000);
    } finally {
      setIsSpinning(false);
    }
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-[#A1A1AA]">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            isAutoRefreshing || isSpinning ? "bg-amber-400 animate-ping" : "bg-emerald-400"
          )}
        />
        <span>Synced: <strong className="font-medium text-white">{lastUpdatedText}</strong></span>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={isSpinning}
        title="Refresh live data"
        className={cn(
          "relative flex items-center justify-center h-8 px-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-[#D4D4D8] hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all active:scale-95 disabled:opacity-60",
          isSpinning && "cursor-not-allowed"
        )}
      >
        {recentlyRefreshed ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mr-1.5" />
        ) : (
          <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isSpinning && "animate-spin text-white")} />
        )}
        <span className="font-medium">{isSpinning ? "Syncing..." : recentlyRefreshed ? "Updated" : "Sync"}</span>
      </button>
    </div>
  );
}
