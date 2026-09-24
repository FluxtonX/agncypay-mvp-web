"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none";
  
  const variants = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800 shadow-sm border border-transparent font-semibold active:scale-[0.98]",
    secondary:
      "bg-white text-slate-800 hover:bg-slate-50 border border-slate-200/90 shadow-2xs font-semibold active:scale-[0.98]",
    outline:
      "bg-transparent text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]",
    danger:
      "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 active:scale-[0.98]",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm border border-transparent font-semibold active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.015 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.985 }}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...(props as any)}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
      <span className={cn(isLoading && "opacity-80")}>{children}</span>
      {!isLoading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </motion.button>
  );
}
