"use client";

import React, { useEffect, useState, startTransition, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, Loader2, Building2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface WalletItem {
  id: string;
  name: string;
  type: string;
  email: string | null;
  status: string;
}

export function RecentVendorsCard() {
  const { state } = useApp();
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = useCallback(async () => {
    try {
      const res = await fetch("/api/wallets", {
        headers: {
          Authorization: `Bearer ${(state as any).token || ""}`,
        },
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message || "Failed to fetch vendor network.");
      }
      
      // Filter out user's own wallet
      const filtered = (body.data || []).filter((w: WalletItem) => w.id !== (state.user as any)?.walletId);
      startTransition(() => {
        setWallets(filtered);
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      startTransition(() => {
        setError(msg);
      });
    } finally {
      startTransition(() => {
        setLoading(false);
      });
    }
  }, [(state.user as any)?.walletId, (state as any).token]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  return (
    <Card className="p-6 relative overflow-hidden flex flex-col justify-between min-h-[300px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
      <div>
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            Connected Network Partners
          </h3>
          <Link
            href="/creators"
            className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-7 w-7 text-slate-400 animate-spin mb-3" />
            <p className="text-xs text-slate-500 font-medium">Retrieving partner directories...</p>
          </div>
        ) : error ? (
          <div className="text-xs text-rose-600 dark:text-rose-400 font-medium py-8 text-center">{error}</div>
        ) : wallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
            <Building2 className="h-8 w-8 text-slate-400 mb-2.5" />
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">No external partners connected yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Partners will appear here once linked via invoice or payout.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-3.5 py-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200/80 dark:bg-slate-700 border border-slate-300/60 dark:border-slate-600 font-bold text-xs text-slate-800 dark:text-slate-100">
                    {wallet.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">{wallet.name}</p>
                    <p className="truncate text-[11px] text-slate-400 mt-0.5 font-mono">
                      {wallet.email || "No email linked"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="neutral" className="capitalize text-[10px] py-0.5 px-2">
                    {wallet.type.toLowerCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
