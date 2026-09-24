"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Network,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useApp } from "../../context/AppContext";
import { Permission, WorkspaceType, normalizeWorkspaceType } from "../../types/workspace";

type FeatureKind =
  | "talent"
  | "splits"
  | "payouts"
  | "clients"
  | "vendors"
  | "reports"
  | "team"
  | "profile"
  | "treasury";

type FeatureRecord = {
  title: string;
  detail: string;
  value: string;
  status: string;
};

type FeatureConfig = {
  title: string;
  subtitle: string;
  cta: string;
  dialogTitle: string;
  dialogFields: { label: string; placeholder: string }[];
  metrics: { label: string; value: string; detail: string }[];
  records: FeatureRecord[];
};

const baseRecords: Record<FeatureKind, FeatureRecord[]> = {
  talent: [
    { title: "Jordan Lee", detail: "Creator - onboarding documents pending", value: "$12.4K", status: "KYC Pending" },
    { title: "Maya Chen", detail: "Fashion talent - payout verified", value: "$8.8K", status: "Active" },
    { title: "Noah Rivera", detail: "Agency talent - split template assigned", value: "$5.2K", status: "Active" },
  ],
  splits: [
    { title: "Creator Standard 80/20", detail: "Talent 80%, agency 20%, auto tax holdback", value: "128 talent", status: "Active" },
    { title: "Campaign Bonus Split", detail: "Tiered bonus after $50K gross campaign volume", value: "12 deals", status: "Review" },
    { title: "Mother Agency Override", detail: "2.5% enterprise oversight fee", value: "18 agencies", status: "Active" },
  ],
  payouts: [
    { title: "June Talent Batch", detail: "31 recipients via ACH", value: "$74,120", status: "Scheduled" },
    { title: "Brand Studio Settlement", detail: "Split reconciliation complete", value: "$18,400", status: "Ready" },
    { title: "Independent Talent Payout", detail: "Awaiting bank confirmation", value: "$3,200", status: "Processing" },
  ],
  clients: [
    { title: "Nike Studios", detail: "Brand client - Mainboard sync active", value: "$320K", status: "Active" },
    { title: "Netflix Originals", detail: "Content campaign invoices", value: "$148K", status: "Active" },
    { title: "Sony Music", detail: "Approval matrix pending", value: "$96K", status: "Setup" },
  ],
  vendors: [
    { title: "Production Vendor Group", detail: "W-9 and payout profile verified", value: "$84K", status: "Active" },
    { title: "Studio Rentals Co", detail: "KYB requires document refresh", value: "$42K", status: "Action" },
    { title: "Regional Fulfillment Ops", detail: "Parent agency approval required", value: "$118K", status: "Review" },
  ],
  reports: [
    { title: "Network Payout Exposure", detail: "Consolidated treasury report", value: "$1.2M", status: "Ready" },
    { title: "Agency Performance", detail: "GMV, SLA, dispute metrics", value: "18 agencies", status: "Ready" },
    { title: "Vendor Compliance", detail: "Missing docs and expiring KYB", value: "12 flags", status: "Action" },
  ],
  team: [
    { title: "Avery Brooks", detail: "Treasury admin", value: "Super Admin", status: "Active" },
    { title: "Sam Patel", detail: "Finance operations", value: "Finance Ops", status: "Active" },
    { title: "Riley Stone", detail: "Regional agency manager", value: "Manager", status: "Invited" },
  ],
  profile: [
    { title: "Agncy Identity", detail: "User identity and profile details", value: "Verified", status: "Active" },
    { title: "Payout Identity", detail: "Bank, tax, and payment recipient profile", value: "ACH", status: "Connected" },
    { title: "Workspace Membership", detail: "Permissions for active workspace", value: "Member", status: "Active" },
  ],
  treasury: [
    { title: "Operating Account", detail: "Primary treasury funding source", value: "$1.84M", status: "Verified" },
    { title: "Pending Release Queue", detail: "5 payout batches awaiting approval", value: "$420K", status: "Approval" },
    { title: "Risk Reserve", detail: "Configured settlement reserve", value: "$250K", status: "Active" },
  ],
};

function configFor(kind: FeatureKind, workspaceType: WorkspaceType): FeatureConfig {
  const isTalent = workspaceType === "talent_agency" || workspaceType === "talent_independent";
  const labels: Record<FeatureKind, Omit<FeatureConfig, "records">> = {
    talent: {
      title: workspaceType === "mother_agency" ? "Talent Network" : "Talent",
      subtitle: "Manage talent relationships, onboarding status, payout readiness, and profile controls.",
      cta: "Add Talent",
      dialogTitle: "Add Talent",
      dialogFields: [
        { label: "Talent Name", placeholder: "Jordan Lee" },
        { label: "Email", placeholder: "talent@example.com" },
        { label: "Category", placeholder: "Creator / Athlete / Artist" },
      ],
      metrics: [
        { label: "Active Talent", value: "128", detail: "9 onboarding" },
        { label: "KYC Complete", value: "91%", detail: "Network verified" },
        { label: "Payout Ready", value: "116", detail: "ACH connected" },
      ],
    },
    splits: {
      title: "Split Structures",
      subtitle: "Configure how invoice proceeds are distributed between talent, agencies, and overrides.",
      cta: "Create Split",
      dialogTitle: "Create Split Template",
      dialogFields: [
        { label: "Template Name", placeholder: "Creator Standard 80/20" },
        { label: "Talent Share", placeholder: "80%" },
        { label: "Agency Share", placeholder: "20%" },
      ],
      metrics: [
        { label: "Active Templates", value: "14", detail: "Across clients" },
        { label: "Auto Matched", value: "99.1%", detail: "This month" },
        { label: "Exceptions", value: "3", detail: "Need review" },
      ],
    },
    payouts: {
      title: "Payouts",
      subtitle: isTalent ? "Track your incoming payouts and payout account readiness." : "Review payout batches, settlement states, and approval readiness.",
      cta: isTalent ? "Update Payout Method" : "Create Payout Batch",
      dialogTitle: isTalent ? "Update Payout Method" : "Create Payout Batch",
      dialogFields: [
        { label: isTalent ? "Account Label" : "Batch Name", placeholder: isTalent ? "Primary ACH" : "June Talent Batch" },
        { label: "Amount", placeholder: "$12,000" },
        { label: "Notes", placeholder: "Settlement notes" },
      ],
      metrics: [
        { label: "Ready", value: "$74K", detail: "Scheduled payouts" },
        { label: "Processing", value: "$18K", detail: "ACH in flight" },
        { label: "Recipients", value: "31", detail: "Current batch" },
      ],
    },
    clients: {
      title: "Clients",
      subtitle: "Manage brand/client relationships, invoice sources, and Mainboard sync readiness.",
      cta: "Add Client",
      dialogTitle: "Add Client",
      dialogFields: [
        { label: "Client Name", placeholder: "Nike Studios" },
        { label: "Domain", placeholder: "https://client.com" },
        { label: "Contact Email", placeholder: "finance@client.com" },
      ],
      metrics: [
        { label: "Active Clients", value: "24", detail: "6 synced" },
        { label: "Open Invoices", value: "$186K", detail: "Client AR" },
        { label: "Approval SLA", value: "2.4d", detail: "Average" },
      ],
    },
    vendors: {
      title: "Vendors",
      subtitle: "Manage vendor identities, compliance status, and payment relationships.",
      cta: "Add Vendor",
      dialogTitle: "Add Vendor",
      dialogFields: [
        { label: "Vendor Name", placeholder: "Studio Rentals Co" },
        { label: "Email", placeholder: "billing@vendor.com" },
        { label: "Service Type", placeholder: "Production / Legal / Ops" },
      ],
      metrics: [
        { label: "Active Vendors", value: "64", detail: "12 require action" },
        { label: "Vendor Spend", value: "$1.1M", detail: "YTD" },
        { label: "KYB Complete", value: "82%", detail: "Vendor network" },
      ],
    },
    reports: {
      title: "Reports",
      subtitle: "Export consolidated network, payout, compliance, and treasury reports.",
      cta: "Generate Report",
      dialogTitle: "Generate Report",
      dialogFields: [
        { label: "Report Name", placeholder: "Network Payout Exposure" },
        { label: "Period", placeholder: "May 2026" },
        { label: "Audience", placeholder: "Treasury / Finance Ops" },
      ],
      metrics: [
        { label: "Ready Reports", value: "8", detail: "Available now" },
        { label: "Compliance Flags", value: "12", detail: "Open items" },
        { label: "Network GMV", value: "$8.7M", detail: "YTD" },
      ],
    },
    team: {
      title: "Team",
      subtitle: "Invite teammates, assign roles, and control permissioned workspace access.",
      cta: "Invite User",
      dialogTitle: "Invite Team Member",
      dialogFields: [
        { label: "Name", placeholder: "Avery Brooks" },
        { label: "Email", placeholder: "avery@company.com" },
        { label: "Role", placeholder: "Finance Ops" },
      ],
      metrics: [
        { label: "Active Users", value: "18", detail: "3 pending invites" },
        { label: "Admins", value: "4", detail: "Privileged access" },
        { label: "Approvers", value: "9", detail: "Invoice controls" },
      ],
    },
    profile: {
      title: "Profile",
      subtitle: "Manage user identity, workspace membership, payout identity, and verification readiness.",
      cta: "Update Profile",
      dialogTitle: "Update Profile",
      dialogFields: [
        { label: "Display Name", placeholder: "Jordan Lee" },
        { label: "Profile Email", placeholder: "you@example.com" },
        { label: "Professional Category", placeholder: "Creator" },
      ],
      metrics: [
        { label: "Identity", value: "Active", detail: "Agncy ID issued" },
        { label: "Verification", value: "KYC", detail: "Profile track" },
        { label: "Payouts", value: "ACH", detail: "Connected" },
      ],
    },
    treasury: {
      title: "Treasury",
      subtitle: "Monitor funding sources, payout reserves, approval queues, and release controls.",
      cta: "Add Treasury Rule",
      dialogTitle: "Add Treasury Rule",
      dialogFields: [
        { label: "Rule Name", placeholder: "Two approvers above $100K" },
        { label: "Threshold", placeholder: "$100,000" },
        { label: "Approver Group", placeholder: "Treasury" },
      ],
      metrics: [
        { label: "Available Funds", value: "$1.84M", detail: "Primary account" },
        { label: "Pending Release", value: "$420K", detail: "5 batches" },
        { label: "Reserve", value: "$250K", detail: "Configured" },
      ],
    },
  };

  return {
    ...labels[kind],
    records: baseRecords[kind],
  };
}

const iconByKind: Record<FeatureKind, React.ReactNode> = {
  talent: <UsersRound className="h-5 w-5" />,
  splits: <Network className="h-5 w-5" />,
  payouts: <BadgeDollarSign className="h-5 w-5" />,
  clients: <BriefcaseBusiness className="h-5 w-5" />,
  vendors: <BriefcaseBusiness className="h-5 w-5" />,
  reports: <FileText className="h-5 w-5" />,
  team: <UsersRound className="h-5 w-5" />,
  profile: <ShieldCheck className="h-5 w-5" />,
  treasury: <BadgeDollarSign className="h-5 w-5" />,
};

const permissionsByKind: Partial<Record<FeatureKind, Permission[]>> = {
  talent: ["manage_talent"],
  splits: ["view_splits"],
  payouts: ["approve_payouts", "manage_payout_settings"],
  clients: ["create_invoices"],
  vendors: ["manage_hierarchy"],
  reports: ["view_reports"],
  team: ["manage_team"],
  treasury: ["view_treasury"],
};

export function RoleFeaturePage({ kind }: { kind: FeatureKind }) {
  const { state } = useApp();
  const workspaceType = state.user ? normalizeWorkspaceType(state.user.accountType) : "brand";
  const activeMembership = state.memberships.find(
    (membership) => membership.workspaceId === state.activeWorkspaceId
  );
  const requiredPermissions = permissionsByKind[kind] ?? [];
  const hasAccess =
    requiredPermissions.length === 0 ||
    requiredPermissions.some((permission) => activeMembership?.permissions.includes(permission));
  const config = useMemo(() => configFor(kind, workspaceType), [kind, workspaceType]);
  const [records, setRecords] = useState(config.records);
  const [metrics, setMetrics] = useState(config.metrics);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FeatureRecord | null>(null);
  const [search, setSearch] = useState("");
  const [isActionRunning, setIsActionRunning] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    setRecords(config.records);
    setMetrics(config.metrics);
    setSearch("");
    setSelectedRecord(null);
  }, [config.records, config.metrics]);

  useEffect(() => {
    if (kind === "payouts") {
      let active = true;
      fetch("/api/quickbooks/payouts", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (!active) return;
          if (data.connected && data.payouts && data.payouts.length > 0) {
            const mappedRecords = data.payouts.map((p: any) => ({
              title: p.name,
              detail: `${p.detail} - Synced via QBO`,
              value: p.amount,
              status: "Settled",
            }));
            setRecords(mappedRecords);

            // Calculate total and unique recipients
            let totalAmount = 0;
            const uniqueVendors = new Set<string>();
            data.payouts.forEach((p: any) => {
              const amtStr = p.amount.replace(/[^0-9.]/g, "");
              const amt = parseFloat(amtStr) || 0;
              totalAmount += amt;
              if (p.name) uniqueVendors.add(p.name);
            });
            const formattedTotal = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(totalAmount);

            setMetrics([
              { label: "Total Synced", value: formattedTotal, detail: "Across all records" },
              { label: "Processing", value: "$0", detail: "All settled in QBO" },
              { label: "Recipients", value: uniqueVendors.size.toString(), detail: "Unique talent/vendors" },
            ]);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch payouts on features page:", err);
        });
      return () => {
        active = false;
      };
    }
  }, [kind]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return records;

    return records.filter((record) =>
      [record.title, record.detail, record.value, record.status]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [records, search]);

  const submitDialog = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = config.dialogFields.map((field) => form[field.label] || field.placeholder);

    setRecords((currentRecords) => [
      {
        title: values[0],
        detail: values.slice(1).join(" - "),
        value: kind === "team" ? "Invited" : kind === "reports" ? "Queued" : "New",
        status: kind === "reports" ? "Generating" : "Draft",
      },
      ...currentRecords,
    ]);
    setForm({});
    setIsDialogOpen(false);
  };

  const runRecordAction = () => {
    if (!selectedRecord) return;

    setIsActionRunning(true);

    window.setTimeout(() => {
      const nextStatus =
        kind === "team"
          ? "Invited"
          : kind === "reports"
            ? "Ready"
            : kind === "payouts"
              ? "Scheduled"
              : kind === "treasury"
                ? "Active"
                : "Updated";

      setRecords((currentRecords) =>
        currentRecords.map((record) =>
          record.title === selectedRecord.title
            ? {
                ...record,
                status: nextStatus,
                value: kind === "reports" ? "Ready" : record.value,
              }
            : record
        )
      );
      setSelectedRecord({ ...selectedRecord, status: nextStatus });
      setIsActionRunning(false);
    }, 900);
  };

  const actionLabel =
    kind === "team"
      ? "Send Invite"
      : kind === "reports"
        ? "Generate Report"
        : kind === "payouts"
          ? "Schedule Payout"
          : kind === "treasury"
            ? "Activate Rule"
            : "Update Record";

  if (!hasAccess) {
    return (
      <div className="w-full max-w-5xl">
        <section className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
            <ShieldCheck className="h-7 w-7 text-slate-900" />
          </div>
          <h1 className="mt-5 text-2xl font-black text-slate-900 tracking-tight">
            Permission Required
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
            Your current workspace role does not include access to this area. Ask an admin to update your membership permissions.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-800">
              {iconByKind[kind]}
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {config.title}
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 max-w-2xl">
            {config.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-300 cursor-pointer shadow-xs"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Export
          </button>
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.99] cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {config.cta}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <section key={metric.label} className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{metric.label}</p>
            <p className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
              {metric.value}
            </p>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {metric.detail}
            </p>
          </section>
        ))}
      </div>

      {/* Records Section */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Current Records
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Live state across all active accounts</p>
          </div>
          <label className="relative block w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search records..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-3 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </label>
        </div>

        <div className="mt-5 space-y-2.5">
          {filteredRecords.map((record, index) => {
            const isSettled = ["active", "settled", "ready", "connected", "verified"].includes(record.status.toLowerCase());
            const isPending = ["processing", "kyc pending", "review", "approval", "scheduled"].includes(record.status.toLowerCase());
            
            return (
              <div
                key={`${record.title}-${index}`}
                className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50/80 p-4 transition-all md:grid-cols-[minmax(0,1fr)_120px_130px_90px] md:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {record.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 truncate">
                    {record.detail}
                  </p>
                </div>
                <p className="text-sm font-bold text-slate-900 md:text-right">
                  {record.value}
                </p>
                <div className="md:text-center">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border",
                    isSettled ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    isPending ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-slate-100 text-slate-700 border-slate-200"
                  )}>
                    {record.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRecord(record)}
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 md:ml-auto cursor-pointer shadow-xs"
                >
                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                  View
                </button>
              </div>
            );
          })}
          {filteredRecords.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-xs text-slate-500 font-medium">
              No records match your query.
            </div>
          )}
        </div>
      </section>

      {/* Create Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm">
          <form
            onSubmit={submitDialog}
            className="flex max-h-[calc(100vh-40px)] w-full max-w-[500px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900">
                {config.dialogTitle}
              </h2>
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                aria-label="Close dialog"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
              {config.dialogFields.map((field) => (
                <div key={field.label} className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    {field.label}
                  </label>
                  <input
                    required
                    value={form[field.label] || ""}
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        [field.label]: event.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-slate-100 p-5 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white transition-all hover:bg-slate-800 cursor-pointer shadow-sm"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm">
          <section className="flex max-h-[calc(100vh-40px)] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex shrink-0 items-start justify-between border-b border-slate-100 p-6">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {config.title}
                </span>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedRecord.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close record detail"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Status</p>
                  <p className="mt-1 text-xs font-bold text-slate-900">
                    {selectedRecord.status}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Value</p>
                  <p className="mt-1 text-xs font-bold text-slate-900">
                    {selectedRecord.value}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Workspace</p>
                  <p className="mt-1 text-xs font-bold text-slate-900 truncate capitalize">
                    {workspaceType.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Details</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-700 font-medium">
                  {selectedRecord.detail}
                </p>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                Actions here update the state for this workspace while keeping role permission boundaries active.
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-slate-100 p-5 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={runRecordAction}
                disabled={isActionRunning}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white transition-all hover:bg-slate-800 cursor-pointer shadow-sm disabled:opacity-60"
              >
                {isActionRunning ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                {actionLabel}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
