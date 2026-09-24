"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Search,
  ShieldCheck,
  X,
  CreditCard,
  Building2,
  Zap,
  Bitcoin,
  Loader2
} from "lucide-react";
import { downloadTableReportPdf } from "../../lib/pdfExport";
import { cn } from "../../lib/utils";
import {
  formatMainboardMoney,
  mainboardInvoices,
  type MainboardInvoiceStatus,
} from "../../lib/mainboard";

const statusStyles: Record<MainboardInvoiceStatus, string> = {
  Ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  "Needs approval": "border-amber-200 bg-amber-50 text-amber-700",
  Processing: "border-blue-200 bg-blue-50 text-blue-700",
  Paid: "border-slate-200 bg-slate-100 text-slate-700",
};

function StatusBadge({ status }: { status: MainboardInvoiceStatus }) {
  return (
    <span className={cn("inline-flex h-6 items-center rounded-lg border px-2.5 text-[11px] font-bold", statusStyles[status])}>
      {status}
    </span>
  );
}

export default function MainboardPage() {
  const [invoices, setInvoices] = useState(mainboardInvoices);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(mainboardInvoices[0].id);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  // Embedded Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentRail, setPaymentRail] = useState("ACH");
  const [paymentTerm, setPaymentTerm] = useState("Pay Now");

  const selectedInvoice = invoices.find((invoice) => invoice.id === selectedInvoiceId) || invoices[0];
  const selectedInvoicesList = selectedIds.length > 0
    ? invoices.filter((invoice) => selectedIds.includes(invoice.id))
    : [selectedInvoice];

  const readyInvoices = invoices.filter((invoice) => invoice.status === "Ready");
  const totalReady = readyInvoices.reduce((sum, invoice) => sum + invoice.amount + invoice.fee, 0);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return invoices;
    return invoices.filter((invoice) =>
      [invoice.id, invoice.invoiceNumber, invoice.recipient, invoice.email, invoice.status, invoice.jobType]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [search, invoices]);

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/request/${selectedInvoice.id}?mode=guest`);
  };

  const exportSelected = () => {
    const rows = selectedInvoicesList.map((invoice) => [
      invoice.invoiceNumber,
      invoice.recipient,
      invoice.jobType,
      invoice.due,
      formatMainboardMoney(invoice.amount + invoice.fee),
      invoice.status,
    ]);

    downloadTableReportPdf({
      title: "Mainboard Payables Export",
      subtitle: "AgncyPay-ready invoice queue export.",
      filename: "mainboard-payables.pdf",
      summary: [
        { label: "Workspace", value: "Mainboard LLC" },
        { label: "Invoices", value: rows.length.toString() },
        { label: "Ready total", value: formatMainboardMoney(totalReady) },
      ],
      columns: ["Invoice", "Payee", "Job", "Due", "Total", "Status"],
      rows,
    });
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      // Update local invoice state
      setInvoices(current => current.map(inv => {
        if (selectedInvoicesList.some(s => s.id === inv.id)) {
          return { ...inv, status: "Processing" };
        }
        return inv;
      }));

      setTimeout(() => {
        setIsCheckoutOpen(false);
        setIsSuccess(false);
        setSelectedIds([]);
      }, 2000);
    }, 1500);
  };

  const totalToPay = selectedInvoicesList.reduce((sum, inv) => sum + inv.amount + inv.fee, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Mainboard LLC</p>
              <h1 className="text-lg font-black text-slate-900">Accounts Payable</h1>
            </div>
          </div>

          <div className="hidden w-full max-w-[480px] items-center gap-3 lg:flex">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search invoice, payee, job, or status"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
              />
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Pay with AgncyPay
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Ready to pay", readyInvoices.length.toString(), formatMainboardMoney(totalReady)],
            ["Needs approval", invoices.filter((invoice) => invoice.status === "Needs approval").length.toString(), "Finance review"],
            ["Processing", invoices.filter((invoice) => invoice.status === "Processing").length.toString(), "AgncyPay sync"],
            ["Paid this month", invoices.filter((invoice) => invoice.status === "Paid").length.toString(), "Receipts available"],
          ].map(([label, value, detail]) => (
            <article key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-black text-slate-900 tracking-tight">{value}</p>
              <p className="mt-1.5 text-xs font-medium text-slate-500">{detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-7 mx-auto max-w-[1100px] flex flex-col gap-6">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Payments Ledger</h2>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">Review approved vendor invoices and submit payment through AgncyPay.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportSelected}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                  >
                    <Download className="h-4 w-4 text-slate-500" />
                    Export
                  </button>
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Pay with AgncyPay
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] table-fixed text-left text-xs">
                  <colgroup>
                    <col className="w-[48px]" />
                    <col className="w-[116px]" />
                    <col className="w-[210px]" />
                    <col className="w-[190px]" />
                    <col className="w-[120px]" />
                    <col className="w-[126px]" />
                    <col className="w-[118px]" />
                  </colgroup>
                  <thead>
                    <tr className="h-11 border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="pl-4">
                        <input
                          type="checkbox"
                          aria-label="Select all visible invoices"
                          checked={filteredInvoices.length > 0 && selectedIds.length === filteredInvoices.length}
                          onChange={() =>
                            setSelectedIds((current) =>
                              current.length === filteredInvoices.length ? [] : filteredInvoices.map((invoice) => invoice.id)
                            )
                          }
                          className="h-4 w-4 rounded accent-slate-900"
                        />
                      </th>
                      <th>Invoice</th>
                      <th>Payee</th>
                      <th>Job</th>
                      <th>Due</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => {
                      const isActive = invoice.id === selectedInvoice.id;
                      const isSelected = selectedIds.includes(invoice.id);

                      return (
                        <tr
                          key={invoice.id}
                          onClick={() => setSelectedInvoiceId(invoice.id)}
                          className={cn("h-16 cursor-pointer border-b border-slate-100 hover:bg-slate-50/80 transition-colors", isActive && "bg-slate-50")}
                        >
                          <td className="pl-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(event) => {
                                event.stopPropagation();
                                setSelectedIds((current) =>
                                  current.includes(invoice.id) ? current.filter((id) => id !== invoice.id) : [...current, invoice.id]
                                );
                              }}
                              onClick={(event) => event.stopPropagation()}
                              className="h-4 w-4 rounded accent-slate-900"
                            />
                          </td>
                          <td className="font-mono text-xs font-bold text-slate-900">{invoice.invoiceNumber}</td>
                          <td>
                            <p className="truncate text-xs font-bold text-slate-900">{invoice.recipient}</p>
                            <p className="mt-0.5 truncate text-[11px] text-slate-500">{invoice.email}</p>
                          </td>
                          <td>
                            <p className="truncate text-xs text-slate-800">{invoice.jobType}</p>
                            <p className="mt-0.5 text-[11px] text-slate-500">{invoice.poNumber}</p>
                          </td>
                          <td className="text-xs text-slate-600 font-medium">{invoice.due}</td>
                          <td className="text-xs font-bold text-slate-900">{formatMainboardMoney(invoice.amount + invoice.fee)}</td>
                          <td>
                            <StatusBadge status={invoice.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {selectedIds.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-sm font-bold text-white">{selectedIds.length} invoice{selectedIds.length === 1 ? "" : "s"} selected</p>
                  <p className="mt-0.5 text-xs text-slate-300">Ready for batch payment via AgncyPay integration.</p>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="h-9 rounded-xl border border-slate-700 bg-transparent px-4 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="h-9 rounded-xl bg-white px-4 text-xs font-bold text-slate-900 hover:bg-slate-100 shadow-sm flex items-center gap-2 transition-all active:scale-[0.99]"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-900" />
                    Batch Pay
                  </button>
                </div>
              </section>
            )}
          </div>
        </section>
      </main>

      {/* Embedded AgncyPay Checkout Modal/Slide-over */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)}></div>

          <div className="relative w-full md:w-[540px] h-full bg-[#F8FAFC] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="h-20 border-b border-black/5 flex items-center justify-between px-8 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-5 h-5 text-[#38BDF8]" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-[#0F172A] leading-tight">AGNCYPay Checkout</h2>
                  <p className="text-[12px] text-[#64748B] font-medium">Secure embedded payment</p>
                </div>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-black/5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 text-[#0F172A]">

              {/* Summary */}
              <div className="mb-8">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#64748B] mb-4">Payment Summary</h3>
                <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm">
                  <div className="space-y-3 mb-4 max-h-[160px] overflow-y-auto pr-2">
                    {selectedInvoicesList.map(inv => (
                      <div key={inv.id} className="flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                          <span className="font-semibold">{inv.recipient}</span>
                          <span className="text-[#64748B] text-xs font-mono">{inv.invoiceNumber}</span>
                        </div>
                        <span className="font-semibold">{formatMainboardMoney(inv.amount + inv.fee)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-black/5 flex justify-between items-center">
                    <span className="font-bold">Total to Pay</span>
                    <span className="text-2xl font-black">{formatMainboardMoney(totalToPay)}</span>
                  </div>
                </div>
              </div>

              {/* Rails Selection */}
              <div className="mb-8">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#64748B] mb-4">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "ACH", icon: Building2, label: "ACH Transfer", sub: "Free • 2-3 days" },
                    { id: "RTP", icon: Zap, label: "Real-Time", sub: "1.5% • Instant" },
                    { id: "Wire", icon: CreditCard, label: "Wire Transfer", sub: "$15 • Same day" },
                    { id: "Stablecoin", icon: Bitcoin, label: "USDC", sub: "0.5% • Instant" }
                  ].map(rail => (
                    <button
                      key={rail.id}
                      onClick={() => setPaymentRail(rail.id)}
                      className={cn("p-4 rounded-xl border text-left transition-all", paymentRail === rail.id ? "border-[#0F172A] bg-white shadow-md ring-1 ring-[#0F172A]" : "border-black/10 bg-transparent hover:bg-white")}
                    >
                      <rail.icon className={cn("w-5 h-5 mb-2", paymentRail === rail.id ? "text-[#0F172A]" : "text-[#64748B]")} />
                      <div className="font-bold text-sm">{rail.label}</div>
                      <div className="text-xs text-[#64748B] mt-0.5">{rail.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms Selection */}
              <div className="mb-8">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#64748B] mb-4">Payment Terms</h3>
                <div className="bg-white p-1 rounded-xl border border-black/5 flex shadow-sm">
                  {["Pay Now", "Net-30", "Net-60", "Installments"].map(term => (
                    <button
                      key={term}
                      onClick={() => setPaymentTerm(term)}
                      className={cn("flex-1 py-2.5 text-xs font-bold rounded-lg transition-all", paymentTerm === term ? "bg-[#0F172A] text-white shadow-md" : "text-[#64748B] hover:text-[#0F172A]")}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-8 bg-white border-t border-black/5 shrink-0">
              <button
                onClick={handleProcessPayment}
                disabled={isProcessing || isSuccess}
                className={cn("w-full h-14 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-lg", isSuccess ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-[#0F172A] text-white hover:-translate-y-0.5 shadow-[#0F172A]/20 hover:shadow-xl hover:shadow-[#0F172A]/30")}
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing securely...</>
                ) : isSuccess ? (
                  <><Check className="w-5 h-5" /> Payment Successful</>
                ) : (
                  <>Authorize {formatMainboardMoney(totalToPay)}</>
                )}
              </button>
              <p className="text-center text-[11px] text-[#94A3B8] mt-4 font-medium flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Secured by AGNCYPay Financial Infrastructure
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
