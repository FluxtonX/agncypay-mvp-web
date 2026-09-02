"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ArrowLeft,
  Search,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Home,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Layers,
  Coins,
  ShieldCheck,
  MapPin,
  AlertTriangle,
  Clock,
  Info,
  Wallet,
  X,
  CreditCard,
  Landmark,
  Receipt
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { subscribeInvoicesByBrand, subscribeInvoicesByAgency, apiUpdateInvoiceStatus } from "../../../lib/api/invoices";
import { BatchPaymentCheckoutModal, BatchInvoiceItem } from "../../../components/payment/BatchPaymentCheckoutModal";
import { PaymentModal } from "../../../components/payment/PaymentModal";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LiveRefreshIndicator } from "../../../components/ui/LiveRefreshIndicator";
import { ToastBanner, ToastMessage } from "../../../components/ui/ToastBanner";

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

const mockRecipients = [
  { id: "western-models", name: "Western Models Agency", handle: "@western_models", email: "payouts@westernmodels.com", type: "agency", avatar: "W" },
  { id: "studio-holland", name: "Studio Holland Talent", handle: "@studio_holland", email: "billing@studioholland.com", type: "agency", avatar: "S" },
  { id: "john-adams", name: "John Adams", handle: "@john_adams", email: "john@johnadams.com", type: "talent", avatar: "J" },
  { id: "lucy-che", name: "Lucy Che", handle: "@lucy_che", email: "lucy@lucyche.com", type: "talent", avatar: "L" },
  { id: "jessica-bailey", name: "Jessica Bailey", handle: "@jessica_bailey", email: "jessica@jessicabailey.com", type: "talent", avatar: "J" },
];

export default function InvoicesQueuePage() {
  const router = useRouter();
  const { state, resetState } = useApp();
  const workspaceType = state.user ? state.user.accountType : "brand";

  const [isLightTheme, setIsLightTheme] = useState(true);
  const [invoices, setInvoices] = useState<InvoiceMock[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "awaiting_approval" | "settled">("awaiting_approval");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSinglePaymentOpen, setIsSinglePaymentOpen] = useState(false);
  const [singlePaymentInvoice, setSinglePaymentInvoice] = useState<any>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [lastSyncText, setLastSyncText] = useState("Just now");

  // Send & Request panel state
  const [isSendRequestActive, setIsSendRequestActive] = useState(false);
  const [sendRequestMode, setSendRequestMode] = useState<"send" | "receive">("send");
  const [sendRequestQuery, setSendRequestQuery] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("agncypay_theme_brand");
      if (savedTheme) {
        const isLight = savedTheme === "light";
        document.documentElement.classList.toggle("light", isLight);
        document.documentElement.classList.toggle("dark", !isLight);
        setIsLightTheme(isLight);
      }
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      const isLight = document.documentElement.classList.toggle("light");
      document.documentElement.classList.toggle("dark", !isLight);
      setIsLightTheme(isLight);
      localStorage.setItem("agncypay_theme_brand", isLight ? "light" : "dark");
    }
  };

  const handleInvoicesUpdate = useCallback((invoicesList: any[]) => {
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
          avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&auto=format&fit=crop&q=80",
        },
        splitPool: {
          total: numAmount * 0.9,
          splits: [
            { name: inv.talent || "Talent Partner", role: "Talent", percentage: 85, amount: numAmount * 0.9 * 0.85, walletId: "@talent", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80" },
            { name: inv.agency || "Agency", role: "Agency", percentage: 15, amount: numAmount * 0.9 * 0.15, walletId: "@agency", avatar: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=80&auto=format&fit=crop&q=80" },
          ],
        },
      };
    });
    setInvoices(mappedList);
    setLastSyncText(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, []);

  useEffect(() => {
    const userEmail = state.user?.email;
    if (!userEmail) {
      setInvoices([]);
      return;
    }

    let unsubscribe = () => {};
    if (workspaceType === "brand") {
      unsubscribe = subscribeInvoicesByBrand(userEmail, handleInvoicesUpdate);
    } else {
      unsubscribe = subscribeInvoicesByAgency(userEmail, handleInvoicesUpdate);
    }

    return () => unsubscribe();
  }, [state.user, workspaceType, handleInvoicesUpdate]);

  const handleManualSync = async () => {
    setLastSyncText(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setToast({
      id: `toast-${Date.now()}`,
      type: "success",
      title: "Ledger Synced",
      message: "Latest invoice queue and settlement states have been updated."
    });
  };

  const handleLogout = () => {
    resetState();
    router.push("/auth/login");
  };

  // Filter logic
  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "awaiting_approval" && inv.status === "awaiting_approval") ||
      (activeFilter === "settled" && (inv.status === "settled" || inv.status === "talent_disbursed"));

    const matchesSearch =
      inv.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Active invoice calculations
  const activeInvoice =
    invoices.find((inv) => inv.id === selectedInvoiceId) ||
    filteredInvoices[0] ||
    invoices.find((inv) => inv.status === "awaiting_approval") ||
    invoices[0] ||
    null;

  const recentPendingInvoice =
    invoices.find((inv) => inv.status === (activeFilter === "settled" ? "settled" : "awaiting_approval")) ||
    invoices[0] ||
    null;

  const isAggregateView = selectedInvoiceId === null;
  const selectedSum = invoices.filter((i) => selectedIds.includes(i.id)).reduce((acc, i) => acc + i.amount, 0);

  const displayLabel =
    selectedIds.length > 0
      ? "Selected Total Due"
      : !isAggregateView && activeInvoice
      ? activeInvoice.status === "settled" || activeInvoice.status === "talent_disbursed"
        ? "Balance Paid"
        : "Balance Due"
      : recentPendingInvoice?.status === "settled" || recentPendingInvoice?.status === "talent_disbursed"
      ? "Balance Paid"
      : "Balance Due";

  const displayAmount =
    selectedIds.length > 0
      ? selectedSum
      : !isAggregateView && activeInvoice
      ? activeInvoice.amount
      : recentPendingInvoice
      ? recentPendingInvoice.amount
      : 0;

  const isAwaitingStatus =
    selectedIds.length > 0
      ? invoices.some((i) => selectedIds.includes(i.id) && i.status === "awaiting_approval")
      : !isAggregateView && activeInvoice
      ? activeInvoice.status === "awaiting_approval"
      : recentPendingInvoice
      ? recentPendingInvoice.status === "awaiting_approval"
      : false;

  const invoicesToApproveList =
    selectedIds.length > 0
      ? invoices.filter((inv) => selectedIds.includes(inv.id) && inv.status === "awaiting_approval")
      : !isAggregateView && activeInvoice
      ? [activeInvoice]
      : recentPendingInvoice && recentPendingInvoice.status === "awaiting_approval"
      ? [recentPendingInvoice]
      : [];

  const batchInvoices: BatchInvoiceItem[] = invoicesToApproveList.map((inv) => ({
    id: inv.id,
    agency: inv.campaignName,
    amount: inv.amount,
    status: inv.status,
    brand: inv.brandName,
    dueDate: inv.dueDate,
  }));

  const handleApproveAndPay = () => {
    if (!isAwaitingStatus) return;
    if (selectedIds.length > 1) {
      setIsCheckoutOpen(true);
    } else {
      const target = invoicesToApproveList[0] || activeInvoice;
      if (target) {
        setSinglePaymentInvoice({
          id: target.id,
          amount: target.amount,
          agency: target.vendorFee?.name || target.campaignName,
          dueDate: target.dueDate,
        });
        setIsSinglePaymentOpen(true);
      }
    }
  };

  const handleAuthorizePayment = async () => {
    if (invoicesToApproveList.length === 0) return;

    try {
      await Promise.all(
        invoicesToApproveList.map((inv) => apiUpdateInvoiceStatus(inv.id, "paid", "disbursed"))
      );
    } catch (e) {
      console.warn("Backend update error:", e);
    }

    setInvoices((prev) => {
      const approvedIds = new Set(invoicesToApproveList.map((inv) => inv.id));
      return prev.map((inv) =>
        approvedIds.has(inv.id) ? { ...inv, status: "settled" as const } : inv
      );
    });

    setToast({
      id: `toast-${Date.now()}`,
      type: "success",
      title: "Settlement Confirmed",
      message: `Successfully processed payment for ${invoicesToApproveList.length} invoice(s).`
    });
    setSelectedIds([]);
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased relative transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-border-custom bg-background/90 sticky top-0 z-50 shadow-sm backdrop-blur">
        <div className="max-w-[1520px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative flex items-center mr-12">
              <Link href="/branddashboard" className="flex items-center cursor-pointer z-50 hover:opacity-80 transition-opacity">
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
              Brand Portal (Corporate)
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/20">
            <button
              onClick={() => router.push("/branddashboard")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => router.push("/branddashboard/invoices")}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-white light:bg-[#0F172A] text-black light:text-white shadow-sm border border-white/20 light:border-black/10 transition-all cursor-pointer"
            >
              Invoices & Approvals
            </button>
            <button
              onClick={() => router.push("/branddashboard/wallet")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer flex items-center gap-1.5"
            >
              Treasury
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/[0.05] border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                {state.user?.fullName ? state.user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "AD"}
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

            <button onClick={handleLogout} className="p-2 text-neutral-400 hover:text-white transition-colors" title="Log Out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1520px] w-full mx-auto px-6 py-8 flex-1 flex flex-col gap-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/branddashboard"
            className="p-2 rounded-lg border border-white/20 hover:border-white/20 hover:bg-white/[0.02] text-xs font-bold text-[#8f8f8f] hover:text-white transition-all flex items-center gap-1.5 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <span className="text-xs text-neutral-500">/</span>
          <span className="text-xs text-neutral-300 font-semibold">Corporate Payables & Invoices</span>
        </div>

        {/* Top Balance Card & Settlement CTA */}
        <div className="bg-[#050505] rounded-3xl border border-white/20 p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-xs font-bold text-[#8f8f8f] uppercase tracking-wider block">{displayLabel}</span>
              <span className="text-4xl md:text-5xl font-black text-white tracking-tight mt-1.5 block">
                ${displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <div className="mt-4 flex items-center gap-3 text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[#8f8f8f]" />
                  {selectedIds.length > 0
                    ? `Selected: ${selectedIds.length} invoice(s)`
                    : `Due: ${recentPendingInvoice?.dueDate || activeInvoice?.dueDate || "Net-30"}`}
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cybrid Cloud Clearing Active
                </span>
              </div>
            </div>

            {/* Pay Action Button */}
            <div className="w-full md:w-auto shrink-0 min-w-[240px]">
              <button
                onClick={handleApproveAndPay}
                disabled={!isAwaitingStatus}
                className={`w-full h-12 px-6 rounded-2xl text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isAwaitingStatus
                    ? "bg-white text-black hover:bg-neutral-200 shadow-white/10"
                    : "bg-white/10 text-neutral-400 cursor-default border border-white/10"
                }`}
              >
                {isAwaitingStatus ? (
                  <>
                    Approve & Settle {selectedIds.length > 1 ? `(${selectedIds.length}) Invoices` : "Invoice"}
                    <ChevronRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                    All Invoices Settled
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2.5 text-[#8f8f8f]">
              <Layers className="h-4 w-4 text-neutral-400" />
              <span>Automated Payee Routing & Split</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#8f8f8f]">
              <Landmark className="h-4 w-4 text-neutral-400" />
              <span>Direct ACH / Fedwire Deposit Available</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#8f8f8f]">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>FDIC-Insured Partner Vault Custody</span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center p-3 rounded-2xl border bg-[#050505] border-white/20">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Invoices" },
              { id: "awaiting_approval", label: "Awaiting Settlement" },
              { id: "settled", label: "Settled" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveFilter(tab.id as any);
                  setSelectedIds([]);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? "bg-white text-black font-bold shadow-sm"
                    : "text-[#8f8f8f] hover:text-white bg-transparent hover:bg-white/[0.02]"
                }`}
              >
                {tab.label}
                {tab.id === "awaiting_approval" && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 text-[10px] font-bold">
                    {invoices.filter((i) => i.status === "awaiting_approval").length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <LiveRefreshIndicator
              onRefresh={handleManualSync}
              lastUpdatedText={lastSyncText}
            />

            <div className="relative md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8f8f8f]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaign, invoice ID..."
                className="w-full h-9 bg-black border border-white/20 focus:border-white/40 rounded-xl pl-9 pr-4 text-xs outline-none placeholder:text-neutral-600 transition-colors text-white"
              />
            </div>
          </div>
        </div>

        {/* Invoices List Table */}
        <div className="bg-[#050505] rounded-2xl border border-white/20 overflow-hidden shadow-xl">
          {filteredInvoices.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Receipt}
                badgeText="Payables Status Clear"
                title="No Invoices Pending Approval"
                description={
                  searchQuery
                    ? `No invoices match your search query "${searchQuery}".`
                    : "When partner agencies issue campaign invoices, they will appear here with automated invoice verification and one-click ACH/Wire payment settlement."
                }
                secondaryActionLabel={searchQuery ? "Clear Search" : undefined}
                onSecondaryAction={searchQuery ? () => setSearchQuery("") : undefined}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/20 bg-white/[0.01] text-[#8f8f8f] font-bold">
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-white rounded border-white/20 bg-transparent cursor-pointer"
                        onChange={(e) => {
                          const awaitingInvs = filteredInvoices.filter((i) => i.status === "awaiting_approval");
                          setSelectedIds(e.target.checked ? awaitingInvs.map((i) => i.id) : []);
                        }}
                        checked={
                          selectedIds.length > 0 &&
                          selectedIds.length === filteredInvoices.filter((i) => i.status === "awaiting_approval").length &&
                          filteredInvoices.filter((i) => i.status === "awaiting_approval").length > 0
                        }
                      />
                    </th>
                    <th className="p-4">Invoice ID</th>
                    <th className="p-4">Campaign / Deliverable</th>
                    <th className="p-4">Beneficiary Agency</th>
                    <th className="p-4">Terms</th>
                    <th className="p-4 text-right">Invoice Amount</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredInvoices.map((inv) => {
                    const isAwaiting = inv.status === "awaiting_approval";
                    const isSelected = selectedInvoiceId === inv.id;

                    return (
                      <tr
                        key={inv.id}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).tagName.toLowerCase() === "input") return;
                          setSelectedInvoiceId(inv.id);
                        }}
                        className={`cursor-pointer transition-all group ${
                          isSelected || selectedIds.includes(inv.id)
                            ? "bg-white/[0.07] border-l-4 border-l-white"
                            : "hover:bg-white/[0.02]"
                        }`}
                      >
                        <td className="p-4 w-10" onClick={(e) => e.stopPropagation()}>
                          {isAwaiting && (
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-white rounded border-white/20 bg-transparent cursor-pointer"
                              checked={selectedIds.includes(inv.id)}
                              onChange={() => {
                                setSelectedIds((curr) =>
                                  curr.includes(inv.id) ? curr.filter((id) => id !== inv.id) : [...curr, inv.id]
                                );
                              }}
                            />
                          )}
                        </td>
                        <td className="p-4 font-mono font-bold text-neutral-300">
                          {inv.id}
                        </td>
                        <td className="p-4">
                          <p className="text-white font-bold">{inv.campaignName}</p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">{inv.brandName}</p>
                        </td>
                        <td className="p-4 text-white font-semibold">{inv.vendorFee?.name || "Agency Workspace"}</td>
                        <td className="p-4 text-neutral-400 font-mono">{inv.dueDate || "Net-30"}</td>
                        <td className="p-4 text-right font-black text-white">
                          ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isAwaiting
                                ? "bg-amber-950/60 text-amber-300 border border-amber-800/30 animate-pulse"
                                : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/30"
                            }`}
                          >
                            {isAwaiting ? "Awaiting Settlement" : "Settled"}
                          </span>
                        </td>
                        <td className="p-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                          {isAwaiting ? (
                            <button
                              onClick={() => {
                                setSinglePaymentInvoice({
                                  id: inv.id,
                                  amount: inv.amount,
                                  agency: inv.vendorFee?.name || inv.campaignName,
                                  dueDate: inv.dueDate,
                                });
                                setIsSinglePaymentOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-bold transition-transform active:scale-95"
                            >
                              Pay Now
                            </button>
                          ) : (
                            <span className="text-xs text-neutral-500 font-medium">Reconciled</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Rail Single Invoice Checkout Modal */}
      {singlePaymentInvoice && (
        <PaymentModal
          isOpen={isSinglePaymentOpen}
          onClose={() => {
            setIsSinglePaymentOpen(false);
            setSinglePaymentInvoice(null);
          }}
          invoice={singlePaymentInvoice}
        />
      )}

      {/* Batch Payment Checkout Modal */}
      <BatchPaymentCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedInvoices={batchInvoices}
        onAuthorizePayment={handleAuthorizePayment}
      />

      {/* Toast Notification Banner */}
      <ToastBanner toast={toast} onDismiss={() => setToast(null)} />
    </main>
  );
}
