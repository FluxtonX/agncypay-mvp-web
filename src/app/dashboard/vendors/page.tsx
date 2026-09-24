"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Loader2, ChevronLeft, Users, Building2, DollarSign } from "lucide-react";
import { cn } from "../../../lib/utils";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qboConnected, setQboConnected] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/quickbooks/vendors", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setQboConnected(data.connected);
        setVendors(data.vendors || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch vendors page data:", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const totalBalance = vendors.reduce((acc, item) => {
    const num = Number(item.balance.replace(/[^0-9.-]+/g, ""));
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalBalance);

  const activeVendorsCount = vendors.filter((v) => v.active).length;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Vendors Registry
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage vendor profiles, contact details, account numbers, and outstanding balances.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors self-start sm:self-auto"
          >
            <Download className="h-4 w-4 text-slate-400" />
            Export Registry
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Vendors</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{vendors.length}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Active Accounts</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{activeVendorsCount}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Owed Balance</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formattedTotal}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-200/60">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Vendor Table Card */}
      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Vendor Contacts
          </h2>
          <span className="text-xs font-medium text-slate-500">
            {vendors.length} contacts synced from QuickBooks
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <table className="min-w-[900px] table-fixed text-left w-full text-xs">
              <colgroup>
                <col className="w-[300px]" />
                <col className="w-[260px]" />
                <col className="w-[140px]" />
                <col className="w-[120px]" />
                <col className="w-[140px]" />
              </colgroup>
              <thead>
                <tr className="h-10 border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="pl-6 pr-4">Vendor / Company</th>
                  <th className="px-3">Contact Info</th>
                  <th className="px-3">Account #</th>
                  <th className="px-3 text-right">Status</th>
                  <th className="pr-6 pl-3 text-right">Owed Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map((item, i) => (
                  <tr
                    key={`${item.name}-${i}`}
                    className="h-14 hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-800 font-bold text-xs">
                          {item.fallback}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate max-w-[220px]">{item.name}</p>
                          {item.company && <p className="text-[11px] text-slate-400 truncate max-w-[220px]">{item.company}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 text-slate-600 truncate max-w-[240px]">
                      <p>{item.email}</p>
                      {item.phone && item.phone !== "No Phone" && <p className="text-[11px] text-slate-400">{item.phone}</p>}
                    </td>
                    <td className="px-3 font-mono text-slate-500">{item.acctNum}</td>
                    <td className="px-3 text-right">
                      <span className={cn(
                        "inline-flex h-6 items-center rounded-full border px-2.5 text-[10px] font-bold",
                        item.active
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-100 text-slate-600"
                      )}>
                        {item.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="pr-6 pl-3 text-right font-bold text-slate-900">{item.balance}</td>
                  </tr>
                ))}
                {vendors.length === 0 && (
                  <tr>
                    <td colSpan={5} className="h-32 text-center text-sm text-slate-400">
                      No vendors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
