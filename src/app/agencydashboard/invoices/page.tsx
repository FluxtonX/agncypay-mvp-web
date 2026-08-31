"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  Search,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Landmark,
  Lock,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  X
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { subscribeInvoicesByBrand, subscribeInvoicesByAgency, apiCreateInvoice } from "../../../lib/api/invoices";

interface SplitItem {
  name: string;
  role: "Talent" | "Agency";
  percentage: number;
  amount: number;
  walletId: string;
  avatar: string;
}

interface VendorItem {
  name: string;
  role: "Vendor";
  amount: number;
  walletId: string;
  avatar: string;
}

interface InvoiceMock {
  id: string;
  campaignName: string;
  brandName: string;
  createdDate: string;
  dueDate: string;
  amount: number;
  location: string;
  costCenter: string;
  initials: string[];
  vendorFee: VendorItem;
  splitPool: {
    total: number;
    splits: SplitItem[];
  };
  status: "awaiting_approval" | "processing" | "settled" | "rejected" | "talent_disbursed";
  defaultTerm: "Net-30" | "Net-60" | "Net-90";
}

const INITIAL_INVOICES: InvoiceMock[] = [];

export default function InvoicesQueuePage() {
  const router = useRouter();
  const { state, resetState, refreshUser } = useApp();
  const workspaceType = state.user ? state.user.accountType : "brand";

  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    if (state.user && state.user.kybStatus !== "approved") {
      refreshUser();
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("agncypay_theme_agency");
      if (savedTheme) {
        if (savedTheme === "light") {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
          setIsLightTheme(true);
        } else {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
          setIsLightTheme(false);
        }
      } else {
        if (true) {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
          setIsLightTheme(true);
        } else {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
          setIsLightTheme(false);
        }
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

  const [invoices, setInvoices] = useState<InvoiceMock[]>([]);
  const [activeMainTab, setActiveMainTab] = useState<"receivables" | "payables">("receivables");
  const [activeReceivableFilter, setActiveReceivableFilter] = useState<"all" | "awaiting_approval" | "settled">("awaiting_approval");
  const [activePayableFilter, setActivePayableFilter] = useState<"all" | "pending_payout" | "disbursed">("pending_payout");
  const [searchQuery, setSearchQuery] = useState("");
  const [showKybModal, setShowKybModal] = useState(false);

  useEffect(() => {
    const userEmail = state.user?.email;
    if (!userEmail) {
      setInvoices([]);
      return;
    }

    const handleInvoicesUpdate = (invoicesList: any[]) => {
      const mappedList: InvoiceMock[] = invoicesList.map((inv) => {
        let uiStatus: "awaiting_approval" | "settled" | "talent_disbursed" = "awaiting_approval";
        if (inv.status === "paid") {
          uiStatus = inv.talentPayoutStatus === "disbursed" ? "talent_disbursed" : "settled";
        }
        
        const numAmount = typeof inv.amount === "number" ? inv.amount : (Number(inv.amount) || 0);
        
        return {
          id: inv.id,
          campaignName: inv.campaign || "Services Rendered",
          brandName: inv.brandName || "Brand Partner",
          createdDate: inv.createdDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          dueDate: inv.due || "Net-30",
          amount: numAmount,
          location: "Escrow Wallet Active",
          costCenter: "Marketing (Campaign Pool)",
          initials: [(inv.agency || "A").charAt(0).toUpperCase()],
          defaultTerm: "Net-30",
          status: uiStatus,
          vendorFee: {
            name: "Processing Fee",
            role: "Vendor",
            amount: numAmount * 0.1,
            walletId: "@agncypay",
            avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&auto=format&fit=crop&q=80"
          },
          splitPool: {
            total: numAmount * 0.9,
            splits: [
              { name: inv.talent || "Talent Partner", role: "Talent", percentage: 85, amount: numAmount * 0.9 * 0.85, walletId: "@talent", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80" },
              { name: inv.agency || "Agency", role: "Agency", percentage: 15, amount: numAmount * 0.9 * 0.15, walletId: "@agency", avatar: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=80&auto=format&fit=crop&q=80" }
            ]
          }
        };
      });
      setInvoices(mappedList);
    };

    let unsubscribe = () => {};
    if (workspaceType === "brand") {
      unsubscribe = subscribeInvoicesByBrand(userEmail, handleInvoicesUpdate);
    } else {
      unsubscribe = subscribeInvoicesByAgency(userEmail, handleInvoicesUpdate);
    }

    return () => unsubscribe();
  }, [state.user, workspaceType]);

  const handleLogout = () => {
    resetState();
    router.push("/auth/login");
  };

  // Filter logic
  const filteredInvoices = invoices.filter(inv => {
    const isReceivable = activeMainTab === "receivables";
    
    // Determine if it matches the sub-filter
    let matchesFilter = true;
    if (isReceivable) {
      if (activeReceivableFilter !== "all") {
        const uiStatus = (inv.status === "settled" || inv.status === "talent_disbursed") ? "settled" : "awaiting_approval";
        matchesFilter = uiStatus === activeReceivableFilter;
      }
    } else {
      if (activePayableFilter !== "all") {
        const uiStatus = inv.status === "talent_disbursed" ? "disbursed" : "pending_payout";
        matchesFilter = uiStatus === activePayableFilter;
      }
    }

    const matchesSearch = inv.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (!isReceivable && inv.splitPool.splits.some(s => s.role === "Talent" && s.name.toLowerCase().includes(searchQuery.toLowerCase())));
                          
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased relative transition-colors duration-200">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-border-custom bg-background/90 sticky top-0 z-50 shadow-sm backdrop-blur">
        <div className="max-w-[1520px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative flex items-center mr-12">
              <Link href="/agencydashboard" className="flex items-center cursor-pointer z-50 hover:opacity-80 transition-opacity">
                <img
                  src="/agncypaybrand.png"
                  alt="AgncyPay"
                  className="h-12 w-auto object-contain scale-[1.56] origin-left transition-transform"
                />
              </Link>
            </div>
            <span className="h-4 w-[1px] bg-white/20 hidden md:block" />
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 light:bg-black/5 border border-white/20 light:border-black/10 text-[11px] font-bold uppercase tracking-wider text-white light:text-[#0F172A]">
              <Building2 className="h-3 w-3 text-white light:text-[#0F172A]" />
              {workspaceType === "brand" ? "Brand Portal" : "Agency Portal"}
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/20">
            <button 
              onClick={() => router.push("/agencydashboard")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => router.push("/agencydashboard/invoices")}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-white light:bg-[#0F172A] text-black light:text-white shadow-sm border border-white/20 light:border-black/10 transition-all cursor-pointer"
            >
              Payments
            </button>
            <button 
              onClick={() => router.push("/agencydashboard/wallet")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer flex items-center gap-1.5"
            >
              Wallet
            </button>
            <button 
              onClick={() => router.push("/agencydashboard/contacts")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer flex items-center gap-1.5"
            >
              Contacts
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {workspaceType === "agency" && (
              <>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/40 light:bg-[#0F172A]/40 text-black/40 light:text-white/40 border border-white/10 light:border-black/5 shadow-sm transition-all flex items-center gap-1.5 cursor-not-allowed blur-[0.6px]"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Switch to Agency Banking
                  </button>
                  <button 
                    onClick={() => alert("Agency Banking is currently locked. Complete your compliance verification to unlock this feature.")}
                    className="p-1 text-neutral-400 hover:text-white transition-colors"
                    title="Why is this locked?"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </div>
                <div className="h-4 w-[1px] bg-white/20" />

              </>
            )}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/[0.05] border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                {state.user?.fullName ? state.user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AD"}
              </div>
              <span className={`text-xs font-bold ${isLightTheme ? "text-[#0F172A]" : "text-[#E5E5EA]"} hidden sm:inline`}>
                {state.user?.fullName || "Adidas Corporate"}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer mr-1"
              title="Toggle Theme"
            >
              {isLightTheme ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1520px] w-full mx-auto px-6 py-8 flex-1 flex flex-col gap-6">
        
        <div className="flex items-center gap-2">
          <Link 
            href="/agencydashboard"
            className="p-2 rounded-lg border border-white/20 hover:border-white/20 hover:bg-white/[0.02] text-xs font-bold text-[#8f8f8f] hover:text-white transition-all flex items-center gap-1.5 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <span className="text-xs text-neutral-500">/</span>
          <span className="text-xs text-neutral-300 font-semibold">Approval Queue</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payments Manager</h1>
            <p className="text-xs text-[#8f8f8f] mt-1">Manage brand receivables and talent payables in one place.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                if (state.user && state.user.kybStatus !== "approved") {
                  setShowKybModal(true);
                  return;
                }

                try {
                  await apiCreateInvoice({
                    campaign: `Global Fall Campaign #${Math.floor(100 + Math.random() * 900)}`,
                    agencyName: state.user?.fullName || "Elite Agency",
                    agencyEmail: state.user?.email || "agency@elite.com",
                    brandName: "Adidas Corporate",
                    brandEmail: "martin.safi@adidas.com",
                    amount: 25000 + Math.floor(Math.random() * 15000),
                    due: "30/08/2026",
                  });
                  alert("Invoice created and sent to Adidas Corporate! Check Brand Portal.");
                } catch (e: any) {
                  router.push("/dashboard/send-request");
                }
              }}
              className={`h-10 px-5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0 ${isLightTheme ? "bg-white border border-black/10 text-[#0F172A] hover:bg-neutral-100" : "bg-white/10 hover:bg-white/20 border border-white/20 text-white"}`}
            >
              Request Payment
            </button>
            <button
              onClick={() => {
                if (state.user && state.user.kybStatus !== "approved") {
                  setShowKybModal(true);
                  return;
                }
                alert("Send Payment to Talent flow initiated.");
              }}
              className={`h-10 px-5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0 ${isLightTheme ? "bg-[#0F172A] text-white hover:bg-[#1E293B]" : "bg-white text-black hover:bg-neutral-200"}`}
            >
              Send Payment
            </button>
          </div>
        </div>

        {/* Ambient KYB Notice Banner if not verified */}
        {state.user && state.user.kybStatus !== "approved" && (
          <div className={`rounded-xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md transition-colors ${isLightTheme ? "border-amber-300 bg-amber-50/90 text-amber-950" : "border-amber-500/30 bg-amber-950/20 text-amber-100"}`}>
            <div className="flex items-center gap-3">
              <ShieldAlert className={`w-5 h-5 shrink-0 ${isLightTheme ? "text-amber-700" : "text-amber-400"}`} />
              <div>
                <p className={`text-xs font-bold ${isLightTheme ? "text-amber-900" : "text-amber-200"}`}>Business Verification Required</p>
                <p className={`text-[11px] ${isLightTheme ? "text-amber-800" : "text-amber-300/80"}`}>Complete business verification (KYB) to unlock live ACH/Wire/RTP deposit bank accounts for your invoices.</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/onboarding/business-setup")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-sm ${isLightTheme ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-amber-400 hover:bg-amber-300 text-black"}`}
            >
              <span>Verify Agency</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Tabs */}
        <div className={`flex items-center gap-2 border-b pb-4 ${isLightTheme ? "border-black/10" : "border-white/10"}`}>
          <button
            onClick={() => setActiveMainTab("receivables")}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeMainTab === "receivables"
                ? isLightTheme ? "bg-[#0F172A] text-white shadow" : "bg-white text-black"
                : isLightTheme ? "text-slate-600 hover:text-black hover:bg-slate-100" : "text-[#8f8f8f] hover:text-white hover:bg-white/5"
            }`}
          >
            Receivables (From Brands)
          </button>
          <button
            onClick={() => setActiveMainTab("payables")}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeMainTab === "payables"
                ? isLightTheme ? "bg-[#0F172A] text-white shadow" : "bg-white text-black"
                : isLightTheme ? "text-slate-600 hover:text-black hover:bg-slate-100" : "text-[#8f8f8f] hover:text-white hover:bg-white/5"
            }`}
          >
            Payables (To Talent)
          </button>
        </div>

        {/* Summary Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeMainTab === "receivables" ? (
            <>
              <div className={`border rounded-xl p-5 shadow-sm transition-colors ${isLightTheme ? "bg-white border-black/10" : "bg-[#0A0A0A] border-white/10"}`}>
                <p className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${isLightTheme ? "text-slate-500" : "text-[#8f8f8f]"}`}>Total Expected</p>
                <p className={`text-2xl font-black ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                  ${invoices.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`border rounded-xl p-5 shadow-sm transition-colors ${isLightTheme ? "bg-white border-black/10" : "bg-[#0A0A0A] border-white/10"}`}>
                <p className="text-[11px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-2">Awaiting Brands</p>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  ${invoices.filter(i => i.status === "awaiting_approval").reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`border rounded-xl p-5 shadow-sm transition-colors ${isLightTheme ? "bg-white border-black/10" : "bg-[#0A0A0A] border-white/10"}`}>
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mb-2">Total Settled</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  ${invoices.filter(i => i.status === "settled" || i.status === "talent_disbursed").reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className={`border rounded-xl p-5 shadow-sm transition-colors ${isLightTheme ? "bg-white border-black/10" : "bg-[#0A0A0A] border-white/10"}`}>
                <p className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${isLightTheme ? "text-slate-500" : "text-[#8f8f8f]"}`}>Total Owed to Talent</p>
                <p className={`text-2xl font-black ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                  ${invoices.reduce((acc, curr) => {
                    const talentSplit = curr.splitPool.splits.find(s => s.role === "Talent");
                    return acc + (talentSplit ? (Number(talentSplit.amount) || 0) : 0);
                  }, 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`border rounded-xl p-5 shadow-sm transition-colors ${isLightTheme ? "bg-white border-black/10" : "bg-[#0A0A0A] border-white/10"}`}>
                <p className="text-[11px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-2">Pending Payouts</p>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  ${invoices.filter(i => i.status !== "talent_disbursed").reduce((acc, curr) => {
                    const talentSplit = curr.splitPool.splits.find(s => s.role === "Talent");
                    return acc + (talentSplit ? (Number(talentSplit.amount) || 0) : 0);
                  }, 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`border rounded-xl p-5 shadow-sm transition-colors ${isLightTheme ? "bg-white border-black/10" : "bg-[#0A0A0A] border-white/10"}`}>
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mb-2">Total Disbursed</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  ${invoices.filter(i => i.status === "talent_disbursed").reduce((acc, curr) => {
                    const talentSplit = curr.splitPool.splits.find(s => s.role === "Talent");
                    return acc + (talentSplit ? (Number(talentSplit.amount) || 0) : 0);
                  }, 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Search & Tabs Controls */}
        <div className={`flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center p-3 rounded-xl border transition-colors ${isLightTheme ? "bg-white border-black/10 shadow-sm" : "bg-[#050505] border-white/20"}`}>
          <div className="flex flex-wrap gap-2">
            {activeMainTab === "receivables" ? (
              [
                { id: "all", label: "All Invoices" },
                { id: "awaiting_approval", label: "Awaiting Brand" },
                { id: "settled", label: "Settled" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveReceivableFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                    activeReceivableFilter === tab.id
                      ? isLightTheme ? "bg-[#0F172A] text-white font-bold shadow-sm" : "bg-white text-black font-bold"
                      : isLightTheme ? "text-slate-600 hover:text-black hover:bg-slate-100" : "text-[#8f8f8f] hover:text-white bg-transparent hover:bg-white/[0.02]"
                  }`}
                >
                  {tab.label}
                  {tab.id === "awaiting_approval" && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${isLightTheme ? "bg-amber-100 text-amber-800" : "bg-[#10b981]/10 text-[#10b981]"}`}>
                      {invoices.filter(i => i.status === "awaiting_approval").length}
                    </span>
                  )}
                </button>
              ))
            ) : (
              [
                { id: "all", label: "All Payouts" },
                { id: "pending_payout", label: "Pending Payout" },
                { id: "disbursed", label: "Disbursed" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActivePayableFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                    activePayableFilter === tab.id
                      ? isLightTheme ? "bg-[#0F172A] text-white font-bold shadow-sm" : "bg-white text-black font-bold"
                      : isLightTheme ? "text-slate-600 hover:text-black hover:bg-slate-100" : "text-[#8f8f8f] hover:text-white bg-transparent hover:bg-white/[0.02]"
                  }`}
                >
                  {tab.label}
                  {tab.id === "pending_payout" && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${isLightTheme ? "bg-amber-100 text-amber-800" : "bg-amber-500/10 text-amber-500"}`}>
                      {invoices.filter(i => i.status !== "talent_disbursed").length}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="relative md:w-80">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isLightTheme ? "text-slate-400" : "text-[#8f8f8f]"}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search campaign, invoice ID..."
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border outline-none transition-colors ${
                isLightTheme
                  ? "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400"
                  : "bg-black/50 border-white/10 text-white placeholder:text-[#8f8f8f] focus:border-white/30"
              }`}
            />
          </div>
        </div>

        {/* Invoices List Grid */}
        <div className={`rounded-2xl border overflow-hidden shadow-md transition-colors ${isLightTheme ? "bg-white border-black/10" : "bg-[#050505] border-white/20"}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-bold transition-colors ${isLightTheme ? "border-slate-200 bg-slate-50/80 text-slate-600" : "border-white/20 bg-white/[0.01] text-[#8f8f8f]"}`}>
                  <th className="p-4">Invoice ID</th>
                  {activeMainTab === "receivables" ? (
                    <>
                      <th className="p-4">Brand / Campaign</th>
                      <th className="p-4 text-right">Expected Amount</th>
                    </>
                  ) : (
                    <>
                      <th className="p-4">Talent / Campaign</th>
                      <th className="p-4 text-right">Payout Amount</th>
                    </>
                  )}
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLightTheme ? "divide-slate-100" : "divide-white/[0.04]"}`}>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`p-8 text-center ${isLightTheme ? "text-slate-400" : "text-[#8f8f8f]"}`}>
                      No invoices match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    return (
                      <tr
                        key={inv.id}
                        onClick={() => router.push(`/agencydashboard/invoices/${inv.id}`)}
                        className={`cursor-pointer transition-colors group ${isLightTheme ? "hover:bg-slate-50" : "hover:bg-white/[0.02]"}`}
                      >
                        <td className={`p-4 font-mono font-bold ${isLightTheme ? "text-slate-600" : "text-neutral-400"}`}>{inv.id}</td>
                        {activeMainTab === "receivables" ? (
                          <>
                            <td className="p-4">
                              <p className={`font-bold ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>{inv.brandName}</p>
                              <p className={`text-[10px] mt-0.5 ${isLightTheme ? "text-slate-500" : "text-neutral-500"}`}>{inv.campaignName}</p>
                            </td>
                            <td className={`p-4 text-right font-black ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                              ${(Number(inv.amount) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-4">
                              <p className={`font-bold ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>{inv.splitPool.splits.find(s => s.role === "Talent")?.name || "Talent"}</p>
                              <p className={`text-[10px] mt-0.5 ${isLightTheme ? "text-slate-500" : "text-neutral-500"}`}>{inv.campaignName}</p>
                            </td>
                            <td className={`p-4 text-right font-black ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                              ${(Number(inv.splitPool.splits.find(s => s.role === "Talent")?.amount) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </>
                        )}
                        <td className="p-4 text-center">
                          {activeMainTab === "receivables" ? (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              inv.status === "awaiting_approval" 
                                ? isLightTheme ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse" : "bg-amber-950/60 text-amber-300 border border-amber-800/30 animate-pulse" 
                                : isLightTheme ? "bg-emerald-100 text-emerald-900 border border-emerald-300" : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/30"
                            }`}>
                              {inv.status === "awaiting_approval" ? "Awaiting Brand" : "Settled"}
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              inv.status === "talent_disbursed"
                                ? isLightTheme ? "bg-emerald-100 text-emerald-900 border border-emerald-300" : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/30"
                                : isLightTheme ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-amber-950/60 text-amber-300 border border-amber-800/30"
                            }`}>
                              {inv.status === "talent_disbursed" ? "Disbursed" : "Pending Payout"}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <ChevronRight className={`h-4 w-4 inline-block transition-transform group-hover:translate-x-0.5 ${isLightTheme ? "text-slate-400 group-hover:text-slate-900" : "text-neutral-500 group-hover:text-white"}`} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-black py-8 text-xs text-neutral-400 mt-12">
        <div className="max-w-[1520px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/agncypaybrand.png" alt="AgncyPay" className="h-8 w-auto filter contrast-125" />
            <p>© 2026 AgncyPay. All rights reserved.</p>
          </div>
          <div className="flex gap-6 font-semibold">
            <a href="#" className="hover:text-white transition-colors">Integration Help</a>
            <a href="#" className="hover:text-white transition-colors">ERP Integration API</a>
            <a href="#" className="hover:text-white transition-colors">Security Rules</a>
          </div>
        </div>
      </footer>

      {/* KYB Gatekeeper Modal */}
      {showKybModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0D0D0D] border border-white/20 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowKybModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Business Verification Required</h3>
                <p className="text-xs text-neutral-400">Cybrid Inbound Banking & Invoicing</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              To create and issue invoices with dedicated ACH/Wire/RTP deposit bank accounts, your agency legal entity must complete business verification (KYB).
            </p>

            <div className="rounded-xl border border-white/10 bg-black/50 p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Dedicated ACH & Wire Virtual Account Number</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Automated Brand Payment Settlement</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Instant Talent Payout Disbursements</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowKybModal(false)}
                className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-neutral-400 hover:text-white transition-all cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={() => router.push("/onboarding/business-setup")}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <span>Verify Agency Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
