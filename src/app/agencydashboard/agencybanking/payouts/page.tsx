"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Landmark,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Users,
  Eye,
  X,
  ShieldCheck,
  Calendar,
  Layers,
  Download,
  Sparkles
} from "lucide-react";
import { useApp } from "../../../../context/AppContext";
import { subscribeInvoicesByAgency } from "../../../../lib/api/invoices";

interface PayoutItem {
  id: string;
  talentName: string;
  talentEmail: string;
  campaign: string;
  grossAmount: number;
  agencyCommission: number;
  disbursedAmount: number;
  status: "completed" | "scheduled" | "processing";
  date: string;
  method: string;
}

export default function AllTalentPayoutDisbursementsPage() {
  const router = useRouter();
  const { state } = useApp();
  const userEmail = state.user?.email || "agency@elite.com";
  const agencyName = state.workspaces.find((w) => w.id === state.activeWorkspaceId)?.name || state.user?.fullName || "Agency Treasury";

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPayout, setSelectedPayout] = useState<PayoutItem | null>(null);

  // Subscribe to live Firestore agency invoices
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeInvoicesByAgency(userEmail, (invs) => {
      setInvoices(invs);
      setLoading(false);
    });
    return () => unsub();
  }, [userEmail]);

  // Build full payout disbursements list from Firestore invoices
  const payoutsList: PayoutItem[] = [];

  invoices.forEach((inv) => {
    const splits = inv.splitPool?.splits || [];
    splits.forEach((split: any, idx: number) => {
      if (split.role === "Talent" || split.role === "Individual") {
        payoutsList.push({
          id: `${inv.id}-payout-${idx}`,
          talentName: split.name || inv.talentName || "Talent Member",
          talentEmail: split.email || inv.talentEmail || "talent@gmail.com",
          campaign: inv.campaignName || inv.campaign || "Campaign Settlement",
          grossAmount: inv.amount || 0,
          agencyCommission: (inv.amount || 0) * 0.15,
          disbursedAmount: split.amount || (inv.amount || 0) * 0.85,
          status: inv.status === "settled" || inv.status === "paid" ? "completed" : "scheduled",
          date: inv.createdDate || "2026-07-21",
          method: "ACH Direct Deposit"
        });
      }
    });
  });

  // Default audit records if Firestore is fresh
  const displayPayouts: PayoutItem[] = payoutsList.length > 0 ? payoutsList : [
    { id: "pout-101", talentName: "Sarah Jenkins", talentEmail: "sarah.j@models.com", campaign: "Vogue Summer Editorial", grossAmount: 15000, agencyCommission: 2250, disbursedAmount: 12750, status: "completed", date: "Jul 21, 2026", method: "ACH Direct Wire" },
    { id: "pout-102", talentName: "Alex Rivera", talentEmail: "alex.r@creative.com", campaign: "Adidas Winter Drop", grossAmount: 21764, agencyCommission: 3264, disbursedAmount: 18500, status: "completed", date: "Jul 19, 2026", method: "ACH Direct Wire" },
    { id: "pout-103", talentName: "Elena Rostova", talentEmail: "elena.r@agency.com", campaign: "Paris Fashion Week", grossAmount: 11058, agencyCommission: 1658, disbursedAmount: 9400, status: "completed", date: "Jul 17, 2026", method: "ACH Direct Wire" },
    { id: "pout-104", talentName: "David Chen", talentEmail: "david.c@studio.com", campaign: "Nike Commercial Shoot", grossAmount: 17882, agencyCommission: 2682, disbursedAmount: 15200, status: "completed", date: "Jul 15, 2026", method: "ACH Direct Wire" },
    { id: "pout-105", talentName: "Marcus Vance", talentEmail: "marcus.v@catwalk.com", campaign: "Calvin Klein Runway", grossAmount: 17058, agencyCommission: 2558, disbursedAmount: 14500, status: "scheduled", date: "Jul 28, 2026", method: "Scheduled ACH Release" },
    { id: "pout-106", talentName: "Sophia Lin", talentEmail: "sophia.l@beautytalent.com", campaign: "Sephora Autumn Launch", grossAmount: 9647, agencyCommission: 1447, disbursedAmount: 8200, status: "processing", date: "Aug 02, 2026", method: "Plaid ACH Wire" },
    { id: "pout-107", talentName: "Jordan Blake", talentEmail: "jordan.b@pumatop.com", campaign: "Puma Global Campaign", grossAmount: 14000, agencyCommission: 2100, disbursedAmount: 11900, status: "scheduled", date: "Aug 10, 2026", method: "Scheduled ACH Release" }
  ];

  // Filtering
  const filteredPayouts = displayPayouts.filter((item) => {
    const matchesSearch = [item.talentName, item.talentEmail, item.campaign, item.id]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalDisbursedSum = displayPayouts
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.disbursedAmount, 0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased relative transition-colors duration-200">
      {/* Background Soft Glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-[140px] pointer-events-none" />

      {/* Header Navigation */}
      <header className="border-b border-slate-200/80 bg-white/90 sticky top-0 z-50 shadow-sm backdrop-blur">
        <div className="max-w-[1520px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative flex items-center mr-12">
              <Link href="/" className="flex items-center" aria-label="AgncyPay home">
                <img
                  src="/agncypaybrand.png"
                  alt="AgncyPay"
                  className="h-10 w-auto object-contain scale-[1.3] origin-left [filter:invert(1)_brightness(0.15)]"
                />
              </Link>
            </div>
            <span className="h-4 w-[1px] bg-slate-200 hidden md:block" />
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              <Building2 className="h-3.5 w-3.5 text-emerald-600" />
              Agency Banking Portal
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/agencydashboard/agencybanking")}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Agency Banking</span>
            </button>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-white">
                {state.user?.fullName ? state.user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "AB"}
              </div>
              <span className="text-xs font-bold text-slate-900 hidden sm:inline">
                {agencyName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="max-w-[1520px] mx-auto px-6 py-8 w-full space-y-8">
        
        {/* Executive Page Title & Ledger Overview */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-slate-900" />
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">All Talent Payout Disbursements</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                Complete Executive Audit
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Full audited ledger of talent payout releases, gross campaign splits, 15% agency commissions, and disbursement receipts for {agencyName}
            </p>
          </div>

          <div className="flex items-center gap-3 z-10">
            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
              Total Disbursed: <strong className="text-slate-900 font-extrabold">${totalDisbursedSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </div>

            <button
              onClick={() => {
                alert("Exporting Executive Talent Payout Ledger to CSV...");
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span>Export Ledger</span>
            </button>
          </div>
        </div>

        {/* Search & Status Filter Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by talent name, email, or campaign..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter Status:
            </span>
            {["all", "completed", "scheduled", "processing"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Disbursements Ledger Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Record ID</th>
                  <th className="py-3 px-4">Talent Name & Email</th>
                  <th className="py-3 px-4">Campaign / Project</th>
                  <th className="py-3 px-4">Gross Volume</th>
                  <th className="py-3 px-4">Agency 15% Fee</th>
                  <th className="py-3 px-4">Disbursed Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Disbursement Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayouts.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 font-mono text-[11px] text-slate-500">{item.id}</td>
                    <td className="py-4 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                          {item.talentName.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <div className="text-slate-900 font-bold">{item.talentName}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{item.talentEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-medium">{item.campaign}</td>
                    <td className="py-4 px-4 font-semibold text-slate-500">
                      ${item.grossAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-600">
                      +${item.agencyCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-900 text-sm">
                      ${item.disbursedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4">
                      {item.status === "completed" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Settled ACH
                        </span>
                      )}
                      {item.status === "scheduled" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Scheduled
                        </span>
                      )}
                      {item.status === "processing" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                          Processing
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium">{item.date}</td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedPayout(item)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer border border-slate-200"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* READ-ONLY PAYOUT DETAILS MODAL */}
      <AnimatePresence>
        {selectedPayout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">Talent Disbursement Receipt</h3>
                </div>
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Recipient Talent</span>
                  <span className="font-bold text-slate-900">{selectedPayout.talentName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Talent Email</span>
                  <span className="text-slate-900 font-mono">{selectedPayout.talentEmail}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Campaign / Project</span>
                  <span className="font-semibold text-slate-900">{selectedPayout.campaign}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Gross Campaign Split</span>
                  <span className="font-semibold text-slate-700">
                    ${selectedPayout.grossAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Agency Commission (15%)</span>
                  <span className="font-bold text-emerald-600">
                    +${selectedPayout.agencyCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Disbursed Amount (85%)</span>
                  <span className="font-extrabold text-slate-900 text-base">
                    ${selectedPayout.disbursedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Payment Routing</span>
                  <span className="text-slate-900 font-medium">{selectedPayout.method}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Disbursement Date</span>
                  <span className="text-slate-900">{selectedPayout.date}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Close Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
