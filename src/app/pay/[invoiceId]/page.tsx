"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  FileText,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { downloadTableReportPdf } from "../../../lib/pdfExport";
import { cn } from "../../../lib/utils";
import {
  findMainboardInvoice,
  formatMainboardMoney,
  mainboardInvoices,
  type MainboardInvoice,
  type MainboardInvoiceStatus,
} from "../../../lib/mainboard";
import { AgncyPayLogo } from "../../../components/payment/AgncyPayLogo";
import { useApp } from "../../../context/AppContext";
import { apiGetSingleInvoice as fetchSingleInvoice, apiUpdateInvoiceStatus as updateInvoiceStatus, type ApiInvoice as FirestoreInvoice } from "../../../lib/api/invoices";

type CheckoutStage = "payment" | "processing" | "success";
type CardRail = "agncypay" | "visa" | "mastercard" | "discover" | "amex" | "plaid";

const cardRails: CardRail[] = ["agncypay", "visa", "mastercard", "discover", "amex", "plaid"];

function CardRailLogo({ rail }: { rail: CardRail }) {
  if (rail === "visa") {
    return (
      <Image
        src="/visa-logo.svg"
        alt="Visa"
        width={512}
        height={166}
        className="h-5 w-auto object-contain"
      />
    );
  }

  if (rail === "mastercard") {
    return (
      <Image
        src="/mastercard-logo.svg"
        alt="Mastercard"
        width={152}
        height={118}
        className="h-7 w-auto object-contain"
      />
    );
  }

  if (rail === "discover") {
    return (
      <Image
        src="/discover-logo.svg"
        alt="Discover"
        width={512}
        height={113}
        className="h-6 w-auto object-contain"
      />
    );
  }

  if (rail === "amex") {
    return (
      <Image
        src="/american-express-logo.svg"
        alt="American Express"
        width={512}
        height={512}
        className="h-7 w-auto object-contain"
      />
    );
  }

  if (rail === "plaid") {
    return (
      <span className="flex items-center justify-center">
        <Image
          src="/plaid-logo.svg"
          alt="Plaid"
          width={126}
          height={48}
          className="h-5 w-auto object-contain"
        />
      </span>
    );
  }

  return (
    <span className="flex items-center justify-center">
      <AgncyPayLogo className="h-[18px] w-[48px]" imageClassName="h-full w-full" />
    </span>
  );
}

function cardRailClasses(rail: CardRail, selected: boolean) {
  const base = "relative flex h-11 min-w-[88px] items-center justify-center overflow-hidden rounded-xl border px-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900";
  const palette: Record<CardRail, string> = {
    agncypay: "bg-slate-900 text-white",
    visa: "bg-white",
    mastercard: "bg-white",
    discover: "bg-white",
    amex: "bg-white",
    plaid: "bg-white",
  };

  return cn(
    base,
    palette[rail],
    selected
      ? "border-slate-900 ring-2 ring-slate-900/10 shadow-sm"
      : "border-slate-200 opacity-75 hover:opacity-100 hover:border-slate-300"
  );
}

function SummaryCard({
  invoice,
  total,
  returnTo,
  onCopy,
  onDownload,
}: {
  invoice: MainboardInvoice;
  total: number;
  returnTo: "dashboard" | "mainboard";
  onCopy: () => void;
  onDownload: () => void;
}) {
  const returnParam = `&returnTo=${returnTo}`;

  return (
    <aside className="space-y-5">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-slate-500">Due Date</span>
            <span className="font-bold text-slate-900">{invoice.due}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-slate-500">Invoice Amount</span>
            <span className="text-2xl font-black text-slate-900">{formatMainboardMoney(invoice.amount)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
            <span className="font-semibold text-slate-500">Amount Due</span>
            <span className="text-2xl font-black text-slate-900">{formatMainboardMoney(total)}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 items-center gap-3 text-center border-t border-slate-100 pt-5">
          <Link
            href={`/request/${invoice.id}?mode=guest${returnParam}`}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 shadow-sm transition-colors"
          >
            Invoice PDF
          </Link>
          <button type="button" onClick={onCopy} className="flex flex-col items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <Copy className="h-4 w-4 text-slate-500" />
            Copy Link
          </button>
          <button type="button" onClick={onDownload} className="flex flex-col items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <FileText className="h-4 w-4 text-slate-500" />
            View PDF
          </button>
        </div>
      </section>

      <p className="text-center text-xs font-medium text-slate-500">
        Have an AgncyPay account?{" "}
        <Link href={`/auth/login?next=${encodeURIComponent(`/pay/${invoice.id}?mode=logged_in${returnParam}`)}`} className="font-semibold text-slate-900 hover:underline">
          Sign in
        </Link>
      </p>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">Business details</h3>
        <div className="mt-3.5 space-y-2.5 text-xs">
          <p className="font-semibold text-slate-900">Email: {invoice.payerEmail}</p>
          <div className="border-t border-slate-100 pt-2.5 text-slate-600 space-y-0.5">
            <p className="font-medium text-slate-800">{invoice.payer}</p>
            <p>{invoice.payerAddress[0]}</p>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 pt-4 text-xs font-medium text-slate-500">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        Protected by bank-level security and encryption
      </div>
    </aside>
  );
}

function PayRequestPageContent() {
  const params = useParams<{ invoiceId: string }>();
  const searchParams = useSearchParams();
  const rawInvoiceId = Array.isArray(params.invoiceId) ? params.invoiceId[0] : params.invoiceId;
  const { state } = useApp();

  const [dbInvoice, setDbInvoice] = useState<FirestoreInvoice | null>(null);
  const [loadingDb, setLoadingDb] = useState(true);
  const [stage, setStage] = useState<CheckoutStage>("payment");
  const [activeRail, setActiveRail] = useState<CardRail>("agncypay");
  const [cardNumber, setCardNumber] = useState("1234 5678 9000 0000");
  const [expiry, setExpiry] = useState("MM/YY");
  const [cvc, setCvc] = useState("123");
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    async function loadInvoice() {
      try {
        const inv = await fetchSingleInvoice(rawInvoiceId || "");
        if (inv) {
          setDbInvoice(inv);
        }
      } catch (e) {
        console.error("Error loading invoice from Firestore:", e);
      } finally {
        setLoadingDb(false);
      }
    }
    loadInvoice();
  }, [rawInvoiceId]);

  const invoice = useMemo(() => {
    const defaultMock = findMainboardInvoice(rawInvoiceId || "") || mainboardInvoices[0];
    if (dbInvoice) {
      return {
        ...defaultMock,
        id: dbInvoice.id,
        amount: dbInvoice.amount,
        fee: dbInvoice.amount * 0.015, // 1.5% fee
        payer: dbInvoice.brandName || (dbInvoice.payerId === "MB-6984" ? "Adidas AG" : "CCA Client Workspace"),
        payerEmail: dbInvoice.payerEmail,
        payerAddress: dbInvoice.payerAddress,
        recipient: (dbInvoice as any).agency || dbInvoice.agencyEmail,
        invoiceNumber: dbInvoice.id,
        due: dbInvoice.due,
        campaignName: dbInvoice.campaign,
      };
    }
    return defaultMock;
  }, [dbInvoice, rawInvoiceId]);

  const [nameOnCard, setNameOnCard] = useState(invoice.payer);

  useEffect(() => {
    if (dbInvoice) {
      setNameOnCard(invoice.payer);
    }
  }, [invoice]);

  const isLoggedInMode = searchParams.get("mode") === "logged_in";
  const returnTo = searchParams.get("returnTo") === "dashboard" ? "dashboard" : "mainboard";
  const returnHref = returnTo === "dashboard" ? "/branddashboard" : "/mainboard";
  const returnLabel = returnTo === "dashboard" ? "Dashboard" : "Mainboard";
  const total = invoice.amount + invoice.fee;

  const paymentLabel = useMemo(
    () => (isLoggedInMode ? "Signed-in AgncyPay payment" : "Pay without AgncyPay account"),
    [isLoggedInMode]
  );

  useEffect(() => {
    if (stage !== "processing") return;
    const timeout = window.setTimeout(async () => {
      setStage("success");
      
      const invoiceId = rawInvoiceId;
      let mappedId = invoiceId;
      if (invoiceId === "MB-6984") mappedId = "W-INV-001";
      if (invoiceId === "MB-7044") mappedId = "W-INV-002";

      try {
        // Update database to paid
        await updateInvoiceStatus(mappedId, "paid", "pending");

        // Sync with dashboard stats and local notification feeds
        const inv = await fetchSingleInvoice(mappedId);
        if (inv) {
          const amt = inv.amount;
          const brandEmail = inv.brandEmail;
          const agencyEmail = inv.agencyEmail;
          
          const savedVolume = localStorage.getItem(`brand_stats_paid_volume_${brandEmail}`);
          const v = savedVolume ? parseFloat(savedVolume) : 424500.00;
          localStorage.setItem(`brand_stats_paid_volume_${brandEmail}`, (v + amt).toString());

          const savedSavings = localStorage.getItem(`brand_stats_autosplit_savings_${brandEmail}`);
          const s = savedSavings ? parseFloat(savedSavings) : 4250.00;
          localStorage.setItem(`brand_stats_autosplit_savings_${brandEmail}`, (s + amt * 0.015).toString());

          const localNotifs = localStorage.getItem(`agency_notifications_${agencyEmail}`);
          const notifs = localNotifs ? JSON.parse(localNotifs) : [];
          const newNotif = {
            id: `notif-${Date.now()}`,
            message: `Brand paid invoice to ${(inv as any).agency || inv.agencyEmail} ($${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}) for ${inv.campaign}`,
            timestamp: "Just now",
            unread: true,
          };
          localStorage.setItem(`agency_notifications_${agencyEmail}`, JSON.stringify([newNotif, ...notifs]));
        }
      } catch (error) {
        console.error("Error finalizing checkout payment in Firestore:", error);
      }

      // Update main queue invoices
      const localQueue = localStorage.getItem("brand_queue_invoices");
      if (localQueue) {
        const parsed = JSON.parse(localQueue);
        const next = parsed.map((inv: any) => {
          if (inv.id === invoiceId || 
              ((invoiceId === "MB-6984" || invoiceId === "W-INV-001") && inv.id === "AP-INV-9024") || 
              ((invoiceId === "MB-7044" || invoiceId === "W-INV-002") && inv.id === "AP-INV-8911")) {
            return { ...inv, status: "settled" };
          }
          return inv;
        });
        localStorage.setItem("brand_queue_invoices", JSON.stringify(next));
      }

      // Dispatch sync event
      window.dispatchEvent(new Event("syncBrandDashboard"));
    }, 1200);
    return () => window.clearTimeout(timeout);
  }, [stage, rawInvoiceId]);

  if (loadingDb) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900 mx-auto mb-4" />
          <p className="text-xs font-semibold text-slate-500">Loading checkout details...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center font-sans">
        <div className="max-w-md w-full mx-4 rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">Invoice not found</h1>
          <p className="mt-2 text-xs font-medium text-slate-500">This checkout link does not match an active invoice.</p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const submitPayment = () => {
    setTransactionId(`TX-AP-${Math.floor(100000 + Math.random() * 900000)}`);
    setStage("processing");
  };

  const downloadPdf = () => {
    downloadTableReportPdf({
      title: `Invoice ${invoice.invoiceNumber}`,
      subtitle: `${invoice.recipient} payable through AgncyPay.`,
      filename: `agncypay-${invoice.invoiceNumber}.pdf`,
      summary: [
        { label: "Payer", value: invoice.payer },
        { label: "Payee", value: invoice.recipient },
        { label: "Due", value: invoice.due },
        { label: "Total", value: formatMainboardMoney(total) },
      ],
      columns: ["Rate Type", "Fee Type", "Qty", "Rate", "Amount"],
      rows: invoice.items.map((item) => [
        item.title,
        item.feeType,
        item.qty.toString(),
        formatMainboardMoney(item.rate),
        formatMainboardMoney(item.qty * item.rate),
      ]),
    });
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/pay/${invoice.id}?mode=guest&returnTo=${returnTo}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href={returnHref} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {returnLabel}
          </Link>
          <span className="text-sm font-bold text-slate-900">AgncyPay checkout</span>
          <span className="hidden rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm sm:inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            Secure checkout session
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1480px] grid-cols-1 gap-7 px-4 py-8 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(390px,0.65fr)]">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Invoice Amount</p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">{formatMainboardMoney(invoice.amount)}</h1>
            <span className="pb-1.5 text-xs font-semibold text-slate-500">Due {invoice.due}</span>
          </div>

          {isLoggedInMode ? (
            <div className="mt-8 space-y-6">
              <div className="p-5 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-500">Payer corporate workspace</span>
                  <span className="text-slate-900 font-bold">
                    {state?.workspaces?.find(w => w.id === state.activeWorkspaceId)?.name || state?.user?.fullName || "Adidas Corporate"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-500">Recipient agency</span>
                  <span className="text-slate-900 font-bold">{invoice.recipient}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-500">AgncyPay client identifier</span>
                  <span className="text-slate-900 font-mono font-bold">{state?.user?.agncyId || "USR-ADIDAS-9021"}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-3.5">
                  <span className="font-medium text-slate-500">Direct settlement routing</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    Treasury ACH Instant
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="button"
                  onClick={submitPayment}
                  className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <Lock className="h-4 w-4" />
                  Confirm & Pay {formatMainboardMoney(total)}
                </button>
                <span className="text-xs font-medium text-center text-slate-500">
                  Direct settlement via secure AgncyPay network clearance
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-8 flex flex-wrap gap-2">
                {cardRails.map((rail) => (
                  <button
                    key={rail}
                    type="button"
                    aria-pressed={activeRail === rail}
                    onClick={() => setActiveRail(rail)}
                    className={cardRailClasses(rail, activeRail === rail)}
                  >
                    <CardRailLogo rail={rail} />
                  </button>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <h2 className="text-sm font-bold text-slate-900">Your information</h2>
                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Email</span>
                    <input
                      value={invoice.payerEmail}
                      readOnly
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-medium text-slate-700 outline-none"
                    />
                  </label>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Phone Number</span>
                    <div className="mt-1.5 grid grid-cols-[140px_1fr] gap-2">
                      <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700">
                        <span>US</span>
                        <span>+1</span>
                      </div>
                      <input
                        value={invoice.mobile.replace("+1 ", "")}
                        readOnly
                        className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-medium text-slate-700 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_150px_120px]">
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Card Number</span>
                      <input
                        value={cardNumber}
                        onChange={(event) => setCardNumber(event.target.value)}
                        className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Exp date</span>
                      <input
                        value={expiry}
                        onChange={(event) => setExpiry(event.target.value)}
                        className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">CVV code</span>
                      <input
                        value={cvc}
                        onChange={(event) => setCvc(event.target.value)}
                        className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Name on card</span>
                    <input
                      value={nameOnCard}
                      onChange={(event) => setNameOnCard(event.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                    />
                  </label>

                  <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={submitPayment}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-sm active:scale-[0.99]"
                    >
                      <AgncyPayLogo className="h-[18px] w-[50px] [filter:invert(1)_brightness(1.5)]" imageClassName="h-full w-full" />
                      <span>Now</span>
                    </button>
                    <span className="text-xs font-medium text-slate-500">{paymentLabel}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <SummaryCard invoice={invoice} total={total} returnTo={returnTo} onCopy={copyLink} onDownload={downloadPdf} />
      </main>

      {(stage === "processing" || stage === "success") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <section className="w-full max-w-[340px] rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-2xl">
            {stage === "processing" ? (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                  <Lock className="h-6 w-6 animate-pulse text-slate-900" />
                </div>
                <h2 className="mt-4 text-xl font-black text-slate-900">Processing payment</h2>
                <p className="mt-1.5 text-xs text-slate-500">AgncyPay is securing the payment session.</p>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-xl font-black text-emerald-600">Payment Successful</h2>
                <p className="mt-1.5 text-xs text-slate-500">
                  Transaction {transactionId} was submitted successfully.
                </p>
                <Link
                  href={`/receipt/${invoice.id}?tx=${transactionId}&mode=${isLoggedInMode ? "logged_in" : "guest"}&returnTo=${returnTo}`}
                  className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all"
                >
                  View receipt
                </Link>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default function PayRequestPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900 mx-auto mb-4" />
          <p className="text-xs font-semibold text-slate-500">Loading checkout details...</p>
        </div>
      </div>
    }>
      <PayRequestPageContent />
    </React.Suspense>
  );
}
