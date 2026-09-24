"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { downloadTableReportPdf } from "../../../lib/pdfExport";
import { cn } from "../../../lib/utils";
import {
  findMainboardInvoice,
  formatMainboardMoney,
} from "../../../lib/mainboard";
import { apiGetSingleInvoice as fetchSingleInvoice } from "../../../lib/api/invoices";

interface ReceiptInvoice {
  id: string;
  recipient: string;
  amount: number;
  fee: number;
  status: string;
  due: string;
  walletId: string;
  items: { title: string; qty: number; rate: number }[];
}

function StatusBadge({ status }: { status: string }) {
  const isPaid = status.toLowerCase() === "paid" || status.toLowerCase() === "settled" || status.toLowerCase() === "disbursed" || status.toLowerCase() === "talent_disbursed";
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-xl border px-3 text-xs font-bold",
        isPaid ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-700"
      )}
    >
      {isPaid ? "Paid" : status}
    </span>
  );
}

function ReceiptPageContent() {
  const params = useParams<{ invoiceId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawInvoiceId = Array.isArray(params.invoiceId) ? params.invoiceId[0] : params.invoiceId;
  const transactionId = searchParams.get("tx") || "TX-AP-000000";
  const isLoggedInMode = searchParams.get("mode") === "logged_in";
  const mode = isLoggedInMode ? "Logged-in checkout" : "Guest checkout";
  const returnTo = searchParams.get("returnTo") === "dashboard" ? "dashboard" : "mainboard";
  const returnHref = returnTo === "dashboard" ? (isLoggedInMode ? "/branddashboard" : "/dashboard") : "/mainboard";
  const returnLabel = returnTo === "dashboard" ? "Dashboard" : "Mainboard";

  const [invoice, setInvoice] = useState<ReceiptInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!rawInvoiceId) return;

    const loadInvoice = async () => {
      setIsLoading(true);
      try {
        // Try fetching from Firestore database
        const dbInvoice = await fetchSingleInvoice(rawInvoiceId);
        if (dbInvoice) {
          setInvoice({
            id: dbInvoice.id,
            recipient: (dbInvoice as any).agency || dbInvoice.agencyEmail,
            amount: dbInvoice.amount,
            fee: dbInvoice.amount * 0.015, // 1.5% platform fee
            status: dbInvoice.status,
            due: dbInvoice.due,
            walletId: "@agncy" + dbInvoice.id.replace("W-INV-", ""),
            items: [
              {
                title: `${dbInvoice.campaign} - Service Fee (${(dbInvoice as any).talent || "Node Split"})`,
                qty: 1,
                rate: dbInvoice.amount,
              }
            ]
          });
        } else {
          // Fallback to local mock invoices
          const localInvoice = findMainboardInvoice(rawInvoiceId);
          if (localInvoice) {
            setInvoice({
              id: localInvoice.id,
              recipient: localInvoice.recipient,
              amount: localInvoice.amount,
              fee: localInvoice.fee,
              status: localInvoice.status,
              due: localInvoice.due || "Jul 28, 2026",
              walletId: localInvoice.walletId || "@agncy9024",
              items: localInvoice.items,
            });
          }
        }
      } catch (error) {
        console.error("Error loading receipt details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoice();
  }, [rawInvoiceId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900 mx-auto mb-4" />
          <p className="text-xs font-semibold text-slate-500">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <div className="mx-auto flex min-h-screen max-w-[980px] items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Receipt not found
            </p>
            <h1 className="mt-2 text-2xl font-black text-slate-900">Receipt unavailable</h1>
            <p className="mt-2 text-xs font-medium text-slate-500">
              The receipt reference does not match the invoice database.
            </p>
            <Link
              href={returnHref}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all"
            >
              Back to {returnLabel}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const total = invoice.amount + invoice.fee;
  const downloadPdf = () => {
    downloadTableReportPdf({
      title: `Receipt ${invoice.id}`,
      subtitle: "AgncyPay payment receipt and activity log.",
      filename: `agncypay-receipt-${invoice.id}.pdf`,
      summary: [
        { label: "Transaction", value: transactionId },
        { label: "Invoice", value: invoice.id },
        { label: "Total", value: formatMainboardMoney(total) },
      ],
      columns: ["Item", "Qty", "Rate"],
      rows: invoice.items.map((item) => [item.title, item.qty.toString(), formatMainboardMoney(item.rate)]),
      footerNote: "Generated from the AgncyPay receipt screen for archive and reconciliation.",
    });
  };

  const copyReceiptLink = async () => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/receipt/${invoice.id}?tx=${transactionId}&mode=${searchParams.get("mode") || "guest"}&returnTo=${returnTo}`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href={returnHref}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {returnLabel}
          </Link>
          <img
            src="/agncypaybrand.png"
            alt="AgncyPay"
            className="w-[92px] sm:w-[104px] shrink-0 object-contain scale-[1.5] origin-center [filter:invert(1)_brightness(0.15)]"
          />
          <span className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-black text-slate-900 shadow-sm">
            {formatMainboardMoney(total)}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1.26fr)_minmax(380px,0.74fr)]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Receipt reference
                    </p>
                    <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{invoice.recipient}</h2>
                    <p className="mt-1.5 max-w-[760px] text-xs font-medium text-slate-500">
                      The payment has settled and the receipt is ready for download, copy, or audit.
                    </p>
                  </div>
                </div>
                <StatusBadge status={invoice.status} />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
                  <p className="text-[11px] font-semibold text-slate-500">Transaction</p>
                  <p className="mt-1 font-mono text-xs font-bold text-slate-900">{transactionId}</p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
                  <p className="text-[11px] font-semibold text-slate-500">Checkout</p>
                  <p className="mt-1 text-xs font-bold text-slate-900">{mode}</p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
                  <p className="text-[11px] font-semibold text-slate-500">Invoice</p>
                  <p className="mt-1 text-xs font-bold text-slate-900">{invoice.id}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={downloadPdf}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                >
                  <Download className="h-4 w-4 text-slate-500" />
                  View PDF
                </button>
                <button
                  type="button"
                  onClick={copyReceiptLink}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                >
                  <Copy className="h-4 w-4 text-slate-500" />
                  Copy Receipt Link
                </button>
                <Link
                  href={`/request/${invoice.id}?mode=${searchParams.get("mode") || "guest"}&returnTo=${returnTo}`}
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all"
                >
                  Back to Request
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Settlement summary
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">Completed payment</h3>
                </div>
                <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Wallet className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
                  <p className="text-[11px] font-semibold text-slate-500">Subtotal</p>
                  <p className="mt-1 text-base font-black text-slate-900">{formatMainboardMoney(invoice.amount)}</p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
                  <p className="text-[11px] font-semibold text-slate-500">Fee (1.5%)</p>
                  <p className="mt-1 text-base font-black text-slate-900">{formatMainboardMoney(invoice.fee)}</p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
                  <p className="text-[11px] font-semibold text-slate-500">Total Settled</p>
                  <p className="mt-1 text-base font-black text-slate-900">{formatMainboardMoney(total)}</p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-50/40 p-4">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2.5">
                  <p className="text-xs font-bold text-slate-900">Invoice items</p>
                  <span className="text-[11px] font-semibold text-slate-500">{invoice.due}</span>
                </div>
                <div className="mt-3 space-y-2.5 text-xs">
                  {invoice.items.map((item) => (
                    <div
                      key={item.title}
                      className="flex justify-between items-center gap-4 border-b border-slate-100 pb-2 last:border-b-0"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{item.title}</p>
                        <p className="text-[11px] text-slate-500">Qty {item.qty}</p>
                      </div>
                      <span className="font-bold text-slate-900">{formatMainboardMoney(item.rate)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Receipt activity</h3>
              </div>
              <div className="mt-4 space-y-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
                {[
                  "Payment confirmed",
                  "Settlement written to log",
                  "Receipt generated",
                  "Archive ready for download",
                ].map((step, index) => (
                  <div key={step} className="flex items-center gap-3 py-1 text-xs text-slate-700 font-medium">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold text-slate-600">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">Quick log</h3>
              </div>
              <div className="mt-4 space-y-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
                <div className="flex justify-between gap-4 text-xs">
                  <span className="text-slate-500 font-medium">Recipient</span>
                  <span className="text-slate-900 font-bold">{invoice.recipient}</span>
                </div>
                <div className="flex justify-between gap-4 text-xs">
                  <span className="text-slate-500 font-medium">Wallet</span>
                  <span className="text-slate-900 font-mono font-bold">{invoice.walletId}</span>
                </div>
                <div className="flex justify-between gap-4 text-xs">
                  <span className="text-slate-500 font-medium">Source</span>
                  <span className="text-slate-900 font-medium">AgncyPay receipt</span>
                </div>
                <div className="flex justify-between gap-4 text-xs">
                  <span className="text-slate-500 font-medium">Status</span>
                  <span className="text-emerald-600 font-bold">Paid</span>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Link
                href={`/pay/${invoice.id}?mode=${searchParams.get("mode") || "guest"}&returnTo=${returnTo}`}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all"
              >
                Open Payment Page
              </Link>
              <Link
                href={returnHref}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
              >
                Back to {returnLabel}
              </Link>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900 mx-auto mb-4" />
          <p className="text-xs font-semibold text-slate-500">Loading receipt...</p>
        </div>
      </div>
    }>
      <ReceiptPageContent />
    </React.Suspense>
  );
}
