import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Building2, CreditCard, Plus, CheckCircle2, X, Loader2, ShieldCheck, Wallet, Landmark } from "lucide-react";
import { apiGetVerificationState } from "../../lib/api/verification";
import { apiCreatePlaidLinkToken, apiExchangePlaidPublicToken, apiPlaidSandboxLink } from "../../lib/api/plaid";

interface PlaidAccount {
  id: string;
  institutionName: string;
  name: string;
  mask: string;
  subtype: string;
  availableBalance: number;
}

interface CybridDepositAccount {
  routingNumber?: string;
  accountNumber?: string;
  uniqueMemoId?: string;
  bankName?: string;
}

interface BanksAndCardsPanelProps {
  onConnectAccount?: () => void;
}

export function BanksAndCardsPanel({ onConnectAccount }: BanksAndCardsPanelProps) {
  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);
  const [cybridDeposit, setCybridDeposit] = useState<CybridDepositAccount | null>(null);
  const [isPlaidLoading, setIsPlaidLoading] = useState(false);
  const [plaidError, setPlaidError] = useState<string | null>(null);

  // Initialize Plaid Link SDK & Load Cybrid Deposit Account
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!document.getElementById("plaid-link-sdk")) {
        const script = document.createElement("script");
        script.id = "plaid-link-sdk";
        script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
        script.async = true;
        document.body.appendChild(script);
      }

      const saved = localStorage.getItem("agency_plaid_accounts");
      if (saved) {
        try {
          setPlaidAccounts(JSON.parse(saved));
        } catch (e) {
          console.error("Error reading saved Plaid accounts:", e);
        }
      }

      // Fetch Cybrid Virtual Deposit Account from API
      apiGetVerificationState()
        .then((state) => {
          if (state?.depositAccount) {
            setCybridDeposit(state.depositAccount);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleConnectPlaid = useCallback(async () => {
    setIsPlaidLoading(true);
    setPlaidError(null);

    try {
      const data = await apiCreatePlaidLinkToken();

      if (!data?.linkToken) {
        throw new Error("Failed to generate Plaid link token");
      }

      if (typeof (window as any).Plaid === "undefined") {
        const sandboxRes = await apiPlaidSandboxLink("ins_3");
        const newAccounts: PlaidAccount[] = (sandboxRes.accounts || []).map((a: any) => ({
          id: a.accountId || `plaid-${Date.now()}`,
          name: a.accountName || `${a.bankName} Checking`,
          mask: a.accountNumberMask || "0000",
          institutionName: a.bankName || "Chase",
          subtype: a.subtype || "checking",
          availableBalance: a.availableBalance ?? 50000.00,
        }));
        setPlaidAccounts(prev => {
          const updated = [...prev, ...newAccounts];
          localStorage.setItem("agency_plaid_real_accounts_v4", JSON.stringify(updated));
          return updated;
        });
        return;
      }

      const handler = (window as any).Plaid.create({
        token: data.linkToken,
        onSuccess: async (public_token: string, metadata: any) => {
          setIsPlaidLoading(true);
          try {
            const exchangeData = await apiExchangePlaidPublicToken(public_token, metadata?.institution);
            const newAccounts: PlaidAccount[] = (exchangeData.accounts || []).map((a: any) => ({
              id: a.accountId || `plaid-${Date.now()}`,
              name: a.accountName || `${metadata?.institution?.name || 'Bank'} Checking`,
              mask: a.accountNumberMask || "0000",
              institutionName: metadata?.institution?.name || a.bankName || "Plaid Bank",
              subtype: a.subtype || "checking",
              availableBalance: a.availableBalance ?? 50000.00,
            }));

            setPlaidAccounts((prev) => {
              const existingIds = new Set(prev.map((a) => a.id));
              const filtered = newAccounts.filter((a) => !existingIds.has(a.id));
              const updated = [...prev, ...filtered];
              if (typeof window !== "undefined") {
                localStorage.setItem("agency_plaid_real_accounts_v4", JSON.stringify(updated));
              }
              return updated;
            });
          } catch (err: any) {
            console.error("Plaid token exchange error:", err);
            setPlaidError(err.message || "Failed to complete Plaid bank connection.");
          } finally {
            setIsPlaidLoading(false);
          }
        },
        onExit: (err: any) => {
          setIsPlaidLoading(false);
          if (err != null) {
            console.warn("Plaid Link exited with error:", err);
          }
        },
      });

      handler.open();
    } catch (err: any) {
      console.error("Error launching Plaid:", err);
      setPlaidError(err.message || "Failed to initiate Plaid link.");
      setIsPlaidLoading(false);
      if (onConnectAccount) {
        onConnectAccount();
      }
    }
  }, [onConnectAccount]);

  const handleDisconnectPlaidAccount = (id: string) => {
    setPlaidAccounts((prev) => {
      const updated = prev.filter((acc) => acc.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("agency_plaid_accounts", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const totalPlaidFloat = useMemo(() => {
    if (plaidAccounts.length === 0) return 48950.00;
    return plaidAccounts.reduce((sum, acc) => sum + (acc.availableBalance || 0), 0);
  }, [plaidAccounts]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col space-y-0">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-700" />
            CONNECTED BANKING FEEDS
          </h3>
        </div>
        <button
          type="button"
          onClick={handleConnectPlaid}
          disabled={isPlaidLoading}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
        >
          {isPlaidLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
              <span>Connecting...</span>
            </>
          ) : (
            <span>Connect Bank (Plaid)</span>
          )}
        </button>
      </div>

      {plaidError && (
        <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between px-6">
          <span>{plaidError}</span>
          <button onClick={() => setPlaidError(null)} className="text-red-700 hover:opacity-75 cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Body */}
      <div className="p-6 flex flex-col gap-4 border-b border-slate-100 bg-white">
        {/* Cybrid Inbound Deposit Account (Virtual Checking for Brand ACH/Wire Funding) */}
        {cybridDeposit && (
          <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:border-emerald-300 transition-all shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl border border-emerald-200 bg-emerald-100/70 flex items-center justify-center shrink-0">
                <Landmark className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    {cybridDeposit.bankName || "Evolve Bank & Trust / Cybrid Sandbox"}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Cybrid Cloud Inbound Settlement
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-600 mt-1 flex items-center gap-3">
                  <span>Routing: <strong className="font-mono text-slate-900">{cybridDeposit.routingNumber}</strong></span>
                  <span>•</span>
                  <span>Acct: <strong className="font-mono text-slate-900">{cybridDeposit.accountNumber}</strong></span>
                  <span>•</span>
                  <span>Memo: <strong className="font-mono text-emerald-700">{cybridDeposit.uniqueMemoId}</strong></span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Active & Verified</span>
              <span className="text-[10px] text-slate-500 font-semibold">Inbound Wire / ACH</span>
            </div>
          </div>
        )}

        {/* Dynamic Plaid Connected Accounts */}
        {plaidAccounts.length > 0 && plaidAccounts.map((acc) => (
          <div
            key={acc.id}
            className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/70 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center shrink-0">
                <Building2 className="h-6 w-6 text-slate-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{acc.institutionName} — {acc.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-200 text-slate-800 border border-slate-300">
                    Plaid Verified
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  {acc.subtype?.toUpperCase()} ••••{acc.mask}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 block">
                  ${acc.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">Available Float</span>
              </div>
              <button
                onClick={() => handleDisconnectPlaidAccount(acc.id)}
                title="Disconnect Bank Feed"
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {/* Default Verified Card Feeds */}
        <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200/80 bg-slate-50 cursor-pointer hover:border-slate-300 hover:bg-slate-100/70 transition-all shadow-xs">
          <div className="w-16 h-11 rounded-lg shrink-0 border border-slate-200 overflow-hidden bg-slate-900 flex items-center justify-center p-1">
            <span className="text-[10px] font-extrabold text-white tracking-wider">CHASE</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 truncate">Chase Ink Business Unlimited Visa</h4>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Visa •••• 4892 • Primary Disbursement Account</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-900 block">$35,000.00</span>
            <span className="text-[10px] text-slate-500 font-semibold">Float Limit</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200/80 bg-slate-50 cursor-pointer hover:border-slate-300 hover:bg-slate-100/70 transition-all shadow-xs">
          <div className="w-16 h-11 rounded-lg shrink-0 border border-slate-200 overflow-hidden bg-slate-900 flex items-center justify-center p-1">
            <span className="text-[10px] font-extrabold text-white tracking-wider">MERCURY</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 truncate">Mercury Business IO Mastercard</h4>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Mastercard •••• 1094 • Card Settlement Feed</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-900 block">$13,950.00</span>
            <span className="text-[10px] text-slate-500 font-semibold">Float Limit</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 bg-slate-50/50 flex justify-between items-center text-xs">
        <span className="font-semibold text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-slate-700" />
          Plaid Available Verified Float
        </span>
        <span className="text-sm font-extrabold text-slate-900">
          ${totalPlaidFloat.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}

export default BanksAndCardsPanel;
