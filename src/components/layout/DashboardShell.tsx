"use client";

import React from "react";
import { DashboardSidebar, MobileDashboardNav } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardContentFrame } from "./DashboardContentFrame";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-slate-900 selection:text-white">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <MobileDashboardNav />
        <DashboardHeader />
        <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-[1400px] w-full mx-auto">
          <DashboardContentFrame>{children}</DashboardContentFrame>
        </main>
      </div>
    </div>
  );
}
