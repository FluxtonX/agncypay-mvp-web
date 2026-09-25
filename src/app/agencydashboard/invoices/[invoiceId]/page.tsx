"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Sparkles,
  ArrowLeft,
  Coins,
  Layers,
  ShieldCheck,
  Clock,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  LogOut,
  Calendar,
  X,
  RefreshCw,
  Info,
  Home,
  Search,
  MapPin,
  ArrowUpRight,
  Flame,
  CreditCard,
  Percent,
  TrendingUp,
  AlertTriangle,
  FileText,
  Users,
  Sun,
  Moon
} from "lucide-react";
import { useApp } from "../../../../context/AppContext";
import { subscribeInvoicesByBrand, subscribeInvoicesByAgency } from "../../../../lib/api/invoices";
import { CorporatePayoutTermsCard } from "../../../../components/dashboard/CorporatePayoutTermsCard";
import { AppShell } from "../../../../components/shell/AppShell";
import { Money } from "../../../../components/financial/Money";
import { TransactionStatusBadge } from "../../../../components/financial/TransactionStatusBadge";

// Types
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

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams<{ invoiceId: string }>();
  const invoiceId = params?.invoiceId;
  const { state, resetState } = useApp();
  const workspaceType = state.user ? state.user.accountType : "brand";

  const [isLightTheme, setIsLightTheme] = useState(true);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLightTheme(document.documentElement.classList.contains("light"));
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
  const [selectedTerm, setSelectedTerm] = useState<"Net-30" | "Net-60" | "Net-90">("Net-30");
  const [instantPayoutEnabled, setInstantPayoutEnabled] = useState<boolean>(true);

  // Simulation processing state
  const [processingStage, setProcessingStage] = useState<"idle" | "verifying" | "routing" | "success">("idle");

  const activeInvoice = invoices.find(inv => inv.id === invoiceId) || invoices[0] || null;

  React.useEffect(() => {
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
        
        return {
          id: inv.id,
          campaignName: inv.campaign,
          brandName: inv.brandName || "Adidas Corporate",
          createdDate: inv.createdDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          dueDate: inv.due,
          amount: inv.amount,
          location: "Escrow Wallet Active",
          costCenter: "Marketing (Campaign Pool)",
          initials: [inv.agency?.charAt(0).toUpperCase() || "A"],
          defaultTerm: "Net-30",
          status: uiStatus,
          vendorFee: {
            name: "Processing Fee",
            role: "Vendor",
            amount: inv.amount * 0.1,
            walletId: "@agncypay",
            avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&auto=format&fit=crop&q=80"
          },
          splitPool: {
            total: inv.amount * 0.9,
            splits: [
              { name: inv.talent, role: "Talent", percentage: 85, amount: inv.amount * 0.9 * 0.85, walletId: "@talent", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80" },
              { name: inv.agency, role: "Agency", percentage: 15, amount: inv.amount * 0.9 * 0.15, walletId: "@agency", avatar: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=80&auto=format&fit=crop&q=80" }
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

  React.useEffect(() => {
    if (activeInvoice) {
      setSelectedTerm(activeInvoice.defaultTerm);
    }
  }, [activeInvoice]);

  const handleApproveAndPay = () => {
    if (activeInvoice.status !== "awaiting_approval") return;
    
    const userEmail = state.user?.email || "guest";
    const queueKey = `brand_queue_invoices_${userEmail}`;
    const notifsKey = `agency_notifications_${userEmail}`;

    setProcessingStage("verifying");
    
    setTimeout(() => {
      setProcessingStage("routing");
      
      setTimeout(() => {
        setProcessingStage("success");
        
        setTimeout(() => {
          setInvoices(prev => {
            const next = prev.map(inv => 
              inv.id === activeInvoice.id ? { ...inv, status: "settled" as const } : inv
            );
            localStorage.setItem(queueKey, JSON.stringify(next));
            return next;
          });

          // Add notification
          const localNotifs = localStorage.getItem(notifsKey);
          const notifs = localNotifs ? JSON.parse(localNotifs) : [];
          const newNotif = {
            id: `notif-${Date.now()}`,
            message: `Brand approved & paid main invoice for ${activeInvoice.campaignName} ($${activeInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })})`,
            timestamp: "Just now",
            unread: true,
          };
          localStorage.setItem(notifsKey, JSON.stringify([newNotif, ...notifs]));

          setProcessingStage("idle");
          window.dispatchEvent(new Event("syncAgencyDashboard"));
        }, 1200);
      }, 1500);
    }, 1200);
  };

  const handleLogout = () => {
    resetState();
    router.push("/auth/login");
  };

  if (!activeInvoice) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-sans">
        <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Dynamic Navigation Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Link 
              href="/agencydashboard/invoices" 
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 hover:text-slate-900 shadow-2xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Invoices
            </Link>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-mono font-bold text-slate-600">{activeInvoice.id}</span>
            <span className="text-xs text-slate-400">•</span>
            <h2 className="text-sm font-bold text-slate-900">{activeInvoice.location}</h2>
            <span className="text-xs font-bold text-emerald-600">({activeInvoice.costCenter})</span>
            <span className="text-xs font-medium text-slate-500">{activeInvoice.brandName}</span>
          </div>

          <div className="flex items-center gap-2">
            <TransactionStatusBadge
              status={activeInvoice.status === "awaiting_approval" ? "PENDING" : "COMPLETED"}
              size="sm"
            />
          </div>
        </div>

        {/* Core Layout Grid (Left: 8 columns, Right: 4 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Balance Due & Auto-Splits */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Balance Due Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 flex gap-2">
                <button className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer">
                  <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left side: Balance due & action */}
                <div className="lg:col-span-6 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Balance due</span>
                    <div className="mt-1.5">
                      <Money amount={activeInvoice.amount} size="3xl" />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>Due: {activeInvoice.dueDate}</span>
                    </div>
                  </div>

                  {/* Main Action Button */}
                  <div className="w-full shrink-0 mt-8">
                    <AnimatePresence mode="wait">
                      {processingStage === "idle" && (
                        <button
                          onClick={handleApproveAndPay}
                          disabled={activeInvoice.status !== "awaiting_approval"}
                          className={`w-full h-12 px-6 rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            activeInvoice.status === "awaiting_approval"
                              ? "bg-slate-900 text-white hover:bg-slate-800"
                              : "bg-emerald-600 text-white cursor-default"
                          }`}
                        >
                          {activeInvoice.status === "awaiting_approval" ? (
                            <>
                              Approve & Pay Invoice
                              <ChevronRight className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4.5 w-4.5 text-white" />
                              Approved & Settled
                            </>
                          )}
                        </button>
                      )}

                      {processingStage !== "idle" && (
                        <div className="w-full h-12 px-6 rounded-xl border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-700 flex items-center justify-center gap-3 shadow-inner">
                          <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
                          {processingStage === "verifying" && "Verifying corporate treasury..."}
                          {processingStage === "routing" && "Auto-routing splits..."}
                          {processingStage === "success" && "Settlement complete!"}
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Right side: Your Corporate Payout Terms Card (Brand Role Only) */}
                {workspaceType === "brand" && (
                  <div className="lg:col-span-6">
                    <CorporatePayoutTermsCard invoiceId={activeInvoice.id} initialTerm={activeInvoice.defaultTerm || "Net-30"} />
                  </div>
                )}
              </div>

              {/* Sub-details Rows */}
              <div className="mt-8 pt-6 border-t border-slate-100 space-y-4 text-xs">
                
                {/* Row 1: Autopay / Auto-split Settlement */}
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-semibold flex items-center gap-2">
                    <Layers className="h-4 w-4 text-slate-400" />
                    Auto-split Settlement Routing
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] uppercase">
                    Active
                  </span>
                </div>

                {/* Row 2: Credit Boost / Liquidity Guarantee */}
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-semibold flex items-center gap-2">
                    <Coins className="h-4 w-4 text-slate-400" />
                    Liquidity Guarantee (Net-0 Advance Payout)
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] uppercase">
                    Eligible
                  </span>
                </div>

                {/* Row 3: Fee Consolidation */}
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                    Consolidated Processing Fee
                  </span>
                  <span className="font-bold text-slate-700 text-[10px] uppercase">
                    $0 ACH Fee (Consolidated Rail)
                  </span>
                </div>

              </div>
            </div>

            {/* Auto-Split details section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
              
              {/* Direct Vendor Payment */}
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Direct Vendor Payment</h4>
                    <span className="text-[10px] text-slate-400 font-semibold">(Direct flat rate billing)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">1 Node</span>
                </div>

                <div className="mt-3 max-w-sm">
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl relative overflow-hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={activeInvoice.vendorFee.avatar}
                          alt={activeInvoice.vendorFee.name}
                          className="h-10 w-10 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{activeInvoice.vendorFee.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{activeInvoice.vendorFee.walletId}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 shrink-0 uppercase tracking-wider">
                        Vendor
                      </span>
                    </div>

                    <div className="mt-4 flex justify-between items-baseline">
                      <span className="text-xs font-semibold text-slate-500">Direct Production Fee</span>
                      <Money amount={activeInvoice.vendorFee.amount} size="sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Agency & Talent splits */}
              {workspaceType === "agency" && (
                <div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Agency & Talent Split</h4>
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        (Remaining Pool: <Money amount={activeInvoice.splitPool.total} size="xs" />)
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">2 Nodes</span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeInvoice.splitPool.splits.map((split) => (
                      <div
                        key={split.name}
                        className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl relative overflow-hidden group"
                      >
                        <div 
                          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-purple-600 transition-all duration-500"
                          style={{ width: activeInvoice.status === "settled" ? `${split.percentage}%` : "0%" }}
                        />

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={split.avatar}
                              alt={split.name}
                              className="h-10 w-10 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{split.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{split.walletId}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 uppercase tracking-wider ${
                            split.role === "Talent" 
                              ? "bg-purple-50 text-purple-700 border border-purple-200" 
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {split.role}
                          </span>
                        </div>

                        <div className="mt-4 flex justify-between items-baseline">
                          <span className="text-xs font-semibold text-slate-500">
                            {split.percentage}% Share
                          </span>
                          <Money amount={split.amount} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Routing Map Card & Campaign Detail Card */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Settlement Node Network Map Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-100">
                Settlement Node Network Map
              </h3>

              <div className="mt-4 h-48 rounded-xl border border-slate-200 bg-slate-900 relative overflow-hidden flex flex-col justify-end p-4 shadow-inner">
                {/* Dot grid */}
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />

                {/* Network routes */}
                <svg className="absolute inset-0 h-full w-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 50 50 L 150 100 L 250 60" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[dash_10s_linear_infinite]" />
                  <path d="M 150 100 L 80 150" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[dash_8s_linear_infinite]" />
                </svg>

                {/* Nodes */}
                <div className="absolute top-10 left-12 flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow">
                    NY
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 mt-1">Brand</span>
                </div>

                <div className="absolute top-20 right-16 flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow">
                    LDN
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 mt-1">Talent</span>
                </div>

                <div className="absolute bottom-10 left-16 flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow">
                    PAR
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 mt-1">Agency</span>
                </div>

                <div className="relative z-10 bg-slate-800/90 border border-slate-700 rounded-lg p-2.5 shadow-sm text-[11px] text-center">
                  <span className="font-bold text-white flex items-center justify-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                    Explore Settlement Routes
                  </span>
                </div>
              </div>
            </div>

            {/* Campaign Cost Center Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col items-center text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Cost Center</span>
              <span className="text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight">{activeInvoice.costCenter}</span>

              {/* Occupancy Initials */}
              <div className="flex gap-2.5 mt-4">
                {activeInvoice.initials.map((init, idx) => (
                  <div 
                    key={idx}
                    className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-800 shadow-xs"
                    title={`Payee Node Initials: ${init}`}
                  >
                    {init}
                  </div>
                ))}
              </div>

              {/* Billing Period */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-5 font-semibold">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{activeInvoice.createdDate} - {activeInvoice.dueDate}</span>
              </div>

              {/* Three Stacked Buttons */}
              <div className="w-full mt-6 space-y-2.5">
                {workspaceType === "brand" ? (
                  <>
                    <button className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <AlertTriangle className="h-3.5 w-3.5 text-slate-500" />
                      Dispute Invoice
                    </button>
                    <button className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      Schedule Compliance Audit
                    </button>
                    <button className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <FileText className="h-3.5 w-3.5 text-slate-500" />
                      View Campaign Contract
                    </button>
                  </>
                ) : (
                  <>
                    <button className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <FileText className="h-3.5 w-3.5 text-slate-500" />
                      Export Payout Ledger
                    </button>
                    <button className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <Users className="h-3.5 w-3.5 text-slate-500" />
                      Message Client Account
                    </button>
                    <button className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <AlertTriangle className="h-3.5 w-3.5 text-slate-500" />
                      Dispute Resolution Center
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </AppShell>
  );
}
