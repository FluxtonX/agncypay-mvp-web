"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const breadcrumbMap: Record<string, string> = {
    branddashboard: "Brand Operations",
    agencydashboard: "Agency Operations",
    dashboard: "Dashboard",
    invoices: "Invoices & Payables",
    creators: "Vendors & Creators",
    payments: "Payments & Disbursements",
    wallet: "Treasury",
    cards: "Virtual Cards",
    splits: "Commission Splits",
    talent: "Talent Roster",
    settings: "Settings",
    analytics: "Financial Analytics",
    team: "Team & Permissions",
  };

  let accumulatedPath = "";

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium" aria-label="Breadcrumb">
      <Link
        href={pathname.startsWith("/agencydashboard") ? "/agencydashboard" : "/branddashboard"}
        className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {segments.map((seg, index) => {
        accumulatedPath += `/${seg}`;
        const isLast = index === segments.length - 1;
        const displayName = breadcrumbMap[seg] || seg.replace(/-/g, " ");

        return (
          <React.Fragment key={accumulatedPath}>
            <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
            {isLast ? (
              <span className="text-slate-900 dark:text-slate-100 font-semibold capitalize truncate max-w-[200px]">
                {displayName}
              </span>
            ) : (
              <Link
                href={accumulatedPath}
                className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors capitalize truncate max-w-[150px]"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
