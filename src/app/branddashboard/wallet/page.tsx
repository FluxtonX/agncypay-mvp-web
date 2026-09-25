"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { 
  CreditCard, 
  Landmark, 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Coins, 
  Building2, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  RefreshCw, 
  Lock, 
  ExternalLink, 
  Award,
  Wallet as WalletIcon,
  HelpCircle,
  MapPin,
  Home as HomeIcon,
  Gift,
  Check,
  X,
  Sun,
  Moon,
  Loader2,
  Link2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    id: "card-mc",
    type: "card",
    title: "Mastercard Commercial",
    subtitle: "Primary Corporate Card",
    last4: "8597",
    brand: "mastercard",
    gradient: "from-[#F8FAFC] via-[#E2E8F0] to-[#CBD5E1] border-neutral-300 text-slate-900 font-bold",
    isDefault: true
  },
  {
    id: "card-escrow",
    type: "card",
    title: "Escrow Campaign Card",
    subtitle: "Dedicated Campaign Reserve",
    last4: "4210",
    brand: "visa",
    gradient: "from-[#1e1b4b] via-[#312e81] to-[#17153B] border-[#818cf8]/40 text-indigo-100 force-white-text"
  }
];

const INITIAL_ACCOUNTS: WalletItem[] = [
  {
    id: "acc-jpm",
    type: "account",
    title: "JPMorgan Chase Commercial",
    subtitle: "Operating Account • Verified",
    last4: "4419",
    brand: "bank",
    gradient: "from-[#0284c7] via-[#0369a1] to-[#075985] border-sky-400/40 text-white force-white-text",
    isDefault: true
  },
  {
    id: "acc-svb",
    type: "account",
    title: "Silicon Valley Bank",
    subtitle: "Payroll & Talent Disbursal Hub",
    last4: "8821",
    brand: "bank",
    gradient: "from-[#0f766e] via-[#115e59] to-[#134e4a] border-teal-400/40 text-white force-white-text"
  },
  {
    id: "acc-scotia",
    type: "account",
    title: "Scotiabank Escrow Settlement",
    subtitle: "Canadian Dollar Reserve • Verified",
    last4: "1092",
    brand: "bank",
    gradient: "from-[#991b1b] via-[#7f1d1d] to-[#450a0a] border-red-500/40 text-white force-white-text"
  }
];

export default function WalletDashboardPage() {
  const router = useRouter();
  const { state } = useApp();
  const workspaceType = state.user ? state.user.accountType : "brand";

  const [isLightTheme, setIsLightTheme] = useState(true);
  const [activeTab, setActiveTab] = useState<"cards" | "accounts">("cards");
  const [cards, setCards] = useState<WalletItem[]>(INITIAL_CARDS);
  const [accounts, setAccounts] = useState<WalletItem[]>(INITIAL_ACCOUNTS);
  const [selectedItemId, setSelectedItemId] = useState<string | null>("card-mc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Card/Account Form State
  const [newTitle, setNewTitle] = useState("");
  const [newLast4, setNewLast4] = useState("");
  const [newType, setNewType] = useState<"mastercard" | "visa" | "amex" | "bank">("mastercard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Deposit state for Treasury Pool Card
  const [depositedBalance, setDepositedBalance] = useState(25000);
  const [officialWalletId, setOfficialWalletId] = useState<string>("WAL-BRND-901824");
  const [depositAmount, setDepositAmount] = useState("1000");
  const [depositMethod, setDepositMethod] = useState<"card" | "ach" | "wire" | "rtp">("card");
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  useEffect(() => {
    async function loadWallet() {
      try {
        const { apiGetMyWallet } = await import("../../../lib/api/wallets");
        const wallet = await apiGetMyWallet();
        if (wallet) {
          setOfficialWalletId(wallet.walletId);
          setDepositedBalance(wallet.balance);
        }
      } catch (err) {
        // Fallback
      }
    }
    loadWallet();

    if (typeof window !== "undefined") {
      const userEmail = state.user?.email || "guest";
      const savedBalance = localStorage.getItem(`brand_deposited_balance_${userEmail}`);
      if (savedBalance) {
        setDepositedBalance(parseFloat(savedBalance));
      }
    }
  }, [state.user]);


  const handleConfirmDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmt = parseFloat(depositAmount);
    if (isNaN(numericAmt) || numericAmt <= 0) return;

    setIsProcessingDeposit(true);
    setTimeout(() => {
      const userEmail = state.user?.email || "guest";
      const updated = depositedBalance + numericAmt;
      setDepositedBalance(updated);
      localStorage.setItem(`brand_deposited_balance_${userEmail}`, updated.toString());
      setIsProcessingDeposit(false);
      setDepositSuccessMsg(`Successfully deposited $${numericAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} into AGNCYPAY Treasury!`);
      setTimeout(() => {
        setDepositSuccessMsg(null);
        setDepositAmount("1000");
      }, 3000);
    }, 1000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("agncypay_theme_brand");
      if (savedTheme === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        setIsLightTheme(true);
      } else if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        setIsLightTheme(false);
      } else {
        const isLight = document.documentElement.classList.contains("light");
        setIsLightTheme(isLight);
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
      localStorage.setItem("agncypay_theme_brand", isLight ? "light" : "dark");
    }
  };

  const items = activeTab === "cards" ? cards : accounts;
  const selectedItem = items.find(i => i.id === selectedItemId);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newLast4) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newItem: WalletItem = {
        id: `item-${Date.now()}`,
        type: activeTab === "cards" ? "card" : "account",
        title: newTitle,
        subtitle: activeTab === "cards" ? "Linked Corporate Card • Verified" : "Linked Bank Account • Verified",
        last4: newLast4.slice(-4),
        brand: activeTab === "cards" ? (newType as any) : "bank",
        gradient: activeTab === "cards" 
          ? "from-[#334155] via-[#1E293B] to-[#0F172A] border-white/30 text-white force-white-text"
          : "from-[#0369a1] via-[#075985] to-[#0c4a6e] border-sky-400/40 text-white force-white-text"
      };

      if (activeTab === "cards") {
        setCards(prev => [...prev, newItem]);
      } else {
        setAccounts(prev => [...prev, newItem]);
      }

      setIsSubmitting(false);
      setSuccessMsg("Successfully linked to your AgncyPay Wallet!");
      setSelectedItemId(newItem.id);

      setTimeout(() => {
        setSuccessMsg("");
        setNewTitle("");
        setNewLast4("");
      }, 1200);
    }, 1000);
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/branddashboard"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 hover:text-slate-900 shadow-2xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs text-slate-600 font-semibold">Corporate Treasury & Brand Wallet</span>
        </div>

        {/* Top Wallet Hero Card & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WalletCard
              title="Brand Treasury & Escrow Reserve"
              totalBalance={depositedBalance}
              availableBalance={depositedBalance * 0.85}
              pendingBalance={depositedBalance * 0.15}
              accountNumber={officialWalletId}
              network="Cybrid FDIC Clearing"
              onSend={() => router.push("/branddashboard/invoices")}
              onReceive={() => setIsDepositModalOpen(true)}
            />
          </div>
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Corporate Settlement</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Live Clearing
                </span>
              </div>
              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">ACH Direct Clearing</span>
                  <span className="font-mono font-bold text-slate-900">021000021</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Virtual Deposit #</span>
                  <span className="font-mono font-bold text-slate-900">8829104821</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Custody Partner</span>
                  <span className="font-semibold text-slate-900">Cross River Bank</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">Yield / Liquidity APR</span>
              <span className="text-xs font-bold text-emerald-600">4.85% APY Treasury</span>
            </div>
          </div>
        </div>

        {/* Title & Toggle Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              Payment Methods & Treasury Lines
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Manage commercial credit cards, treasury lines, and automated settlement bank accounts.
            </p>
          </div>

          {/* Pill Toggle for Cards | Accounts */}
          <div className="p-1 rounded-xl flex items-center gap-1 shadow-2xs border border-slate-200 bg-slate-100">
            <button
              onClick={() => {
                setActiveTab("cards");
                setSelectedItemId(cards[0]?.id || null);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "cards"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Cards ({cards.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("accounts");
                setSelectedItemId(accounts[0]?.id || null);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "accounts"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Accounts ({accounts.length})</span>
            </button>
          </div>
        </div>

        {/* Carousel / Card Selector Row */}
        <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none">
          {/* Add Card / Account Button Tile */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="shrink-0 w-64 h-40 rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-700">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">
              {activeTab === "cards" ? "Add New Card" : "Link Bank Account"}
            </span>
          </button>

          {/* Item Tiles */}
          {items.map((item) => {
            const isSelected = selectedItemId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`shrink-0 w-64 h-40 rounded-2xl ${item.image ? "p-0" : "p-5"} bg-gradient-to-br ${item.gradient} border transition-all flex flex-col justify-between text-left cursor-pointer relative overflow-hidden shadow-xs ${
                  isSelected
                    ? "ring-2 ring-slate-900 ring-offset-2 ring-offset-slate-50 scale-[1.02] shadow-md"
                    : "opacity-90 hover:opacity-100 hover:scale-[1.01]"
                }`}
              >
                {item.image ? (
                  <>
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover scale-[1.26] transition-transform duration-500 hover:scale-[1.32]" />
                    {item.isDefault && (
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-black/80 text-white backdrop-blur-sm border border-white/20 z-10 shadow-md">
                        Default
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start w-full">
                      <span className="text-[11px] font-extrabold truncate w-40">{item.title}</span>
                      {item.brand === "mastercard" && (
                        <div className="flex -space-x-1">
                          <div className="w-4 h-4 rounded-full bg-red-500/80" />
                          <div className="w-4 h-4 rounded-full bg-amber-500/80" />
                        </div>
                      )}
                      {item.brand === "visa" && <span className="text-[10px] font-black italic tracking-widest">VISA</span>}
                      {item.brand === "agncypay" && <Sparkles className="w-3.5 h-3.5 text-sky-400" />}
                      {item.brand === "bank" && <Landmark className="w-3.5 h-3.5 opacity-80" />}
                      {item.brand === "treasury" && <Coins className="w-3.5 h-3.5 text-amber-300" />}
                    </div>

                    <div>
                      <p className="text-[10px] opacity-75 font-medium truncate">{item.subtitle}</p>
                      <p className="text-xs font-mono font-bold tracking-wider mt-0.5">
                        {item.last4 === "APPLY" || item.last4 === "POOL" ? item.last4 : `•••• ${item.last4}`}
                      </p>
                    </div>

                    {item.isDefault && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-white/20 backdrop-blur-sm force-white-text">
                        Default
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content Showcase (Below Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Container - Card Details & Controls */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs flex flex-col justify-between min-h-[360px] relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <h2 className="text-base font-bold text-slate-900">
                  {selectedItem ? "Card Details & Controls" : "Select an Instrument"}
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
                        <h4 className="text-sm font-bold text-slate-900">{selectedItem?.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{selectedItem?.subtitle}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs block text-slate-400 font-medium">Card Number</span>
                        <span className="text-sm font-mono font-bold text-slate-900">
                          {selectedItem?.last4 === "APPLY" ? "APPLY" : `•••• •••• •••• ${selectedItem?.last4}`}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/70 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Status</span>
                        <span className="font-semibold text-emerald-600">Connected & Verified</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Type</span>
                        <span className="font-semibold uppercase text-slate-800">{selectedItem?.brand || "Visa"}</span>
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
                  <p className="text-xs font-semibold text-slate-400">Select an instrument to view controls</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Container */}
          <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-50 flex items-center justify-center p-4">
            <img 
              src="/walletleftbottomimage.png" 
              alt="Global Money Benefits" 
              className="w-full h-auto max-h-[320px] object-contain"
            />
          </div>
        </div>
      </div>

      {/* Deposit Treasury Funds Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setIsDepositModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Deposit Treasury Funds</h3>
                <p className="text-xs text-slate-500">Fund your corporate escrow reserve pool</p>
              </div>
            </div>

            {depositSuccessMsg ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{depositSuccessMsg}</h4>
                <p className="text-xs text-slate-500 mt-1">Available balance updated in real time.</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmDeposit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">
                    Deposit Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="1000"
                      className="w-full h-11 pl-8 pr-4 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-sm outline-none focus:border-slate-900 focus:bg-white text-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {["1000", "5000", "10000", "25000"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDepositAmount(preset)}
                        className={`py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          depositAmount === preset
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        +${parseInt(preset).toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">
                    Deposit Rail
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "ach", label: "ACH Direct", sub: "Same Day" },
                      { id: "wire", label: "Fedwire", sub: "1 Hour" },
                      { id: "rtp", label: "Real-Time", sub: "Instant" },
                      { id: "card", label: "Card Line", sub: "Instant" },
                    ].map((rail) => (
                      <button
                        key={rail.id}
                        type="button"
                        onClick={() => setDepositMethod(rail.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          depositMethod === rail.id
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <span className="block text-xs font-bold">{rail.label}</span>
                        <span className={`block text-[10px] mt-0.5 ${depositMethod === rail.id ? "text-slate-300" : "text-slate-400"}`}>
                          {rail.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessingDeposit}
                    className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isProcessingDeposit ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authorizing Clearing Rail...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Deposit of ${Number(depositAmount || 0).toLocaleString()}</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Plaid Link Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl relative text-slate-900">
            <button 
              onClick={() => {
                if (!isSubmitting) {
                  setIsAddModalOpen(false);
                  setSuccessMsg("");
                }
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {successMsg ? (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">{successMsg}</h4>
                <p className="text-xs mt-1 text-slate-500">Updating your wallet instruments...</p>
              </div>
            ) : (
              <div className="py-4 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border bg-slate-50 border-slate-200 text-slate-500">
                  <Link2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeTab === "cards" ? "Link Commercial Card via Plaid" : "Link Settlement Bank Account via Plaid"}
                </h3>
                <p className="text-xs mt-2 max-w-sm leading-relaxed mb-6 text-slate-500">
                  Securely authenticate and link your commercial accounts using 256-bit bank-grade encryption.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitting(true);
                    setTimeout(() => {
                      setIsSubmitting(false);
                      setSuccessMsg(activeTab === "cards" ? "Corporate Mastercard connected successfully!" : "Chase checking connected successfully!");
                      const newId = `item-${Date.now()}`;
                      if (activeTab === "cards") {
                        setCards(prev => [
                          ...prev,
                          {
                            id: newId,
                            type: "card",
                            title: "Plaid Corporate Card",
                            subtitle: "Linked Corporate Card • Verified",
                            last4: "4920",
                            brand: "mastercard",
                            gradient: "from-[#334155] via-[#1E293B] to-[#0F172A] border-white/30 text-white force-white-text"
                          }
                        ]);
                      } else {
                        setAccounts(prev => [
                          ...prev,
                          {
                            id: newId,
                            type: "account",
                            title: "Plaid Operating Checking",
                            subtitle: "Linked Bank Account • Verified",
                            last4: "8829",
                            brand: "bank",
                            gradient: "from-[#0369a1] via-[#075985] to-[#0c4a6e] border-sky-400/40 text-white force-white-text"
                          }
                        ]);
                      }
                      setTimeout(() => {
                        setSelectedItemId(newId);
                        setIsAddModalOpen(false);
                        setSuccessMsg("");
                      }, 1500);
                    }, 1200);
                  }}
                  className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer bg-slate-900 text-white hover:bg-slate-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Connecting Bank Feeds...</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      <span>Link via Plaid Sandbox</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
