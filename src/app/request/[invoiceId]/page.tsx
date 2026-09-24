"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Copy, Download } from "lucide-react";
import { downloadTableReportPdf } from "../../../lib/pdfExport";
import {
  findMainboardInvoice,
  formatMainboardMoney,
} from "../../../lib/mainboard";

function RequestPageContent() {
  const params = useParams<{ invoiceId: string }>();
  const searchParams = useSearchParams();
  const rawInvoiceId = Array.isArray(params.invoiceId) ? params.invoiceId[0] : params.invoiceId;
  const invoiceId = rawInvoiceId?.trim() || "";
  const invoice = findMainboardInvoice(invoiceId);
  const [copyState, setCopyState] = useState<"idle" | "done">("idle");

  useEffect(() => {
    if (copyState !== "done") return;
    const timeout = window.setTimeout(() => setCopyState("idle"), 1500);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center font-sans">
        <div className="max-w-md w-full mx-4 rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Invoice not found</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">Invoice unavailable</h1>
          <Link href="/dashboard" className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const total = invoice.amount + invoice.fee;
  const returnTo = searchParams.get("returnTo") === "dashboard" ? "dashboard" : "mainboard";
  const returnHref = returnTo === "dashboard" ? "/dashboard" : "/mainboard";
  const returnLabel = returnTo === "dashboard" ? "Dashboard" : "Mainboard";
  const payLink = `/pay/${invoice.id}?mode=guest&returnTo=${returnTo}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/request/${invoice.id}?mode=guest`);
    setCopyState("done");
  };

  const downloadPdf = () => {
    downloadTableReportPdf({
      title: `Invoice ${invoice.invoiceNumber}`,
      subtitle: `${invoice.recipient} payable through AgncyPay.`,
      filename: `invoice-${invoice.invoiceNumber}.pdf`,
      summary: [
        { label: "Invoice To", value: invoice.payer },
        { label: "Payee", value: invoice.recipient },
        { label: "Invoice Date", value: invoice.invoiceDate },
        { label: "Total", value: formatMainboardMoney(total) },
      ],
      columns: ["Rate Type", "Fee Type", "Note", "Qty", "Rate", "Amount"],
      rows: invoice.items.map((item) => [
        item.title,
        item.feeType,
        item.note || "",
        item.qty.toString(),
        formatMainboardMoney(item.rate),
        formatMainboardMoney(item.qty * item.rate),
      ]),
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-[1120px] items-center justify-between gap-4 px-4">
          <Link href={returnHref} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {returnLabel}
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Copy className="h-4 w-4 text-slate-500" />
              {copyState === "done" ? "Copied" : "Copy Link"}
            </button>
            <button
              type="button"
              onClick={downloadPdf}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Download className="h-4 w-4 text-slate-500" />
              PDF
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1120px] px-4 py-6">
        <section className="relative min-h-[760px] bg-white px-10 py-8 shadow-2xl sm:px-16">
          <div className="flex items-start justify-between gap-10">
            <div>
              <div className="text-[#1f6eb7]">
                <p className="text-[54px] font-black leading-[0.75] tracking-[-0.08em]">m</p>
                <p className="mt-1 text-[19px] font-black uppercase tracking-[-0.04em]">Models</p>
              </div>
              <p className="mt-6 text-[13px] font-bold">Invoice To:</p>
              <p className="text-[13px] font-semibold">{invoice.payer}</p>
              <div className="mt-6 text-[12px] leading-5">
                <p>{invoice.payerEmail}</p>
                {invoice.payerAddress.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>

            <div className="w-[380px]">
              <div className="mb-12 h-[2px] w-full bg-[#222]" />
              <h1 className="text-[28px] font-medium tracking-[-0.03em]">INVOICE</h1>
              <div className="mt-5 grid grid-cols-[1fr_auto] gap-x-8 gap-y-1">
                <span className="text-[20px] font-bold">Invoice Number</span>
                <span className="text-[20px] font-black text-[#5b1f65]">{invoice.invoiceNumber}</span>
                <span className="text-[14px] font-bold">Invoice Date</span>
                <span className="text-[14px]">{invoice.invoiceDate}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t-[3px] border-[#222] pt-4">
            <p className="text-[15px] font-bold">Details</p>
            <div className="mt-5 grid grid-cols-2 gap-x-16 text-[13px]">
              <div className="grid grid-cols-[100px_1fr] gap-y-3">
                <span>Product</span>
                <span>{invoice.jobType}</span>
                <span>Job Type</span>
                <span>{invoice.jobType}</span>
                <span>Dates</span>
                <span>{invoice.invoiceDate} to {invoice.due}</span>
                <span>Talent Name</span>
                <span>{invoice.talentName}</span>
              </div>
              <div className="grid grid-cols-[130px_1fr] gap-y-3">
                <span>Job Number</span>
                <span>{invoice.jobNumber}</span>
                <span>PO Number</span>
                <span>{invoice.poNumber}</span>
                <span>Talent Real Name</span>
                <span>{invoice.talentRealName}</span>
              </div>
            </div>
          </div>

          <table className="mt-8 w-full text-left text-[13px]">
            <thead>
              <tr className="border-b-[3px] border-[#222]">
                <th className="py-2 font-bold">Date</th>
                <th className="py-2 font-bold">Rate Type</th>
                <th className="py-2 font-bold">Fee Type</th>
                <th className="py-2 font-bold">Note</th>
                <th className="py-2 text-right font-bold">Qty</th>
                <th className="py-2 text-right font-bold">Rate</th>
                <th className="py-2 text-right font-bold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={`${item.title}-${item.note || ""}`}>
                  <td className="py-1.5">{item.date || ""}</td>
                  <td className="py-1.5">{item.title}</td>
                  <td className="py-1.5">{item.feeType}</td>
                  <td className="py-1.5">{item.note || ""}</td>
                  <td className="py-1.5 text-right">{item.qty}</td>
                  <td className="py-1.5 text-right">{item.rate.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                  <td className="py-1.5 text-right">{(item.qty * item.rate).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 grid grid-cols-[1fr_380px] gap-8 border-t-[3px] border-[#222] pt-4">
            <p className="text-[14px] font-bold">Notes</p>
            <div className="space-y-2 text-[14px]">
              <div className="grid grid-cols-[1fr_60px_120px]">
                <span className="font-bold">Subtotal:</span>
                <span>USD</span>
                <span className="text-right">{invoice.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="grid grid-cols-[1fr_60px_120px] border-b-2 border-[#222] pb-3">
                <span className="font-bold">Agency Fee:</span>
                <span>USD</span>
                <span className="text-right">{invoice.fee.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="grid grid-cols-[1fr_60px_120px] pt-1 text-[20px] font-black">
                <span>Total:</span>
                <span>USD</span>
                <span className="text-right">{total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Link
              href={payLink}
              className="inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-900 px-7 text-base font-bold text-white hover:bg-slate-800 shadow-sm active:scale-[0.99] transition-all"
            >
              <Image src="/agncypayLogo.png" alt="AgncyPay" width={180} height={82} className="w-[58px] max-h-[20px] object-contain [filter:invert(1)_brightness(1.5)]" />
              <span>Now</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function RequestPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900 mx-auto mb-4" />
          <p className="text-xs font-semibold text-slate-500">Loading invoice...</p>
        </div>
      </div>
    }>
      <RequestPageContent />
    </React.Suspense>
  );
}
