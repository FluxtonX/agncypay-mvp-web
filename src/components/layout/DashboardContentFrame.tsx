"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface DashboardContentFrameProps {
  children: React.ReactNode;
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />;
}

export function DashboardDataSkeleton() {
  return (
    <div className="w-full max-w-[1048px]">
      <SkeletonBlock className="h-8 w-48" />
      <SkeletonBlock className="mt-3 h-5 w-80 max-w-full" />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-[135px] rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between"
          >
            <SkeletonBlock className="h-4 w-2/3" />
            <SkeletonBlock className="h-8 w-1/2" />
            <SkeletonBlock className="h-3.5 w-3/4" />
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between gap-4">
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="h-9 w-28" />
        </div>
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3, 4].map((row) => (
            <SkeletonBlock key={row} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardContentFrame({ children }: DashboardContentFrameProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timeout = window.setTimeout(() => {
      setIsLoading(false);
    }, 280);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return (
    <div className="relative min-h-full">
      {isLoading && (
        <div className="pointer-events-none absolute inset-x-0 top-[-24px] sm:top-[-32px] z-20 h-[2px] overflow-hidden bg-slate-100">
          <div className="h-full w-1/3 animate-[dashboard-progress_0.9s_ease-in-out_infinite] bg-slate-900" />
        </div>
      )}
      {isLoading ? <DashboardDataSkeleton /> : children}
    </div>
  );
}
