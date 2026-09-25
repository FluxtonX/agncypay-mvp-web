"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Search,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  Building2,
  DollarSign,
  ChevronRight,
  Sparkles,
  X,
  CreditCard,
  Send,
  Download,
  AlertCircle,
  Zap,
  ArrowLeft
} from "lucide-react";
import { AppShell } from "../../../components/shell/AppShell";
import { MetricCard } from "../../../components/data-display/MetricCard";
import { Money } from "../../../components/financial/Money";

interface PayoutItem {
  id: string;
  recipientName: string;
  recipientHandle: string;
  campaign: string;
  invoiceRef: string;
  rail: string;
  grossAmount: number;
  netPayout: number;
  taxHoldback: number;
  status: "queued" | "processing" | "settled" | "scheduled";
  date: string;
}

const INITIAL_PAYOUTS: PayoutItem[] = [
  {
    id: "PAY-2026-081",
    recipientName: "Marcus Chen",
    recipientHandle: "@marcusvisuals",
    campaign: "Acme Global Q3 Campaign",
    invoiceRef: "INV-2026-104",
    rail: "Chase RTP Instant (••••1182)",
    grossAmount: 24000,
    netPayout: 19200,
    taxHoldback: 2400,
    status: "queued",
    date: "Sep 25, 2026",
  },
  {
    id: "PAY-2026-080",
    recipientName: "Maya Lin",
    recipientHandle: "@mayacreates",
    campaign: "Nike Fall Showcase 2026",
    invoiceRef: "INV-2026-098",
    rail: "Evolve ACH Direct (••••4921)",
    grossAmount: 16500,
    netPayout: 14025,
    taxHoldback: 1650,
    status: "processing",
    date: "Sep 24, 2026",
  },
  {
    id: "PAY-2026-079",
    recipientName: "Sarah Jenkins",
    recipientHandle: "@sarahj_style",
    campaign: "Sephora Brand Ambassador",
    invoiceRef: "INV-2026-095",
    rail: "Mercury Wire (••••9032)",
    grossAmount: 12000,
    netPayout: 10200,
    taxHoldback: 1200,
    status: "settled",
    date: "Sep 22, 2026",
  },
  {
    id: "PAY-2026-078",
    recipientName: "Elena Rostova",
    recipientHandle: "@elenarostova",
    campaign: "Red Bull Global Tour",
    invoiceRef: "INV-2026-091",
    rail: "FedNow Instant (••••3341)",
    grossAmount: 35000,
    netPayout: 28000,
    taxHoldback: 3500,
    status: "settled",
    date: "Sep 20, 2026",
  },
  {
    id: "PAY-2026-077",
    recipientName: "Jordan Rivera",
    recipientHandle: "@jriveraphoto",
    campaign: "Vogue Editorial Sprint",
    invoiceRef: "INV-2026-088",
    rail: "USDC Treasury Vault",
    grossAmount: 8500,
    netPayout: 7650,
    taxHoldback: 850,
    status: "scheduled",
    date: "Sep 28, 2026",
  },
];

export default function TalentPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutItem[]>(INITIAL_PAYOUTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [simulateEmpty, setSimulateEmpty] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<PayoutItem | null>(null);

  // Quick payout form
  const [newRecipient, setNewRecipient] = useState("");
  const [newAmount, setNewAmount] = useState<number>(5000);
  const [newCampaign, setNewCampaign] = useState("");
  const [newRail, setNewRail] = useState("Chase RTP Instant (••••1182)");

  const filteredPayouts = payouts.filter((p) => {
    const matchesSearch =
      p.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.recipientHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.campaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const displayedPayouts = simulateEmpty ? [] : filteredPayouts;

  const handleCreatePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient.trim()) return;

    const newPayoutItem: PayoutItem = {
      id: `PAY-2026-${Math.floor(100 + Math.random() * 900)}`,
      recipientName: newRecipient.trim(),
      recipientHandle: `@${newRecipient.toLowerCase().replace(/\s+/g, "")}`,
      campaign: newCampaign.trim() || "Agency Direct Settlement",
      invoiceRef: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      rail: newRail,
      grossAmount: newAmount,
      netPayout: Math.round(newAmount * 0.85),
      taxHoldback: Math.round(newAmount * 0.1),
      status: "queued",
      date: "Just now",
    };

    setPayouts([newPayoutItem, ...payouts]);
    setNewRecipient("");
    setNewAmount(5000);
    setNewCampaign("");
    setIsModalOpen(false);
    setSimulateEmpty(false);
  };

  const handleDisburseNow = (id: string) => {
    setPayouts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "settled" } : item))
    );
  };

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
          <span className="text-xs text-slate-600 font-semibold">Agency Operations</span>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs text-slate-900 font-bold">Talent Payouts</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <Zap className="h-6 w-6 text-emerald-600" />
              Talent Payouts & Disbursals
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Multi-rail settlement engine for creator splits across Instant FedNow, Evolve ACH, and Wire transfers.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSimulateEmpty(!simulateEmpty)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                simulateEmpty
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {simulateEmpty ? "Show Seeded Data" : "Simulate Empty State"}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              Initiate Payout
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Pending Disbursal Queue"
            value={simulateEmpty ? 0 : 33225}
            isCurrency={true}
            icon={<Clock3 className="h-4 w-4 text-amber-500" />}
            tooltip="2 queued batches ready for release"
          />
          <MetricCard
            title="Disbursed (Past 30D)"
            value={simulateEmpty ? 0 : 85875}
            isCurrency={true}
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            delta={18.4}
            deltaPeriod="vs last month"
          />
          <MetricCard
            title="Avg Rail Speed"
            value={simulateEmpty ? "0s" : "Instant (<10s)"}
            isCurrency={false}
            icon={<Zap className="h-4 w-4 text-blue-500" />}
            tooltip="RTP & FedNow clearing speed"
          />
          <MetricCard
            title="Tax Escrow Reserve"
            value={simulateEmpty ? 0 : 9590}
            isCurrency={true}
            icon={<ShieldCheck className="h-4 w-4 text-purple-500" />}
            tooltip="FDIC Insured 1099 compliance"
          />
        </div>

        {/* Search and Filters Bar */}
        <div className="p-3 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search talent, campaign, or payout ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {["all", "queued", "processing", "settled", "scheduled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Payouts Table / Empty State */}
        {displayedPayouts.length === 0 ? (
          <div className="p-12 rounded-2xl border border-slate-200 bg-white text-center flex flex-col items-center justify-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <Zap className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Payouts in Queue</h3>
            <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
              When client brand invoices settle, automated commission splits are calculated and will appear here ready for direct payout disbursal to talent bank accounts.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              Initiate Manual Payout
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Payout ID / Date</th>
                    <th className="py-3 px-4">Talent Recipient</th>
                    <th className="py-3 px-4">Campaign & Invoice</th>
                    <th className="py-3 px-4">Settlement Rail</th>
                    <th className="py-3 px-4 text-right">Gross Total</th>
                    <th className="py-3 px-4 text-right">Net Payout</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedPayouts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{item.id}</span>
                        <span className="text-[11px] text-slate-400">{item.date}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                            {item.recipientName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{item.recipientName}</span>
                            <span className="text-[11px] text-slate-400">{item.recipientHandle}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900 block truncate max-w-[160px]">{item.campaign}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{item.invoiceRef}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700 block text-[11px]">{item.rail}</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Direct Routing</span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 font-medium">
                        <Money amount={item.grossAmount} />
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        <Money amount={item.netPayout} />
                        <span className="text-[10px] text-slate-400 block font-normal">
                          -${item.taxHoldback} tax
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${
                            item.status === "settled"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : item.status === "processing"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : item.status === "scheduled"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.status === "queued" ? (
                          <button
                            onClick={() => handleDisburseNow(item.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
                          >
                            Release
                          </button>
                        ) : (
                          <button
                            onClick={() => alert(`Receipt downloaded for ${item.id}`)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer inline-flex items-center gap-1 text-[11px]"
                            title="Download Proof of Transfer"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Initiate Payout Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Send className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Initiate Talent Payout</h3>
                    <p className="text-[11px] text-slate-500">Instant disbursal to linked creator bank rail</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePayout} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Talent Recipient
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Lin"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Campaign / Deliverable
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nike Fall Showcase"
                    value={newCampaign}
                    onChange={(e) => setNewCampaign(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gross Amount ($)
                    </label>
                    <input
                      type="number"
                      min={100}
                      step={100}
                      value={newAmount}
                      onChange={(e) => setNewAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Settlement Rail
                    </label>
                    <select
                      value={newRail}
                      onChange={(e) => setNewRail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    >
                      <option value="Chase RTP Instant (••••1182)">Chase RTP Instant</option>
                      <option value="Evolve ACH Direct (••••4921)">Evolve ACH Direct</option>
                      <option value="FedNow Instant (••••3341)">FedNow Instant</option>
                      <option value="USDC Treasury Vault">USDC Treasury Vault</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Talent Share (85%):</span>
                    <span className="font-bold text-slate-900">${(newAmount * 0.85).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 mt-1">
                    <span>Estimated 1099 Reserve (10%):</span>
                    <span className="font-semibold text-slate-700">${(newAmount * 0.1).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
                  >
                    Confirm & Queue Payout
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
