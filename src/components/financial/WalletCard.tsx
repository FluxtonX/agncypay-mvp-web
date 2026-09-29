"use client";

import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { Money } from "./Money";
import { Copy, Check, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, ShieldCheck } from "lucide-react";

export interface WalletCardProps {
  title?: string;
  currency?: string;
  totalBalance: number;
  availableBalance: number;
  pendingBalance?: number;
  accountNumber?: string;
  network?: string;
  onSend?: () => void;
  onReceive?: () => void;
  className?: string;
}

export function WalletCard({
  title = "Primary Operating Balance",
  currency = "USD",
  totalBalance,
  availableBalance,
  pendingBalance = 0,
  accountNumber,
  network,
  onSend,
  onReceive,
  className,
}: WalletCardProps) {
  const [isMasked, setIsMasked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!accountNumber) return;
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all",
        className
      )}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          {network && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {network}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsMasked(!isMasked)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 -m-1"
          title={isMasked ? "Show balances" : "Hide balances"}
          aria-label="Toggle balance visibility"
        >
          {isMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Balance Display */}
      <div className="pt-5 pb-4">
        <div className="text-xs text-slate-400 font-medium mb-1">Total Balance</div>
        <div className="flex items-baseline gap-2">
          <Money
            amount={totalBalance}
            currency={currency}
            isMasked={isMasked}
            size="3xl"
            className="text-slate-900 dark:text-slate-50"
          />
        </div>

        {/* Available vs Pending Breakdown */}
        <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Available</div>
            <Money
              amount={availableBalance}
              currency={currency}
              isMasked={isMasked}
              size="md"
              className="text-slate-800 dark:text-slate-200 mt-0.5"
            />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">In Transit / Pending</div>
            <Money
              amount={pendingBalance}
              currency={currency}
              isMasked={isMasked}
              size="md"
              className="text-slate-500 dark:text-slate-400 mt-0.5"
            />
          </div>
        </div>
      </div>

      {/* Footer / Account & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        {accountNumber ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <span>{accountNumber}</span>
            <button
              onClick={handleCopy}
              className="p-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Copy account reference"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>FDIC-Insured Custodial Account</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {onReceive && (
            <button
              onClick={onReceive}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
              <span>Receive</span>
            </button>
          )}
          {onSend && (
            <button
              onClick={onSend}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Send Money</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
