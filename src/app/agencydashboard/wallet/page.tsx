"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { 
  CreditCard, 
  Landmark, 
  Plus, 
  Sparkles, 
  Coins, 
  Building2, 
  Wallet as WalletIcon,
  X,
  Sun,
  Moon,
  Loader2,
  Link2,
  Users,
  Check,
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { WalletCard } from "@/components/financial/WalletCard";
import { Money } from "@/components/financial/Money";

interface WalletItem {
  id: string;
  type: "card" | "account";
  title: string;
  subtitle: string;
  last4: string;
  brand: "mastercard" | "visa" | "amex" | "bank" | "treasury" | "agncypay";
  gradient: string;
  isDefault?: boolean;
  image?: string;
}

const INITIAL_CARDS: WalletItem[] = [
  {
    id: "card-agency-mc",
    type: "card",
    title: "Mastercard Agency Commercial",
    subtitle: "Primary Agency Card",
    last4: "3741",
    brand: "mastercard",
    gradient: "from-[#F8FAFC] via-[#E2E8F0] to-[#CBD5E1] border-neutral-300 text-slate-900 font-bold",
    isDefault: true
  },
  {
    id: "card-agency-escrow",
    type: "card",
    title: "Talent Escrow Card",
    subtitle: "Dedicated Talent Payout Reserve",
    last4: "9055",
    brand: "visa",
    gradient: "from-[#1e1b4b] via-[#312e81] to-[#17153B] border-[#818cf8]/40 text-indigo-100 force-white-text"
  }
];

const INITIAL_ACCOUNTS: WalletItem[] = [
  {
    id: "acc-agency-jpm",
    type: "account",
    title: "JPMorgan Chase Agency Account",
    subtitle: "Operating Account • Verified",
    last4: "7712",
    brand: "bank",
    gradient: "from-[#0284c7] via-[#0369a1] to-[#075985] border-sky-400/40 text-white force-white-text",
    isDefault: true
  },
  {
    id: "acc-agency-svb",
    type: "account",
    title: "Silicon Valley Bank",
    subtitle: "Talent Payroll Disbursal Hub",
    last4: "4492",
    brand: "bank",
    gradient: "from-[#0f766e] via-[#115e59] to-[#134e4a] border-teal-400/40 text-white force-white-text"
  },
  {
    id: "acc-agency-boa",
    type: "account",
    title: "Bank of America Business",
    subtitle: "Campaign Reserve Account • Verified",
    last4: "2208",
    brand: "bank",
    gradient: "from-[#991b1b] via-[#7f1d1d] to-[#450a0a] border-red-500/40 text-white force-white-text"
  }
];

export default function AgencyWalletPage() {
  const router = useRouter();
  const { state } = useApp();

  const [isLightTheme, setIsLightTheme] = useState(true);
  const [activeTab, setActiveTab] = useState<"cards" | "accounts">("cards");
  const [cards, setCards] = useState<WalletItem[]>(INITIAL_CARDS);
  const [accounts, setAccounts] = useState<WalletItem[]>(INITIAL_ACCOUNTS);
  const [simulateEmpty, setSimulateEmpty] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>("card-agency-mc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [officialWalletId, setOfficialWalletId] = useState<string>("WAL-AGY-104928");

  useEffect(() => {
    async function loadWallet() {
      try {
        const { apiGetMyWallet } = await import("@/lib/api/wallets");
        const wallet = await apiGetMyWallet();
        if (wallet) {
          setOfficialWalletId(wallet.walletId);
        }
      } catch (err) {
        // Fallback
      }
    }
    loadWallet();

    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("agncypay_theme_agency");
      if (savedTheme === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        setIsLightTheme(true);
      } else if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        setIsLightTheme(false);
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        setIsLightTheme(true);
      }
    }
  }, []);


  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      const isLight = document.documentElement.classList.toggle("light");
      if (isLight) {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }
      setIsLightTheme(isLight);
      localStorage.setItem("agncypay_theme_agency", isLight ? "light" : "dark");
    }
  };

  const rawItems = activeTab === "cards" ? cards : accounts;
  const items = simulateEmpty ? [] : rawItems;
  const selectedItem = items.find(i => i.id === selectedItemId);

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/agencydashboard"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 hover:text-slate-900 shadow-2xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs text-slate-600 font-semibold">Treasury & Agency Wallet</span>
        </div>

        {/* Top Wallet Hero Card & Virtual Routing Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WalletCard
              title="Agency Primary Operating Wallet"
              totalBalance={48500}
              availableBalance={42250}
              pendingBalance={6250}
              accountNumber={officialWalletId}
              network="Cybrid FDIC Clearing"
              onSend={() => router.push("/agencydashboard/invoices")}
              onReceive={() => setIsAddModalOpen(true)}
            />
          </div>
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Virtual Bank Account</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Active
                </span>
              </div>
              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">ACH Routing Number</span>
                  <span className="font-mono font-bold text-slate-900">021000021</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Virtual Account #</span>
                  <span className="font-mono font-bold text-slate-900">9842109841</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Custody Partner</span>
                  <span className="font-semibold text-slate-900">Evolve Bank & Trust</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Talent Disbursal Rail</span>
              <span className="font-bold text-emerald-600">Instant RTP / FedNow</span>
            </div>
          </div>
        </div>

        {/* Title & Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              Payment Methods & Lines
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Manage agency commercial cards, talent payout accounts, and settlement bank accounts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSimulateEmpty(!simulateEmpty)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                simulateEmpty
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {simulateEmpty ? "Show Seeded Data" : "Simulate Empty State"}
            </button>
            <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1">
              <button
                onClick={() => { setActiveTab("cards"); setSelectedItemId(cards[0]?.id || null); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "cards" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Cards ({simulateEmpty ? 0 : cards.length})</span>
              </button>
              <button
                onClick={() => { setActiveTab("accounts"); setSelectedItemId(accounts[0]?.id || null); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "accounts" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Accounts ({simulateEmpty ? 0 : accounts.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card Carousel */}
        <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="shrink-0 w-64 h-40 rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-700">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">{activeTab === "cards" ? "Add New Card" : "Link Bank Account"}</span>
          </button>

          {items.length === 0 && (
            <div className="flex-1 py-8 px-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-700">No {activeTab === "cards" ? "commercial cards" : "settlement accounts"} connected</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Use the card on the left to link your financial rails or toggle back to seeded view.</span>
            </div>
          )}

          {items.map((item) => {
            const isSelected = selectedItemId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`shrink-0 w-64 h-40 rounded-2xl p-5 bg-gradient-to-br ${item.gradient} border transition-all flex flex-col justify-between text-left cursor-pointer relative overflow-hidden shadow-xs ${
                  isSelected
                    ? "ring-2 ring-slate-900 ring-offset-2 ring-offset-slate-50 scale-[1.02] shadow-md"
                    : "opacity-90 hover:opacity-100 hover:scale-[1.01]"
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-[11px] font-extrabold truncate w-40">{item.title}</span>
                  {item.brand === "mastercard" && <div className="flex -space-x-1"><div className="w-4 h-4 rounded-full bg-red-500/80" /><div className="w-4 h-4 rounded-full bg-amber-500/80" /></div>}
                  {item.brand === "visa" && <span className="text-[10px] font-black italic tracking-widest">VISA</span>}
                  {item.brand === "bank" && <Landmark className="w-3.5 h-3.5 opacity-80" />}
                  {item.brand === "treasury" && <Coins className="w-3.5 h-3.5 text-amber-300" />}
                </div>
                <div>
                  <p className="text-[10px] opacity-75 font-medium truncate">{item.subtitle}</p>
                  <p className="text-xs font-mono font-bold tracking-wider mt-0.5">{`•••• ${item.last4}`}</p>
                </div>
                {item.isDefault && <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-white/20 backdrop-blur-sm force-white-text">Default</span>}
              </button>
            );
          })}
        </div>

        {/* Details Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs flex flex-col justify-between min-h-[360px] relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <h2 className="text-base font-bold text-slate-900">
                  {selectedItem ? "Instrument Details & Controls" : "Select an Instrument"}
                </h2>
                {selectedItem && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active {activeTab === "cards" ? "Card" : "Account"}
                  </span>
                )}
              </div>

              {selectedItem ? (
                <>
                  <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/70 mb-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{selectedItem.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{selectedItem.subtitle}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs block text-slate-400 font-medium">{activeTab === "cards" ? "Card Number" : "Account Number"}</span>
                        <span className="text-sm font-mono font-bold text-slate-900">{`•••• •••• •••• ${selectedItem.last4}`}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/70 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Status</span>
                        <span className="font-semibold text-emerald-600">Connected & Verified</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Type</span>
                        <span className="font-semibold uppercase text-slate-800">{selectedItem.brand}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs">
                      Freeze Instrument
                    </button>
                    <button className="py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs">
                      Spending Limits
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
                  <WalletIcon className="w-10 h-10 mb-3 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-400">Select a {activeTab === "cards" ? "card" : "account"} to view controls</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-50 flex items-center justify-center p-4">
            <img src="/walletleftbottomimage.png" alt="Agency Wallet" className="w-full h-auto max-h-[320px] object-contain" />
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl relative text-slate-900">
            <button onClick={() => { if (!isSubmitting) { setIsAddModalOpen(false); setSuccessMsg(""); } }} className="absolute top-4 right-4 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            {successMsg ? (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-emerald-50 text-emerald-600 border border-emerald-200"><Check className="w-6 h-6" /></div>
                <h4 className="text-base font-bold text-slate-900">{successMsg}</h4>
              </div>
            ) : (
              <div className="py-4 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border bg-slate-50 border-slate-200 text-slate-500"><Link2 className="w-7 h-7" /></div>
                <h3 className="text-base font-bold text-slate-900">{activeTab === "cards" ? "Link Agency Card via Plaid" : "Link Bank Account via Plaid"}</h3>
                <p className="text-xs mt-2 max-w-sm leading-relaxed mb-6 text-slate-500">Securely authenticate and link your commercial accounts using 256-bit bank-grade encryption.</p>
                <button
                  onClick={() => {
                    setIsSubmitting(true);
                    setTimeout(() => {
                      const newId = `item-${Date.now()}`;
                      if (activeTab === "cards") {
                        setCards(prev => [...prev, { id: newId, type: "card", title: "Plaid Agency Card", subtitle: "Linked Agency Card • Verified", last4: "4920", brand: "mastercard", gradient: "from-[#334155] via-[#1E293B] to-[#0F172A] border-white/30 text-white force-white-text" }]);
                      } else {
                        setAccounts(prev => [...prev, { id: newId, type: "account", title: "Plaid Checking Account", subtitle: "Linked Bank Account • Verified", last4: "8829", brand: "bank", gradient: "from-[#0369a1] via-[#075985] to-[#0c4a6e] border-sky-400/40 text-white force-white-text" }]);
                      }
                      setIsSubmitting(false);
                      setSuccessMsg(activeTab === "cards" ? "Agency card connected successfully!" : "Bank account connected successfully!");
                      setTimeout(() => { setSelectedItemId(newId); setIsAddModalOpen(false); setSuccessMsg(""); }, 1500);
                    }, 1200);
                  }}
                  className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer bg-slate-900 text-white hover:bg-slate-800"
                >
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Connecting...</span></> : <><Link2 className="w-4 h-4" /><span>Link via Plaid Sandbox</span></>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
