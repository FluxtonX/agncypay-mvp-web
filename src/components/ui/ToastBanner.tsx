"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
}

interface ToastBannerProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
  className?: string;
}

export function ToastBanner({ toast, onDismiss, className }: ToastBannerProps) {
  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";
  const isWarning = toast.type === "warning";

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300",
        className
      )}
    >
      <div
        className={cn(
          "rounded-2xl border p-4 shadow-2xl backdrop-blur-xl flex items-start gap-3.5",
          isSuccess && "bg-[#0A1A12]/90 border-emerald-500/30 text-white",
          isError && "bg-[#1F0A0A]/90 border-red-500/30 text-white",
          isWarning && "bg-[#1F180A]/90 border-amber-500/30 text-white",
          !isSuccess && !isError && !isWarning && "bg-[#0D0D12]/90 border-white/10 text-white"
        )}
      >
        <div className="shrink-0 mt-0.5">
          {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
          {isError && <AlertCircle className="h-5 w-5 text-red-400" />}
          {isWarning && <AlertCircle className="h-5 w-5 text-amber-400" />}
          {!isSuccess && !isError && !isWarning && <Info className="h-5 w-5 text-blue-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold tracking-wide uppercase">{toast.title}</h4>
          {toast.message && (
            <p className="mt-1 text-xs text-[#D4D4D8] leading-relaxed break-words">
              {toast.message}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-lg text-[#8E8E93] hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
