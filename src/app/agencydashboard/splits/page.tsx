"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PieChart,
  Search,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  Percent,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  X,
  FileSpreadsheet,
  AlertCircle,
  Copy,
  ArrowLeft
} from "lucide-react";
import { AppShell } from "../../../components/shell/AppShell";
import { MetricCard } from "../../../components/data-display/MetricCard";
import { Money } from "../../../components/financial/Money";

interface SplitTemplate {
  id: string;
  name: string;
  category: "creator" | "commercial" | "exclusive" | "tiered";
  talentShare: number;
  agencyShare: number;
  taxHoldback: number;
  assignedTalentCount: number;
  description: string;
  status: "active" | "draft";
  lastUpdated: string;
}

const INITIAL_SPLITS: SplitTemplate[] = [
  {
    id: "split-1",
    name: "Standard 85/15 Creator Agreement",
    category: "creator",
    talentShare: 85,
    agencyShare: 15,
    taxHoldback: 10,
    assignedTalentCount: 18,
    description: "Default baseline formula for ongoing content partnerships, sponsor integrations, and monthly brand retainers.",
    status: "active",
    lastUpdated: "Sep 20, 2026",
  },
  {
    id: "split-2",
    name: "Commercial Studio 80/20 Production",
    category: "commercial",
    talentShare: 80,
    agencyShare: 20,
    taxHoldback: 15,
    assignedTalentCount: 8,
    description: "Applies to full-scale commercial shoots, broadcast media buyouts, and high-budget brand deliverables.",
    status: "active",
    lastUpdated: "Aug 14, 2026",
  },
  {
    id: "split-3",
    name: "Exclusive Roster 90/10 Tier",
    category: "exclusive",
    talentShare: 90,
    agencyShare: 10,
    taxHoldback: 10,
    assignedTalentCount: 4,
    description: "Preferred rate reserved for multi-year exclusive talent roster with minimum quarterly gross billings exceeding $100k.",
    status: "active",
    lastUpdated: "Sep 02, 2026",
  },
  {
    id: "split-4",
    name: "Tiered Volume Accelerator",
    category: "tiered",
    talentShare: 75,
    agencyShare: 25,
    taxHoldback: 12,
    assignedTalentCount: 5,
    description: "Dynamic split starting at 75/25, scaling to 85/15 once campaign revenue reaches $50k threshold.",
    status: "active",
    lastUpdated: "Jul 29, 2026",
  },
];

export default function CommissionSplitsPage() {
  const [splits, setSplits] = useState<SplitTemplate[]>(INITIAL_SPLITS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [simulateEmpty, setSimulateEmpty] = useState(false);

  // New rule state
  const [newName, setNewName] = useState("");
  const [newTalentShare, setNewTalentShare] = useState<number>(85);
  const [newTaxHoldback, setNewTaxHoldback] = useState<number>(10);
  const [newCategory, setNewCategory] = useState<"creator" | "commercial" | "exclusive" | "tiered">("creator");
  const [newDescription, setNewDescription] = useState("");

  const filteredSplits = splits.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === "all" || s.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const displayedSplits = simulateEmpty ? [] : filteredSplits;

  const handleCreateSplit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newTemplate: SplitTemplate = {
      id: `split-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      talentShare: newTalentShare,
      agencyShare: 100 - newTalentShare,
      taxHoldback: newTaxHoldback,
      assignedTalentCount: 0,
      description: newDescription.trim() || "Custom split formula defined by agency treasury.",
      status: "active",
      lastUpdated: "Just now",
    };

    setSplits([newTemplate, ...splits]);
    setNewName("");
    setNewTalentShare(85);
    setNewTaxHoldback(10);
    setNewDescription("");
    setIsModalOpen(false);
    setSimulateEmpty(false);
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
          <span className="text-xs text-slate-900 font-bold">Commission Splits</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <PieChart className="h-6 w-6 text-indigo-600" />
              Commission Splits & Royalty Rules
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Automate multi-party revenue allocations, talent share percentages, and tax withholdings.
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
              <Plus className="h-4 w-4" />
              New Split Rule
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Split Formulas"
            value={simulateEmpty ? 0 : splits.length}
            isCurrency={false}
            icon={<SlidersHorizontal className="h-4 w-4 text-indigo-500" />}
            delta={8.3}
            deltaPeriod="this quarter"
          />
          <MetricCard
            title="Avg Agency Commission"
            value={simulateEmpty ? "0.0%" : "17.5%"}
            isCurrency={false}
            icon={<Percent className="h-4 w-4 text-emerald-500" />}
            tooltip="Blended take rate"
          />
          <MetricCard
            title="Total Routed via Splits"
            value={simulateEmpty ? 0 : 182450}
            isCurrency={true}
            icon={<PieChart className="h-4 w-4 text-blue-500" />}
            delta={24.8}
            deltaPeriod="vs last month"
          />
          <MetricCard
            title="Avg Tax Holdback"
            value={simulateEmpty ? "0.0%" : "11.2%"}
            isCurrency={false}
            icon={<ShieldCheck className="h-4 w-4 text-purple-500" />}
            tooltip="Auto-escrowed for W-9 / 1099"
          />
        </div>

        {/* Filters and Search Bar */}
        <div className="p-3 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search split templates or formulas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {["all", "creator", "commercial", "exclusive", "tiered"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                  filterCategory === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Splits Listing / Empty State */}
        {displayedSplits.length === 0 ? (
          <div className="p-12 rounded-2xl border border-slate-200 bg-white text-center flex flex-col items-center justify-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
              <PieChart className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Commission Splits Configured</h3>
            <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
              Establish automated split agreements for your roster. Revenue from settled invoices will be automatically divided and placed into talent disbursement queues.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Create First Split Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedSplits.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{item.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>

                  {/* Split Visualizer Bar */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                      <span className="text-indigo-600 flex items-center gap-1">
                        Talent Cut: {item.talentShare}%
                      </span>
                      <span className="text-slate-900 flex items-center gap-1">
                        Agency Take: {item.agencyShare}%
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${item.talentShare}%` }}
                      />
                      <div
                        className="h-full bg-slate-900 transition-all duration-500"
                        style={{ width: `${item.agencyShare}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                      <span>Tax Withholding: {item.taxHoldback}%</span>
                      <span>Assigned to {item.assignedTalentCount} Creators</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[11px]">Updated {item.lastUpdated}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Copied share link for ${item.name}`)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer"
                      title="Copy Split Reference"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => alert(`Editing template: ${item.name}`)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                    >
                      Edit Rule
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Split Rule Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <PieChart className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Create Split Formula</h3>
                    <p className="text-[11px] text-slate-500">Set royalty percentage and disbursement rules</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSplit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Creator Direct 85/15"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Talent Share (%)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={newTalentShare}
                      onChange={(e) => setNewTalentShare(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Agency gets {100 - newTalentShare}%
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tax Holdback (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={newTaxHoldback}
                      onChange={(e) => setNewTaxHoldback(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Held for 1099/W-9 reserves
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Formula Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="creator">Creator Standard</option>
                    <option value="commercial">Commercial Production</option>
                    <option value="exclusive">Exclusive Talent Roster</option>
                    <option value="tiered">Tiered Accelerator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description & Scope
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of when this split applies..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                  />
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
                    Save Split Rule
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
