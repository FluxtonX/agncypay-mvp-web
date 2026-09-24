"use client";

import React from "react";
import { Bell, Search } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { normalizeWorkspaceType } from "../../types/workspace";

export function DashboardHeader() {
  const { state } = useApp();
  const workspaceType = state.user ? normalizeWorkspaceType(state.user.accountType) : "brand";
  const placeholderByWorkspace = {
    brand: "Search invoices, payments, agencies...",
    agency: "Search talent, payouts, invoices, clients...",
    talent_independent: "Search payouts, invoices, payment history...",
    talent_agency: "Search assigned invoices, payouts, agency payments...",
    mother_agency: "Search child agencies, vendors, treasury, reports...",
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/90 bg-white px-6 sm:px-8 z-10">
      <label className="relative block w-full max-w-[540px]">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          aria-label="Search"
          placeholder={placeholderByWorkspace[workspaceType]}
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm font-normal text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all shadow-2xs"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <Bell className="h-4.5 w-4.5 stroke-[1.8]" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-slate-900 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
