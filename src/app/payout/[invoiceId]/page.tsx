"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Coins,
  Sparkles,
  ArrowRight,
  TrendingUp,
  User,
  Users,
  RefreshCw,
  Calendar,
  AlertCircle
} from "lucide-react";
import { formatMainboardMoney } from "../../../lib/mainboard";
import { AgncyPayLogo } from "../../../components/payment/AgncyPayLogo";
import { useApp } from "../../../context/AppContext";
import { apiGetSingleInvoice as fetchSingleInvoice, apiUpdateInvoiceStatus as updateInvoiceStatus } from "../../../lib/api/invoices";

type PayoutStage = "confirmation" | "processing" | "success";

interface normalizedPayoutInvoice {
  id: string;
  campaignName: string;
  recipient: string;
  talentName: string;
  amount: number;
  talentAmount: number;
  agencyAmount: number;
  isWidget: boolean;
  status: string;
  splits?: {
    talentName: string;
    talentEmail: string;
    amount: number;
    status: "pending" | "disbursed";
  }[];
}

export default function PayoutDisbursementPage() {
  const params = useParams<{ invoiceId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawInvoiceId = Array.isArray(params.invoiceId) ? params.invoiceId[0] : params.invoiceId;
  const { state } = useApp();

  const [invoice, setInvoice] = useState<normalizedPayoutInvoice | null>(null);
  const [stage, setStage] = useState<PayoutStage>("confirmation");
  const [payoutMethod, setPayoutMethod] = useState<"wallet" | "ach">("wallet");
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    if (!rawInvoiceId) return;

    const loadInvoice = async () => {
      try {
        const w = await fetchSingleInvoice(rawInvoiceId);
        if (w) {
          const talentTotal = w.splits && w.splits.length > 0
            ? w.splits.reduce((acc, cur) => acc + cur.amount, 0)
            : w.amount * 0.85;
          const agencyTotal = w.amount - talentTotal;

          setInvoice({
            id: w.id,
            campaignName: w.campaign,
            recipient: (w as any).agency || w.agencyEmail,
            talentName: (w as any).talent || "Production Talent",
            amount: w.amount,
            talentAmount: talentTotal,
            agencyAmount: agencyTotal,
            isWidget: true,
            status: w.status,
            splits: w.splits || [],
          });
        } else {
          // Fallback
          setInvoice({
            id: rawInvoiceId,
            campaignName: "Creative Campaign Split",
            recipient: "Elite model agency",
            talentName: "sarah",
            amount: 14999.98,
            talentAmount: 12749.98,
            agencyAmount: 2250.00,
            isWidget: true,
            status: "pending",
            splits: [],
          });
        }
      } catch (error) {
        console.error("Error loading payout invoice from Firestore:", error);
      }
    };

    loadInvoice();
  }, [rawInvoiceId]);

  useEffect(() => {
    if (stage !== "processing") return;
    const timeout = setTimeout(async () => {
      setStage("success");

      if (!invoice) return;

      try {
        // Update database to disbursed
        await updateInvoiceStatus(invoice.id, "paid", "disbursed");

        // Update statuses in localStorage for main queue compatibility
        const queue = localStorage.getItem("brand_queue_invoices");
        if (queue) {
          const next = JSON.parse(queue).map((q: any) => {
            if (q.id === invoice.id || 
                (invoice.id === "W-INV-001" && q.id === "AP-INV-9024") || 
                (invoice.id === "W-INV-002" && q.id === "AP-INV-8911")) {
              return { ...q, status: "talent_disbursed" };
            }
            return q;
          });
          localStorage.setItem("brand_queue_invoices", JSON.stringify(next));
        }

        // Add payout success notification
        const userEmail = state.user?.email || "";
        const localNotifs = localStorage.getItem(`agency_notifications_${userEmail}`);
        const notifs = localNotifs ? JSON.parse(localNotifs) : [];
        
        const description = invoice.splits && invoice.splits.length > 1
          ? `${invoice.recipient} paid campaign splits to ${invoice.splits.length} talents ($${invoice.talentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}) after agency cut ($${invoice.agencyAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })})`
          : `${invoice.recipient} paid talent ${invoice.talentName} ($${invoice.talentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}) after deducting 15% agency fee ($${invoice.agencyAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })})`;

        const newNotif = {
          id: `notif-${Date.now()}`,
          message: description,
          timestamp: "Just now",
          unread: true,
        };
        localStorage.setItem(`agency_notifications_${userEmail}`, JSON.stringify([newNotif, ...notifs]));
      } catch (error) {
        console.error("Error updating payout status in Firestore:", error);
      }

      // Sync event
      window.dispatchEvent(new Event("syncBrandDashboard"));
    }, 1800);

    return () => clearTimeout(timeout);
  }, [stage, invoice]);

  const handleConfirmPayout = () => {
    setTransactionId(`TX-DISB-${Math.floor(100000 + Math.random() * 900000)}`);
    setStage("processing");
  };

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center font-sans transition-colors duration-200">
        <div className="animate-spin h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased transition-colors duration-200">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between gap-4 px-6">
          <button 
            onClick={() => router.push("/branddashboard")} 
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <span className="text-[14px] font-semibold text-slate-900">AgncyPay Split Disbursement</span>
          <span className="hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-600 sm:inline-flex">
            Secure payout node
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1480px] grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-12">
        {/* Left Column - Payout form */}
        <section className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 space-y-8 shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
              Agency Split Ledger
            </span>
            <h2 className="text-xl font-bold mt-2 text-slate-900">Disburse Split for {invoice.campaignName}</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Verify split routing paths and release payout funds to talent node. Powered by AgncyPay's auto-routing network.
            </p>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Received</span>
              <p className="text-xl font-extrabold text-slate-900">{formatMainboardMoney(invoice.amount)}</p>
              <p className="text-[9px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Paid by Brand
              </p>
            </div>
            
            <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agency Fee (15%)</span>
              <p className="text-xl font-extrabold text-slate-900">{formatMainboardMoney(invoice.agencyAmount)}</p>
              <p className="text-[9px] text-slate-500 font-medium">Auto-deducted retainer</p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Talent Net Payout (85%)</span>
              <p className="text-xl font-extrabold text-slate-900">{formatMainboardMoney(invoice.talentAmount)}</p>
              <p className="text-[9px] text-slate-500 font-semibold flex items-center gap-1">
                {invoice.splits && invoice.splits.length > 1
                  ? `${invoice.splits.length} Talent Recipients`
                  : `To talent: @${invoice.talentName}`
                }
              </p>
            </div>
          </div>

          {/* Splits Breakdown */}
          {invoice.splits && invoice.splits.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                Splits Routing Paths
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {invoice.splits.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{s.talentName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{s.talentEmail}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-emerald-700 font-semibold">${s.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase border border-emerald-200">
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selector for Payout Destination */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Select Payout Destination</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setPayoutMethod("wallet")}
                className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between h-32 cursor-pointer ${
                  payoutMethod === "wallet"
                    ? "border-slate-900 bg-slate-50 shadow-sm ring-1 ring-slate-900/10"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-slate-700" />
                    Talent's AgncyPay Wallet
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200">
                    Instant
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight">
                    Funds will land in @{invoice.talentName}'s wallet instantly. Backed by automated split contracts.
                  </p>
                  <p className="text-[9px] font-bold text-slate-900 mt-2">Fee: $0.00</p>
                </div>
              </button>

              <button
                onClick={() => setPayoutMethod("ach")}
                className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between h-32 cursor-pointer ${
                  payoutMethod === "ach"
                    ? "border-slate-900 bg-slate-50 shadow-sm ring-1 ring-slate-900/10"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-slate-700" />
                    Direct Bank Transfer (ACH)
                  </span>
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">
                    1 Day
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight">
                    Disburse directly to talent's legal bank account on file. Settles next business day.
                  </p>
                  <p className="text-[9px] font-bold text-slate-900 mt-2">Fee: $1.50 ACH fee</p>
                </div>
              </button>
            </div>
          </div>

          {/* Locked Notice Alert if client Brand hasn't paid yet */}
          {invoice.status && invoice.status !== "paid" && invoice.status !== "disbursed" && invoice.status !== "talent_disbursed" && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs leading-relaxed flex items-start gap-2.5">
              <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-900 mb-0.5">Payout Release Locked</span>
                This talent payout split cannot be disbursed because the client Brand has not completed the payment settlement for this campaign invoice. Payout is locked until Brand status is "Paid".
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <button
              onClick={handleConfirmPayout}
              disabled={invoice.status !== "paid" && invoice.status !== "disbursed" && invoice.status !== "talent_disbursed"}
              className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-4.5 w-4.5 text-white" />
              {invoice.status !== "paid" && invoice.status !== "disbursed" && invoice.status !== "talent_disbursed" 
                ? "Locked: Awaiting Brand Payment" 
                : `Confirm & Release Payout (${formatMainboardMoney(invoice.talentAmount)})`}
            </button>
            <p className="text-[10px] text-center text-slate-500 leading-tight">
              Releasing dispatches splits to wallet addresses instantly. Irreversible under network clearance rules.
            </p>
          </div>
        </section>

        {/* Right Column - Summary */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-100">
              Disbursement Details
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Invoice ID</span>
                <span className="text-slate-900 font-mono font-bold">{invoice.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Total Paid by Brand</span>
                <span className="text-slate-900 font-bold">{formatMainboardMoney(invoice.amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Agency Retainer</span>
                <span className="text-slate-900 font-bold">{formatMainboardMoney(invoice.agencyAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Talent Share</span>
                <span className="text-slate-900 font-bold">{formatMainboardMoney(invoice.talentAmount)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <span className="text-slate-500 font-semibold">Clearing Node</span>
                <span className="text-slate-900 font-bold font-mono">@{invoice.recipient.toLowerCase().replace(/\s/g, "")}.node</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Loader Overlay */}
      {(stage === "processing" || stage === "success") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-[2px]">
          <section className="w-full max-w-[320px] rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl space-y-5 text-slate-900">
            {stage === "processing" ? (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-100">
                  <Lock className="h-7 w-7 animate-spin text-slate-900" />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">Routing split payout</h2>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                    Securing disbursement session and auto-routing splits to Wallet IDs.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">Payout Complete</h2>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-slate-600">
                    Transaction {transactionId} processed successfully. Retainer deducted, splits routed.
                  </p>
                </div>
                <button
                  onClick={() => window.location.href = "/branddashboard"}
                  className="w-full inline-flex h-11 items-center justify-center rounded-xl border border-slate-900 bg-slate-900 text-[12px] font-black text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
