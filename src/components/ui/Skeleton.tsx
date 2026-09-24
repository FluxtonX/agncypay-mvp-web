import React from "react";
import { cn } from "../../lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular" | "card" | "table-row";
}

export function Skeleton({
  className,
  variant = "rectangular",
  ...props
}: SkeletonProps) {
  const baseClass = "animate-pulse bg-slate-100 rounded-lg";

  const styles = {
    text: "h-4 w-3/4 my-1",
    rectangular: "h-11 w-full",
    circular: "h-10 w-10 rounded-full",
    card: "h-36 w-full rounded-2xl border border-slate-200/80 bg-white shadow-2xs",
    "table-row": "h-14 w-full rounded-none border-b border-slate-100",
  };

  return (
    <div
      className={cn(baseClass, styles[variant], className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between h-[150px] animate-pulse">
      <div className="space-y-3">
        <div className="w-1/3 h-4 bg-slate-100 rounded" />
        <div className="w-2/3 h-7 bg-slate-100 rounded-lg" />
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="w-1/4 h-4 bg-slate-100 rounded" />
        <div className="h-7 w-7 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-4 px-6 animate-pulse">
      <div className="flex items-center gap-3 w-1/4">
        <div className="h-8 w-8 rounded-full bg-slate-100" />
        <div className="h-4 w-28 bg-slate-100 rounded" />
      </div>
      <div className="h-4 w-20 bg-slate-100 rounded w-1/6" />
      <div className="h-4 w-20 bg-slate-100 rounded w-1/6" />
      <div className="h-6 w-16 bg-slate-100 rounded-full w-1/8" />
      <div className="h-8 w-20 bg-slate-100 rounded-lg w-1/8" />
    </div>
  );
}
