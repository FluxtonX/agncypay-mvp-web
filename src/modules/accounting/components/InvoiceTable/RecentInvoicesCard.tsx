"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FileText, Loader2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useAccounting } from "../../hooks/useAccounting";
import { ProviderType } from "../../types";
import { Money } from "@/components/financial/Money";
import { TransactionStatusBadge } from "@/components/financial/TransactionStatusBadge";

const getProviderDetails = (provider: ProviderType) => {
  switch (provider) {
    case "quickbooks":
      return { name: "QuickBooks", logo: "/quickbook.png" };
    case "xero":
      return { name: "Xero", logo: "/xero.png" };
    case "sage":
      return { name: "Sage", logo: "/sage.png" };
  }
};

export function RecentInvoicesCard() {
  const router = useRouter();
  const { currentProvider, invoices, loading, connectionStatuses, error } = useAccounting();
  
  const providerInfo = getProviderDetails(currentProvider);
  const isConnected = !!connectionStatuses[currentProvider]?.connected;

  return (
    <Card className="p-6 flex flex-col min-h-[280px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" />
          Recent Invoices
        </h3>
        <Link
          href={`/providers/${currentProvider}/income`}
          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
        >
          View All <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 py-8">
          <Loader2 className="h-7 w-7 text-slate-400 animate-spin mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading invoices...</p>
        </div>
      ) : error ? (
        <div className="text-xs text-rose-600 dark:text-rose-400 font-medium py-6 text-center">{error}</div>
      ) : !isConnected ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={providerInfo.logo} alt={providerInfo.name} className="h-8 w-8 object-contain mb-3 opacity-60" />
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Connect {providerInfo.name} to see invoices.</p>
          <Link href="/dashboard/integrations" className="mt-2 text-xs font-semibold text-slate-900 dark:text-white hover:underline">
            Connect {providerInfo.name} →
          </Link>
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
          <FileText className="h-8 w-8 text-slate-400 mb-2.5" />
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">No invoices yet.</p>
          <Link href={`/providers/${currentProvider}/invoices`} className="mt-2 text-xs font-semibold text-slate-900 dark:text-white hover:underline">
            Create first invoice →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.slice(0, 4).map((inv) => (
            <button
              key={inv.id}
              type="button"
              onClick={() => router.push(`/dashboard/pay-flow/${inv.id}`)}
              className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-3.5 py-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-1.5 shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={providerInfo.logo} alt={providerInfo.name} className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-white transition-colors">
                    {inv.name}
                  </p>
                  <p className="truncate text-[11px] text-slate-400 mt-0.5 font-mono">
                    #{inv.docNumber} · {inv.daysText}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="hidden text-[11px] sm:inline-block text-slate-400 font-mono">{inv.date}</span>
                <TransactionStatusBadge status={inv.status} size="xs" />
                <Money amount={inv.amount} size="sm" className="font-semibold text-slate-900 dark:text-slate-100" />
              </div>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
