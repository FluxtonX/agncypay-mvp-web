"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  ChevronRight,
  MoreVertical,
  SlidersHorizontal,
  Mail,
  UserCheck,
  Sparkles,
  ArrowLeft,
  X,
  FileSpreadsheet,
  UploadCloud,
  Copy,
  Check,
  ExternalLink,
  FileText
} from "lucide-react";
import { AppShell } from "../../../components/shell/AppShell";
import { MetricCard } from "../../../components/data-display/MetricCard";
import { Money } from "../../../components/financial/Money";

interface TalentMember {
  id: string;
  name: string;
  handle: string;
  category: string;
  splitTemplate: string;
  talentShare: number;
  status: "active" | "kyc_pending" | "invited";
  payoutRail: string;
  ytdEarnings: number;
  email: string;
  joinedDate: string;
}

const INITIAL_TALENT: TalentMember[] = [];

export default function AgencyTalentPage() {
  const [talentList, setTalentList] = useState<TalentMember[]>(INITIAL_TALENT);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "kyc_pending">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New talent form state
  const [newName, setNewName] = useState("");
  const [newHandle, setNewHandle] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCategory, setNewCategory] = useState("Commercial & Lifestyle");
  const [newShare, setNewShare] = useState("85");

  const handleAddTalent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newEntry: TalentMember = {
      id: `tal-${Date.now()}`,
      name: newName,
      handle: newHandle.startsWith("@") ? newHandle : `@${newHandle || newName.toLowerCase().replace(/\s+/g, "")}`,
      category: newCategory,
      splitTemplate: `Standard ${newShare}/${100 - parseInt(newShare || "85")}`,
      talentShare: parseInt(newShare || "85"),
      status: "kyc_pending",
      payoutRail: "Onboarding Pending",
      ytdEarnings: 0,
      email: newEmail,
      joinedDate: "Just now",
    };

    setTalentList((prev) => [newEntry, ...prev]);
    setIsAddModalOpen(false);
    setNewName("");
    setNewHandle("");
    setNewEmail("");
  };

  // CRM / CSV modal state
  const [isCrmModalOpen, setIsCrmModalOpen] = useState(false);
  const [crmTab, setCrmTab] = useState<"csv" | "webhook">("csv");
  const [csvText, setCsvText] = useState("");
  const [crmApiKey, setCrmApiKey] = useState("agncy_crm_948f21e0b5c1928374d81204859a");
  const [crmCopied, setCrmCopied] = useState<string | null>(null);
  const [importedInvites, setImportedInvites] = useState<Array<{ name: string; email: string; link: string }>>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText("https://api.agncypay.internal/crm/webhook");
    setCrmCopied("url");
    setTimeout(() => setCrmCopied(null), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(crmApiKey);
    setCrmCopied("key");
    setTimeout(() => setCrmCopied(null), 2000);
  };

  const handleProcessCsv = async () => {
    if (!csvText.trim()) return;
    setIsImporting(true);
    setImportSuccess(null);

    try {
      const lines = csvText.trim().split("\n");
      const newItems: TalentMember[] = [];
      const newInvites: Array<{ name: string; email: string; link: string }> = [];

      const startIdx = lines[0].toLowerCase().includes("name") || lines[0].toLowerCase().includes("email") ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
        if (parts.length >= 2 && parts[0] && parts[1]) {
          const name = parts[0];
          const email = parts[1];
          const category = parts[2] || "Commercial & Lifestyle";
          const share = parseInt(parts[3] || "85");

          const id = `tal-${Date.now()}-${i}`;
          newItems.push({
            id,
            name,
            handle: `@${name.toLowerCase().replace(/\s+/g, "")}`,
            category,
            splitTemplate: `Standard ${share}/${100 - share}`,
            talentShare: share,
            status: "kyc_pending",
            payoutRail: "Onboarding Pending",
            ytdEarnings: 0,
            email,
            joinedDate: "Just now",
          });

          newInvites.push({
            name,
            email,
            link: `agncypay://activate?token=inv_${id}&email=${encodeURIComponent(email)}`,
          });
        }
      }

      if (newItems.length > 0) {
        setTalentList((prev) => [...newItems, ...prev]);
        setImportedInvites(newInvites);
        setImportSuccess(`Successfully imported ${newItems.length} creators from CSV roster!`);
        setCsvText("");
      }
    } catch (e: any) {
      console.error("CSV parse error:", e);
    } finally {
      setIsImporting(false);
    }
  };

  const filteredTalent = talentList.filter((t) => {
    const matchesQuery =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const totalYtd = talentList.reduce((acc, t) => acc + t.ytdEarnings, 0);

  return (
    <AppShell>
      <div className="space-y-6">
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
          <span className="text-xs text-slate-900 font-bold">Talent Roster</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <Users className="w-6 h-6 text-slate-900 dark:text-slate-100" />
              <span>Agency Talent Roster</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage represented creators, automated payout allocations, KYC verification, and individual split ledgers.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsCrmModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>CRM & CSV Sync</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Creator</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Represented Talent"
            value={talentList.length}
            isCurrency={false}
            icon={<Users className="w-4 h-4 text-blue-600" />}
          />
          <MetricCard
            title="YTD Talent Disbursed"
            value={totalYtd}
            isCurrency={true}
            icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
          />
          <MetricCard
            title="Instant Payout Rails"
            value={talentList.length > 0 ? "Active" : "Ready"}
            isCurrency={false}
            icon={<CreditCard className="w-4 h-4 text-indigo-600" />}
            tooltip="ACH, RTP, FedNow, Wire"
          />
          <MetricCard
            title="KYC Compliance"
            value={`${talentList.filter((t) => t.status === "active").length} Verified`}
            isCurrency={false}
            icon={<ShieldCheck className="w-4 h-4 text-sky-600" />}
            tooltip="FinCEN cleared"
          />
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creator by name, handle, or category..."
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-slate-900 dark:focus:border-slate-300 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1 w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                All Talent ({talentList.length})
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === "active"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter("kyc_pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === "kyc_pending"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                KYC Pending ({talentList.filter((t) => t.status === "kyc_pending").length})
              </button>
            </div>
          </div>
        </div>

        {/* Talent Table or Empty State */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {filteredTalent.length === 0 ? (
            <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mb-4 shadow-2xs">
                <Users className="w-7 h-7 text-slate-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No Talent in Roster</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                No creators have been added yet. Add your first creator manually or use CRM &amp; CSV Sync to import your creator roster.
              </p>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="mt-6 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Creator</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 pl-6">Creator / Handle</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Split Rule</th>
                    <th className="py-3.5 px-4">Payout Rail</th>
                    <th className="py-3.5 px-4">YTD Disbursed</th>
                    <th className="py-3.5 px-4">KYC Status</th>
                    <th className="py-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredTalent.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                            {t.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{t.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{t.handle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {t.category}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-[10px] border border-blue-200 dark:border-blue-800">
                          {t.talentShare}% Talent • {100 - t.talentShare}% Agency
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {t.payoutRail}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">
                        <Money amount={t.ytdEarnings} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        {t.status === "active" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold text-[10px] border border-amber-200 dark:border-amber-800">
                            <Clock3 className="w-3 h-3" />
                            KYC Review
                          </span>
                        )}
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <Link
                          href="/agencydashboard/splits"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors inline-block"
                        >
                          View Splits
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Talent Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Add Creator to Roster</h3>
                  <p className="text-xs text-slate-500">Configure split commission and onboarding invite.</p>
                </div>
              </div>

              <form onSubmit={handleAddTalent} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Creator Legal Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Jordan Rivera"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Public Handle</label>
                  <input
                    type="text"
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value)}
                    placeholder="@handle"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Creator Email</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="creator@email.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
                    >
                      <option>Commercial & Lifestyle</option>
                      <option>Fashion & Beauty</option>
                      <option>Film & VFX</option>
                      <option>Gaming & Tech</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Talent Split (%)</label>
                    <input
                      type="number"
                      min="50"
                      max="95"
                      value={newShare}
                      onChange={(e) => setNewShare(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CRM & CSV Roster Import Modal */}
        {isCrmModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      CRM & Talent Roster Sync
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Import creators via CSV or connect real-time CRM webhooks
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCrmModalOpen(false);
                    setImportSuccess(null);
                    setImportedInvites([]);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
                <button
                  type="button"
                  onClick={() => setCrmTab("csv")}
                  className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                    crmTab === "csv"
                      ? "border-slate-900 dark:border-white text-slate-900 dark:text-white"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>CSV Roster Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCrmTab("webhook")}
                  className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                    crmTab === "webhook"
                      ? "border-slate-900 dark:border-white text-slate-900 dark:text-white"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Generic CRM Webhook</span>
                </button>
              </div>

              {crmTab === "csv" ? (
                <div className="space-y-4 text-xs">
                  {importSuccess && (
                    <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{importSuccess}</span>
                    </div>
                  )}

                  {importedInvites.length > 0 ? (
                    <div className="space-y-3">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        Generated Talent Activation Deep Links (Send to Creators for Mobile Onboarding):
                      </p>
                      <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                        {importedInvites.map((inv, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{inv.name}</p>
                              <p className="text-[11px] text-slate-500 font-mono truncate">{inv.email}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(inv.link);
                                setCrmCopied(`invite_${idx}`);
                                setTimeout(() => setCrmCopied(null), 1500);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                            >
                              {crmCopied === `invite_${idx}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Mobile Link</span>
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setImportedInvites([]);
                            setImportSuccess(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold cursor-pointer"
                        >
                          Import Another File
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="font-semibold text-slate-700 dark:text-slate-300">
                            Paste CSV Data or Drag & Drop Roster
                          </label>
                          <span className="text-[11px] text-slate-400">Format: fullName, email, category, share%</span>
                        </div>
                        <textarea
                          rows={6}
                          value={csvText}
                          onChange={(e) => setCsvText(e.target.value)}
                          placeholder={`fullName,email,category,splitShare\nSophia Taylor,sophia@example.com,Lifestyle & Beauty,85\nLeo Morales,leo@creators.co,Film & VFX,80\nAnya Sharma,anya@studio.io,Tech & Gaming,90`}
                          className="w-full font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 outline-none focus:border-slate-900"
                        />
                      </div>

                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 text-[11px] text-slate-500 space-y-1">
                        <p className="font-bold text-slate-700 dark:text-slate-300">Quick Column Guide:</p>
                        <p>1. <strong className="text-slate-700 dark:text-slate-300">Full Name</strong> (Required) — Creator legal or public name</p>
                        <p>2. <strong className="text-slate-700 dark:text-slate-300">Email</strong> (Required) — Email used for mobile activation invite</p>
                        <p>3. <strong className="text-slate-700 dark:text-slate-300">Category & Split</strong> (Optional) — Representation vertical & talent percentage</p>
                      </div>

                      <div className="pt-2 flex justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setIsCrmModalOpen(false)}
                          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isImporting || !csvText.trim()}
                          onClick={handleProcessCsv}
                          className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold cursor-pointer disabled:opacity-50"
                        >
                          {isImporting ? "Processing Roster..." : "Parse & Import Roster"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Connect your CRM (HubSpot, GoHighLevel, Airtable, Zapier, Make) to automatically sync creators and ingest closed deals as pending payables.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Inbound Webhook Endpoint (POST)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value="https://api.agncypay.internal/crm/webhook"
                          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-[11px] text-slate-900 dark:text-slate-100 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleCopyWebhook}
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                        >
                          {crmCopied === "url" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{crmCopied === "url" ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        API Secret Header (X-AgncyPay-CRM-Key)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="password"
                          readOnly
                          value={crmApiKey}
                          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-[11px] text-slate-900 dark:text-slate-100 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleCopyKey}
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                        >
                          {crmCopied === "key" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{crmCopied === "key" ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 space-y-2">
                    <p className="font-bold text-slate-700 dark:text-slate-300">Supported Event Payloads:</p>
                    <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5">
                      <p className="text-emerald-700 dark:text-emerald-400 font-semibold mb-1">// Event 1: Sync Creator</p>
                      <p>{`{ "event": "talent.sync", "data": { "fullName": "Alex Morgan", "email": "alex@morgan.co" } }`}</p>
                      <p className="text-emerald-700 dark:text-emerald-400 font-semibold mt-2 mb-1">// Event 2: Ingest Deal / Payable</p>
                      <p>{`{ "event": "payable.created", "data": { "amount": 15000, "campaign": "Nike Q3", "talentEmail": "alex@morgan.co" } }`}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsCrmModalOpen(false)}
                      className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
