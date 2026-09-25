"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Building2,
  ShieldCheck,
  CreditCard,
  Users,
  Key,
  Bell,
  CheckCircle2,
  Copy,
  Plus,
  ArrowLeft,
  Trash2,
  Mail,
  Lock,
  Globe,
  DollarSign,
  Save,
  Check
} from "lucide-react";
import { AppShell } from "../../../components/shell/AppShell";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Finance Director" | "Talent Manager" | "Viewer";
  status: "active" | "invited";
  joinedDate: string;
}

const INITIAL_TEAM: TeamMember[] = [
  {
    id: "usr-1",
    name: "Ikram",
    email: "ikram5@gmail.com",
    role: "Owner",
    status: "active",
    joinedDate: "Jan 2026",
  },
  {
    id: "usr-2",
    name: "Sophia Martinez",
    email: "sophia@agencytalent.com",
    role: "Finance Director",
    status: "active",
    joinedDate: "Feb 2026",
  },
  {
    id: "usr-3",
    name: "Liam O'Connor",
    email: "liam@agencytalent.com",
    role: "Talent Manager",
    status: "active",
    joinedDate: "Mar 2026",
  },
];

export default function AgencySettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "payouts" | "team" | "api">("general");
  const [agencyName, setAgencyName] = useState("Ikram's Workspace");
  const [legalName, setLegalName] = useState("Ikram Media Group LLC");
  const [taxId, setTaxId] = useState("XX-XXX8921");
  const [supportEmail, setSupportEmail] = useState("ikram5@gmail.com");
  const [currency, setCurrency] = useState("USD");
  
  // Payout defaults
  const [defaultRail, setDefaultRail] = useState("Chase RTP Instant");
  const [autoRelease, setAutoRelease] = useState(true);
  const [minDisbursal, setMinDisbursal] = useState("100");
  const [defaultTaxHoldback, setDefaultTaxHoldback] = useState("10");

  // Team
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM);
  const [simulateEmptyTeam, setSimulateEmptyTeam] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Invite modal
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"Finance Director" | "Talent Manager" | "Viewer">("Talent Manager");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    const newMember: TeamMember = {
      id: `usr-${Date.now()}`,
      name: newMemberEmail.split("@")[0],
      email: newMemberEmail.trim(),
      role: newMemberRole,
      status: "invited",
      joinedDate: "Just now",
    };

    setTeamMembers([...teamMembers, newMember]);
    setNewMemberEmail("");
    setShowInviteModal(false);
    setSimulateEmptyTeam(false);
  };

  const displayedTeam = simulateEmptyTeam ? [] : teamMembers;

  return (
    <AppShell>
      <div className="flex flex-col gap-6 max-w-5xl">
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
          <span className="text-xs text-slate-600 font-semibold">Financial Infrastructure</span>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs text-slate-900 font-bold">Agency Settings</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <Settings className="h-6 w-6 text-slate-700" />
              Agency Infrastructure & Settings
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure legal entity identity, default settlement rails, team permissions, and API integrations.
            </p>
          </div>

          {savedSuccess && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="h-4 w-4 text-emerald-600" />
              Preferences Saved
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
          {[
            { id: "general", label: "General & Entity", icon: Building2 },
            { id: "payouts", label: "Payout Policies", icon: CreditCard },
            { id: "team", label: "Team & Permissions", icon: Users },
            { id: "api", label: "API & Webhooks", icon: Key },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: General & Entity */}
        {activeTab === "general" && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Legal Business Profile</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Verified Legal Entity
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Agency Display Name
                  </label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Legal Entity
                  </label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    EIN / Federal Tax ID
                  </label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Billing & Operations Email
                  </label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Settlement Base Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full sm:w-64 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="USD">USD - United States Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="CAD">CAD - Canadian Dollar (C$)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Legal Profile
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Payout Policies */}
        {activeTab === "payouts" && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Automated Settlement & Disbursal Policies
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default Talent Disbursal Rail
                  </label>
                  <select
                    value={defaultRail}
                    onChange={(e) => setDefaultRail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="Chase RTP Instant">Chase RTP Instant (Sub-10s clearing)</option>
                    <option value="FedNow Real-Time">FedNow Real-Time Service</option>
                    <option value="Evolve ACH Direct">Evolve Bank ACH Direct (Same-day)</option>
                    <option value="Mercury Wire">Mercury Domestic Wire</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">Used when talent doesn't specify an explicit routing override.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Standard Tax Holdback (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={defaultTaxHoldback}
                    onChange={(e) => setDefaultTaxHoldback(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Escrowed for quarterly 1099 withholding compliance.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Auto-Disburse Settled Invoices</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Automatically trigger talent bank payouts as soon as client brand funds clear via Plaid/ACH.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoRelease(!autoRelease)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    autoRelease ? "bg-slate-900" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      autoRelease ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Payout Policies
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Team & Permissions */}
        {activeTab === "team" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Agency Team & Access</h3>
                  <p className="text-xs text-slate-500">Manage member permissions and roles across the agency portal.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSimulateEmptyTeam(!simulateEmptyTeam)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      simulateEmptyTeam
                        ? "bg-amber-50 text-amber-800 border-amber-300"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {simulateEmptyTeam ? "Show Team Roster" : "Simulate Empty State"}
                  </button>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Invite Member
                  </button>
                </div>
              </div>

              {displayedTeam.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
                    <Users className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">No Additional Team Members</h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                    Invite finance controllers, account managers, and agency partners to collaborate on talent payments and campaign billing.
                  </p>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    Invite First Teammate
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {displayedTeam.map((member) => (
                    <div key={member.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{member.name}</span>
                            {member.status === "invited" && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Pending Invite
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block">{member.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-600 px-2 py-0.5 rounded-md bg-slate-100">
                          {member.role}
                        </span>
                        {member.role !== "Owner" && (
                          <button
                            onClick={() => setTeamMembers(teamMembers.filter((m) => m.id !== member.id))}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                            title="Remove Member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: API & Webhooks */}
        {activeTab === "api" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Developer Credentials & Webhooks
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Publishable Key
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="pk_live_agncy_9018402947192841"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 text-slate-700"
                    />
                    <button
                      onClick={() => alert("Copied Publishable Key")}
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Secret Key
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      readOnly
                      value="sk_live_agncy_secret_key_84920491823901"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 text-slate-700"
                    />
                    <button
                      onClick={() => alert("Copied Secret Key")}
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Webhook Settlement Endpoint URL
                  </label>
                  <input
                    type="url"
                    defaultValue="https://api.youragency.com/webhooks/agncypay"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Receives real-time POST events: <code>invoice.settled</code>, <code>payout.disbursed</code>, <code>chargeback.flagged</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invite Member Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Invite Team Member</h3>
              <p className="text-xs text-slate-500 mb-4">Grant access to manage splits, payouts, or brand invoicing.</p>

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="teammate@agency.com"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Access Role</label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="Finance Director">Finance Director (Full Treasury & Payout access)</option>
                    <option value="Talent Manager">Talent Manager (Roster & Splits management)</option>
                    <option value="Viewer">Viewer (Read-only reports)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-xs"
                  >
                    Send Invitation
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
