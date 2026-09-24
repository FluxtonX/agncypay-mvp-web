"use client";

import React, { useMemo, useState } from "react";
import { Building2, Mail, Phone, Plus, X } from "lucide-react";
import { cn } from "../../../lib/utils";

type Agency = {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Paused";
  totalSpend: number;
  invoices: number;
  monthlySpend: number;
};

const initialAgencies: Agency[] = [
  {
    id: "creative-co",
    agencyId: "AGY-1001",
    name: "Creative Co",
    email: "billing@creativeco.com",
    phone: "+1 (555) 123-4567",
    status: "Active",
    totalSpend: 245000,
    invoices: 28,
    monthlySpend: 42000,
  },
  {
    id: "media-partners",
    agencyId: "AGY-1002",
    name: "Media Partners",
    email: "contact@mediapartners.com",
    phone: "+1 (555) 234-5678",
    status: "Active",
    totalSpend: 198000,
    invoices: 22,
    monthlySpend: 38000,
  },
  {
    id: "digital-agency",
    agencyId: "AGY-1003",
    name: "Digital Agency",
    email: "team@digitalagency.com",
    phone: "+1 (555) 345-6789",
    status: "Active",
    totalSpend: 187000,
    invoices: 19,
    monthlySpend: 33000,
  },
  {
    id: "brand-studio",
    agencyId: "AGY-1004",
    name: "Brand Studio",
    email: "hello@brandstudio.com",
    phone: "+1 (555) 456-7890",
    status: "Active",
    totalSpend: 156000,
    invoices: 16,
    monthlySpend: 29000,
  },
  {
    id: "marketing-pro",
    agencyId: "AGY-1005",
    name: "Marketing Pro",
    email: "info@marketingpro.com",
    phone: "+1 (555) 567-8901",
    status: "Active",
    totalSpend: 124000,
    invoices: 14,
    monthlySpend: 25000,
  },
];

function formatCompactMoney(value: number) {
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <section className="flex flex-col justify-center rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
        {value}
      </p>
    </section>
  );
}

function AgencyCard({
  agency,
  onViewDetails,
}: {
  agency: Agency;
  onViewDetails: (agency: Agency) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-bold text-slate-900">
                  {agency.name}
                </h2>
                <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-600">
                  {agency.agencyId}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 font-medium">
                Verified Counterparty
              </p>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
              agency.status === "Active"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-100 text-slate-600"
            )}
          >
            {agency.status}
          </span>
        </div>

        <div className="mt-5 space-y-2 rounded-xl border border-slate-200/70 bg-slate-50/50 p-3.5">
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{agency.email}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>{agency.phone}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Spend</p>
            <p className="mt-1 text-base font-black text-slate-900">{formatCompactMoney(agency.totalSpend)}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Invoices</p>
            <p className="mt-1 text-base font-black text-slate-900">{agency.invoices}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onViewDetails(agency)}
        className="mt-5 h-10 w-full rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-300 shadow-xs cursor-pointer"
      >
        View Details
      </button>
    </section>
  );
}

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>(initialAgencies);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeAgency, setActiveAgency] = useState<Agency | null>(null);
  const [form, setForm] = useState({
    name: "",
    agencyId: "",
    email: "",
    phone: "",
  });

  const stats = useMemo(() => {
    const totalSpend = agencies.reduce((total, agency) => total + agency.totalSpend, 0);
    const activeInvoices = agencies.reduce((total, agency) => total + agency.invoices, 0);
    const monthlySpend = agencies.reduce(
      (total, agency) => total + agency.monthlySpend,
      0
    );

    return {
      totalAgencies: agencies.length,
      totalSpend,
      activeInvoices,
      monthlySpend,
    };
  }, [agencies]);

  const addAgency = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const agencyId = form.agencyId.trim().toUpperCase();
    const nextAgency: Agency = {
      id: `${agencyId.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      agencyId,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      status: "Active",
      totalSpend: 0,
      invoices: 0,
      monthlySpend: 0,
    };

    setAgencies((currentAgencies) => [nextAgency, ...currentAgencies]);
    setForm({ name: "", agencyId: "", email: "", phone: "" });
    setIsAddOpen(false);
  };

  return (
    <div className="w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Agencies
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Manage your agency partnerships, settlement profiles, and spend distribution.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.99] shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Add Agency
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Agencies" value={stats.totalAgencies.toString()} />
        <StatCard title="Total Spend (YTD)" value={formatCompactMoney(stats.totalSpend)} />
        <StatCard title="Active Invoices" value={stats.activeInvoices.toString()} />
        <StatCard title="Avg. Monthly Spend" value={formatCompactMoney(stats.monthlySpend)} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {agencies.map((agency) => (
          <AgencyCard
            key={agency.id}
            agency={agency}
            onViewDetails={setActiveAgency}
          />
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm">
          <form
            onSubmit={addAgency}
            className="w-full max-w-[500px] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Add Agency
              </h2>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                aria-label="Close add agency"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ["Agency Name", "name", "Creative Studio"],
                ["Agency ID", "agencyId", "AGY-1006"],
                ["Email", "email", "billing@example.com"],
                ["Phone", "phone", "+1 (555) 000-0000"],
              ].map(([label, key, placeholder]) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    {label}
                  </label>
                  <input
                    required
                    value={form[key as keyof typeof form]}
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        [key]: event.target.value,
                      }))
                    }
                    placeholder={placeholder}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
              >
                Save Agency
              </button>
            </div>
          </form>
        </div>
      )}

      {activeAgency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm">
          <section className="w-full max-w-[500px] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100">
                  <Building2 className="h-5 w-5 text-slate-700" />
                </div>
                <h2 className="truncate text-lg font-bold text-slate-900">
                  {activeAgency.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveAgency(null)}
                aria-label="Close agency details"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3 border-b border-slate-100 pb-5">
              <p className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-500">Agency ID</span>
                <span className="font-mono font-bold text-slate-900">{activeAgency.agencyId}</span>
              </p>
              <p className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-500">Contact Email</span>
                <span className="font-medium text-slate-900">{activeAgency.email}</span>
              </p>
              <p className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-500">Telephone</span>
                <span className="font-medium text-slate-900">{activeAgency.phone}</span>
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current Status</p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {activeAgency.status}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Spend</p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {formatCompactMoney(activeAgency.totalSpend)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveAgency(null)}
                className="h-10 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
