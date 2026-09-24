"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  animate?: boolean;
  delay?: number;
}

export function Card({
  className,
  hoverEffect = false,
  animate = false,
  delay = 0,
  children,
  ...props
}: CardProps) {
  const baseStyles = "bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs overflow-hidden relative transition-all duration-200";
  const hoverStyles = hoverEffect ? "hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5" : "";

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
        className={cn(baseStyles, hoverStyles, className)}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cn(baseStyles, hoverStyles, className)} {...props}>
      {children}
    </div>
  );
}
