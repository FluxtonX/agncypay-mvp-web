"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useApp } from "../../../context/AppContext";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Copy,
  CreditCard,
  FileText,
  Landmark,
  Lock,
  Mail,
  Paperclip,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Split,
  Users,
  X,
} from "lucide-react";
import { AgncyPayLogo } from "../../../components/payment/AgncyPayLogo";
import { cn } from "../../../lib/utils";

type TransferMode = "send" | "request";
type FlowStage = "start" | "recipient" | "amount" | "review" | "processing" | "success";
type FundingMethod = "balance" | "bank" | "card";
type DeliverySpeed = "instant" | "standard";
type Purpose = "friends" | "services" | "invoice" | "payout";

type Recipient = {
  id: string;
  name: string;
  handle: string;
  email: string;
  mobile: string;
  type: "talent" | "agency" | "brand" | "vendor";
  initials: string;
  color: string;
  suggestedAmount: number;
  note: string;
};

type FundingOption = {
  id: FundingMethod;
  title: string;
  detail: string;
  feeText: string;
  icon: typeof Landmark;
};

type BatchInvoice = {
  id: string;
  recipient: string;
  source: string;
  amount: number;
  due: string;
};

const recipients: Recipient[] = [
  {
    id: "john-adams",
    name: "John Adams",
    handle: "@agncy11174",
    email: "john@westernmodels.com",
    mobile: "+1 (555) 810-1174",
    type: "talent",
    initials: "JA",
    color: "from-[#575757] to-[#111111]",
    suggestedAmount: 7840.25,
    note: "Runway booking payout",
  },
  {
    id: "amy-holland",
    name: "Amy Holland",
    handle: "@agncy65122",
    email: "amy@studioholland.com",
    mobile: "+1 (555) 324-6512",
    type: "talent",
    initials: "AH",
    color: "from-[#6f6f6f] to-[#151515]",
    suggestedAmount: 4200,
    note: "Creator campaign settlement",
  },
  {
    id: "m-models",
    name: "M Models",
    handle: "@mmodels",
    email: "ap@mmodels.com",
    mobile: "+1 (555) 310-4400",
    type: "agency",
    initials: "MM",
    color: "from-[#2f2f2f] to-[#050505]",
    suggestedAmount: 12800,
    note: "Agency batch payout",
  },
  {
    id: "nike",
    name: "Nike",
    handle: "@nike",
    email: "treasury@nike.com",
    mobile: "+1 (503) 671-6453",
    type: "brand",
    initials: "NI",
    color: "from-[#3f3f46] to-[#090909]",
    suggestedAmount: 12500,
    note: "Brand invoice request",
  },
  {
    id: "soundcloud",
    name: "SoundCloud",
    handle: "@soundcloud",
    email: "payments@soundcloud.com",
    mobile: "+1 (555) 407-8100",
    type: "vendor",
    initials: "SC",
    color: "from-[#525252] to-[#111111]",
    suggestedAmount: 3040,
    note: "Streaming revenue transfer",
  },
];

const currencies = [
  { code: "USD", name: "United States Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
] as const;

type CurrencyCode = (typeof currencies)[number]["code"];

const fundingOptions: FundingOption[] = [
  {
    id: "balance",
    title: "AgncyPay Balance",
    detail: "$28,450.72 available",
    feeText: "No fee",
    icon: Banknote,
  },
  {
    id: "bank",
    title: "Chase Business Checking",
    detail: "Bank ****1234",
    feeText: "No fee · 1 business day",
    icon: Landmark,
  },
  {
    id: "card",
    title: "Corporate Visa",
    detail: "Card ****8930",
    feeText: "2.9% demo card fee",
    icon: CreditCard,
  },
];

const purposeOptions: { id: Purpose; title: string; detail: string }[] = [
  { id: "friends", title: "Personal", detail: "Quick transfer without invoice controls." },
  { id: "services", title: "Services", detail: "Best for creator, vendor, or contractor payments." },
  { id: "invoice", title: "Invoice", detail: "Attach invoice memo and reconciliation details." },
  { id: "payout", title: "Payout", detail: "Use for agency, talent, or platform payout runs." },
];

const batchInvoices: BatchInvoice[] = [
  { id: "QB-29475", recipient: "Nike, Inc.", source: "QuickBooks", amount: 1500, due: "27 days" },
  { id: "QB-38485", recipient: "The Gap, Inc.", source: "QuickBooks", amount: 5400, due: "2 days" },
  { id: "MB-6984", recipient: "M Models", source: "Mainboard", amount: 3040, due: "Today" },
  { id: "SC-2044", recipient: "SoundCloud", source: "Music income", amount: 3040, due: "Ready" },
  { id: "QB-88442", recipient: "Adidas AG", source: "QuickBooks", amount: 2800, due: "19 days" },
];

function formatCurrency(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function avatarLabel(type: Recipient["type"]) {
  if (type === "brand") return "Brand";
  if (type === "agency") return "Agency";
  if (type === "vendor") return "Vendor";
  return "Talent";
}

function RecipientAvatar({ recipient, size = "md" }: { recipient: Recipient; size?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br text-center font-black text-white",
        recipient.color,
        size === "sm" && "h-10 w-10 text-[12px]",
        size === "md" && "h-14 w-14 text-[15px]",
        size === "lg" && "h-20 w-20 text-[22px]"
      )}
    >
      {recipient.initials}
    </div>
  );
}



function StepPill({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-[13px] font-medium", active ? "text-slate-900 font-semibold" : done ? "text-slate-700" : "text-slate-400")}>
      <div className={cn("h-2 w-2 rounded-full", active ? "bg-slate-900" : done ? "bg-emerald-500" : "bg-slate-300")} />
      <span>{label}</span>
    </div>
  );
}

function ProgressHeader({ stage }: { stage: FlowStage }) {
  const order: FlowStage[] = ["recipient", "amount", "review", "success"];
  const currentIndex = stage === "start" ? 0 : order.indexOf(stage) === -1 ? 2 : order.indexOf(stage);

  return (
    <div className="hidden items-center gap-5 rounded-full border border-slate-200/80 bg-white px-4 py-2 shadow-sm md:flex">
      {[
        { id: "recipient", label: "Recipient" },
        { id: "amount", label: "Amount" },
        { id: "review", label: "Review" },
        { id: "success", label: "Done" },
      ].map((item, index) => (
        <StepPill
          key={item.id}
          active={index === currentIndex}
          done={stage === "success" || index < currentIndex}
          label={item.label}
        />
      ))}
    </div>
  );
}

function TopBar({ stage }: { stage: FlowStage }) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <AgncyPayLogo className="h-[24px] w-[70px]" imageClassName="h-full w-full [filter:invert(1)_brightness(0.15)]" />
      </div>
      <ProgressHeader stage={stage} />
    </header>
  );
}

function BatchModal({
  selectedIds,
  onToggle,
  onClose,
  onUseBatch,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
  onUseBatch: () => void;
}) {
  const selectedTotal = batchInvoices
    .filter((invoice) => selectedIds.includes(invoice.id))
    .reduce((total, invoice) => total + invoice.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 px-4 py-8 backdrop-blur-sm">
      <section className="w-full max-w-[920px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <div>
            <h2 className="text-[20px] font-semibold text-slate-900">Create batch payment</h2>
            <p className="mt-1 text-[13px] text-slate-500">Select synced invoices and turn them into one payment run.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close batch payment"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[460px] overflow-y-auto p-5">
          <div className="grid gap-3">
            {batchInvoices.map((invoice) => {
              const checked = selectedIds.includes(invoice.id);

              return (
                <button
                  key={invoice.id}
                  type="button"
                  onClick={() => onToggle(invoice.id)}
                  className={cn(
                    "grid grid-cols-[24px_1fr_auto] items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all",
                    checked
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                      checked ? "border-white bg-white text-slate-900" : "border-slate-300 bg-white"
                    )}
                  >
                    {checked ? <CheckCircle2 className="h-3.5 w-3.5 text-slate-900" /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-semibold">{invoice.recipient}</span>
                    <span className={cn("mt-0.5 block text-[12px]", checked ? "text-slate-300" : "text-slate-500")}>
                      {invoice.id} · {invoice.source} · due {invoice.due}
                    </span>
                  </span>
                  <span className={cn("text-[15px] font-semibold", checked ? "text-white" : "text-slate-900")}>
                    {formatCurrency(invoice.amount, "USD")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] font-semibold text-slate-700">
            {selectedIds.length} selected · {formatCurrency(selectedTotal, "USD")}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-[13px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onUseBatch}
              disabled={selectedIds.length === 0}
              className="h-10 rounded-xl border border-slate-900 bg-slate-900 px-5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Use selected batch
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function SendRequestPage() {
  const [mode, setMode] = useState<TransferMode>("send");
  const [stage, setStage] = useState<FlowStage>("start");
  const [query, setQuery] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState(recipients[0].id);
  const [amount, setAmount] = useState(recipients[0].suggestedAmount.toFixed(2));
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [note, setNote] = useState(recipients[0].note);
  const [purpose, setPurpose] = useState<Purpose>("services");
  const [fundingMethod, setFundingMethod] = useState<FundingMethod>("balance");
  const [deliverySpeed, setDeliverySpeed] = useState<DeliverySpeed>("instant");
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchIds, setBatchIds] = useState<string[]>(["QB-38485", "MB-6984"]);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [receiptId, setReceiptId] = useState("AP-DEMO-482901");

  const selectedRecipient = recipients.find((recipient) => recipient.id === selectedRecipientId) || recipients[0];
  const selectedCurrency = currencies.find((item) => item.code === currency) || currencies[0];
  const numericAmount = Number(amount) || 0;
  const selectedFunding = fundingOptions.find((option) => option.id === fundingMethod) || fundingOptions[0];
  const batchTotal = batchInvoices
    .filter((invoice) => batchIds.includes(invoice.id))
    .reduce((total, invoice) => total + invoice.amount, 0);
  const cardFee = fundingMethod === "card" && mode === "send" ? numericAmount * 0.029 : 0;
  const instantFee = deliverySpeed === "instant" && fundingMethod !== "balance" && mode === "send" ? Math.max(1.5, numericAmount * 0.0025) : 0;
  const platformFee = purpose === "invoice" && mode === "request" ? Math.max(2, numericAmount * 0.004) : 0;
  const total = mode === "send" ? numericAmount + cardFee + instantFee : numericAmount;
  const recipientGets = mode === "send" ? numericAmount : numericAmount - platformFee;

  const filteredRecipients = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return recipients;

    return recipients.filter((recipient) =>
      [recipient.name, recipient.handle, recipient.email, recipient.mobile, recipient.type]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [query]);

  const selectRecipient = (recipient: Recipient) => {
    setSelectedRecipientId(recipient.id);
    setAmount(recipient.suggestedAmount.toFixed(2));
    setNote(recipient.note);
    setStage("amount");
  };

  const submitTransfer = () => {
    setReceiptId(`AP-${Math.floor(100000 + Math.random() * 900000)}`);
    setStage("processing");
    window.setTimeout(() => setStage("success"), 1300);
  };

  const copyReceipt = () => {
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1600);
  };

  const resetFlow = () => {
    setQuery("");
    setNote(selectedRecipient.note);
    setStage("start");
    setCopyState("idle");
  };

  const startMode = (nextMode: TransferMode) => {
    setMode(nextMode);
    setStage("recipient");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-5 py-5 sm:px-7 lg:px-10">
        <TopBar stage={stage} />

        {stage === "start" && (
          <section className="grid flex-1 place-items-center py-10">
            <div className="w-full max-w-[980px]">
              <div className="mx-auto max-w-[680px] text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm">
                  <Sparkles className="h-6 w-6 text-slate-700" />
                </div>
                <h1 className="mt-6 text-[38px] font-semibold leading-tight tracking-[-0.03em] text-slate-900 sm:text-[48px]">
                  Send or request money
                </h1>
                <p className="mt-3 text-[16px] leading-7 text-slate-500">
                  Move money to talent, agencies, brands, music platforms, and vendors with a guided AgncyPay checkout.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => startMode("send")}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-7 text-left shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                    <Send className="h-5 w-5" />
                  </div>
                  <h2 className="mt-6 text-[22px] font-semibold text-slate-900">Send payment</h2>
                  <p className="mt-2 text-[14px] leading-6 text-slate-500">
                    Pay a person, agency, brand, vendor, or synced invoice recipient.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-slate-900 group-hover:text-slate-700">
                    Start sending <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => startMode("request")}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-7 text-left shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                    <ReceiptText className="h-5 w-5" />
                  </div>
                  <h2 className="mt-6 text-[22px] font-semibold text-slate-900">Request money</h2>
                  <p className="mt-2 text-[14px] leading-6 text-slate-500">
                    Create a payment request with memo, invoice context, and shareable receipt trail.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-slate-900 group-hover:text-slate-700">
                    Start requesting <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { icon: Split, title: "Batch-ready", detail: "Pull synced QuickBooks or Mainboard invoices into one run." },
                  { icon: Lock, title: "Review first", detail: "Every transfer goes through a final confirmation screen." },
                  { icon: ShieldCheck, title: "Demo receipts", detail: "Generate a realistic status and receipt after submit." },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                      <Icon className="h-5 w-5 text-slate-700" />
                      <p className="mt-3 text-[14px] font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-[12px] leading-5 text-slate-500">{item.detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {stage === "recipient" && (
          <section className="mx-auto w-full max-w-[840px] flex-1 py-10">
            <button
              type="button"
              onClick={() => setStage("start")}
              className="mb-6 inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-[26px] font-semibold text-slate-900 sm:text-[28px]">
                    Who do you want to {mode === "send" ? "pay" : "request from"}?
                  </h1>
                  <p className="mt-1 text-[14px] text-slate-500">Search by name, email, phone, wallet ID, or organization.</p>
                </div>
                <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
                  {(["send", "request"] as TransferMode[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setMode(item)}
                      className={cn(
                        "h-8 rounded-full px-4 text-[13px] font-semibold capitalize transition-all",
                        mode === item ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <label className="relative mt-6 block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Name, email, phone, @wallet"
                  className="h-12 w-full rounded-full border border-slate-200 bg-slate-50/80 pl-12 pr-5 text-[14px] font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:bg-white transition-colors"
                />
              </label>

              <div className="mt-6 space-y-2.5">
                {filteredRecipients.map((recipient) => (
                  <button
                    key={recipient.id}
                    type="button"
                    onClick={() => selectRecipient(recipient)}
                    className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/40 px-4 py-3.5 text-left transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                  >
                    <span className="flex min-w-0 items-center gap-3.5">
                      <RecipientAvatar recipient={recipient} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-semibold text-slate-900">{recipient.name}</span>
                        <span className="mt-0.5 block truncate text-[12px] text-slate-500">
                          {recipient.handle} · {recipient.email}
                        </span>
                      </span>
                    </span>
                    <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-0.5 text-[11px] font-semibold text-slate-600 shadow-2xs sm:inline-flex">
                      {avatarLabel(recipient.type)}
                    </span>
                  </button>
                ))}
                {filteredRecipients.length === 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center">
                    <p className="text-[15px] font-semibold text-slate-900">No matching contact</p>
                    <p className="mt-1 text-[13px] text-slate-500">Try another name, email, phone, or wallet handle.</p>
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setIsBatchOpen(true)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <Split className="h-4 w-4" />
                  Batch payment
                </button>
                <Link
                  href="/dashboard/invoices"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <FileText className="h-4 w-4" />
                  Open invoices
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <Users className="h-4 w-4" />
                  Contacts
                </Link>
              </div>
            </div>
          </section>
        )}

        {stage === "amount" && (
          <section className="mx-auto grid w-full max-w-[1120px] flex-1 grid-cols-1 gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <button
                type="button"
                onClick={() => setStage("recipient")}
                className="mb-6 inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 transition-colors hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Change recipient
              </button>

              <div className="flex items-center gap-4">
                <RecipientAvatar recipient={selectedRecipient} size="md" />
                <div className="min-w-0">
                  <h1 className="truncate text-[24px] font-semibold text-slate-900">{selectedRecipient.name}</h1>
                  <p className="mt-0.5 text-[13px] text-slate-500">{selectedRecipient.handle} · {selectedRecipient.mobile}</p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 sm:p-6">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                  {mode === "send" ? "You send" : "You request"}
                </p>
                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex min-w-0 flex-1 items-baseline gap-2">
                    <span className="text-[34px] font-semibold text-slate-400">{selectedCurrency.symbol}</span>
                    <input
                      value={amount}
                      onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))}
                      inputMode="decimal"
                      aria-label="Amount"
                      className="min-w-0 flex-1 bg-transparent text-[44px] font-bold leading-none text-slate-900 outline-none sm:text-[48px]"
                    />
                  </div>
                  <label className="block">
                    <span className="sr-only">Currency</span>
                    <select
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
                      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-[14px] font-semibold text-slate-900 shadow-sm outline-none"
                    >
                      {currencies.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.code} · {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="text-[13px] font-semibold text-slate-700">What is this for?</span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={4}
                    placeholder="Add a note"
                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 transition-colors"
                  />
                </label>

                <div>
                  <p className="text-[13px] font-semibold text-slate-700">Payment type</p>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {purposeOptions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPurpose(item.id)}
                        className={cn(
                          "rounded-xl border px-4 py-2.5 text-left transition-all",
                          purpose === item.id
                            ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        <span className="block text-[13px] font-semibold">{item.title}</span>
                        <span className={cn("mt-0.5 block text-[11px]", purpose === item.id ? "text-slate-300" : "text-slate-500")}>
                          {item.detail}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setIsBatchOpen(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <Plus className="h-4 w-4" />
                  Add batch invoices
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <Paperclip className="h-4 w-4" />
                  Attach file
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <Mail className="h-4 w-4" />
                  Email copy
                </button>
              </div>
            </div>

            <aside className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-[18px] font-semibold text-slate-900">How should this move?</h2>
              <div className="mt-5 space-y-3">
                {fundingOptions.map((option) => {
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFundingMethod(option.id)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-all",
                        fundingMethod === option.id
                          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold">{option.title}</span>
                        <span className={cn("mt-0.5 block text-[11px]", fundingMethod === option.id ? "text-slate-300" : "text-slate-500")}>
                          {option.detail}
                        </span>
                        <span className={cn("mt-1.5 block text-[11px] font-semibold", fundingMethod === option.id ? "text-slate-200" : "text-slate-700")}>
                          {option.feeText}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5">
                <p className="text-[13px] font-semibold text-slate-700">Delivery</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["instant", "standard"] as DeliverySpeed[]).map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => setDeliverySpeed(speed)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-left transition-all",
                        deliverySpeed === speed
                          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <span className="block text-[13px] font-semibold capitalize">{speed}</span>
                      <span className={cn("mt-0.5 block text-[11px]", deliverySpeed === speed ? "text-slate-300" : "text-slate-500")}>
                        {speed === "instant" ? "Seconds" : "1 business day"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                <div className="flex justify-between text-[13px] text-slate-500">
                  <span>Amount</span>
                  <span className="font-medium text-slate-700">{formatCurrency(numericAmount, currency)}</span>
                </div>
                {cardFee > 0 && (
                  <div className="mt-2 flex justify-between text-[13px] text-slate-500">
                    <span>Card fee</span>
                    <span className="font-medium text-slate-700">{formatCurrency(cardFee, currency)}</span>
                  </div>
                )}
                {instantFee > 0 && (
                  <div className="mt-2 flex justify-between text-[13px] text-slate-500">
                    <span>Instant fee</span>
                    <span className="font-medium text-slate-700">{formatCurrency(instantFee, currency)}</span>
                  </div>
                )}
                {platformFee > 0 && (
                  <div className="mt-2 flex justify-between text-[13px] text-slate-500">
                    <span>Request fee preview</span>
                    <span className="font-medium text-slate-700">{formatCurrency(platformFee, currency)}</span>
                  </div>
                )}
                {batchIds.length > 0 && (
                  <div className="mt-2 flex justify-between text-[13px] text-slate-500">
                    <span>Batch attached</span>
                    <span className="font-medium text-slate-700">{batchIds.length} · {formatCurrency(batchTotal, currency)}</span>
                  </div>
                )}
                <div className="mt-3 border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-[15px] font-semibold text-slate-900">
                    <span>{mode === "send" ? "You pay" : "Request total"}</span>
                    <span>{formatCurrency(total, currency)}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-[12px] text-slate-500">
                    <span>{selectedRecipient.name} {mode === "send" ? "gets" : "will pay"}</span>
                    <span className="font-medium text-slate-700">{formatCurrency(recipientGets, currency)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStage("review")}
                disabled={numericAmount <= 0}
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 text-[14px] font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </aside>
          </section>
        )}

        {stage === "review" && (
          <section className="mx-auto grid w-full max-w-[1040px] flex-1 grid-cols-1 gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <button
                type="button"
                onClick={() => setStage("amount")}
                className="mb-6 inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 transition-colors hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Edit details
              </button>
              <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-slate-900 sm:text-[32px]">
                Review {mode === "send" ? "payment" : "request"}
              </h1>
              <p className="mt-1 text-[14px] text-slate-500">Confirm everything before AgncyPay creates the demo transaction.</p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <RecipientAvatar recipient={selectedRecipient} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-slate-900">{selectedRecipient.name}</p>
                      <p className="mt-0.5 truncate text-[12px] text-slate-500">{selectedRecipient.email}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs">
                    {avatarLabel(selectedRecipient.type)}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Memo</p>
                  <p className="mt-1.5 text-[14px] leading-6 text-slate-900">{note || "No note added."}</p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                    <p className="text-[12px] font-semibold text-slate-500">Funding</p>
                    <p className="mt-1 text-[15px] font-semibold text-slate-900">{selectedFunding.title}</p>
                    <p className="mt-0.5 text-[12px] text-slate-500">{selectedFunding.detail}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                    <p className="text-[12px] font-semibold text-slate-500">Delivery</p>
                    <p className="mt-1 text-[15px] font-semibold text-slate-900 capitalize">{deliverySpeed}</p>
                    <p className="mt-0.5 text-[12px] text-slate-500">{deliverySpeed === "instant" ? "Usually available in seconds." : "Estimated 1 business day."}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <p className="text-[13px] leading-5 text-slate-600">
                    This demo will not move real money. It simulates the final review, processing, and receipt states for your AgncyPay payment flow.
                  </p>
                </div>
              </div>
            </div>

            <aside className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-[18px] font-semibold text-slate-900">Summary</h2>
              <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                <div className="flex justify-between text-[13px] text-slate-500">
                  <span>{mode === "send" ? "Sending" : "Requesting"}</span>
                  <span className="font-medium text-slate-700">{formatCurrency(numericAmount, currency)}</span>
                </div>
                {cardFee > 0 && (
                  <div className="mt-2.5 flex justify-between text-[13px] text-slate-500">
                    <span>Card fee</span>
                    <span className="font-medium text-slate-700">{formatCurrency(cardFee, currency)}</span>
                  </div>
                )}
                {instantFee > 0 && (
                  <div className="mt-2.5 flex justify-between text-[13px] text-slate-500">
                    <span>Instant fee</span>
                    <span className="font-medium text-slate-700">{formatCurrency(instantFee, currency)}</span>
                  </div>
                )}
                <div className="mt-4 border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-[17px] font-bold text-slate-900">
                    <span>Total</span>
                    <span>{formatCurrency(total, currency)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={submitTransfer}
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 text-[14px] font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                {mode === "send" ? "Send payment" : "Send request"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </aside>
          </section>
        )}

        {stage === "processing" && (
          <section className="grid flex-1 place-items-center py-10">
            <div className="w-full max-w-[380px] rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                <RefreshCw className="h-7 w-7 animate-spin text-slate-700" />
              </div>
              <h1 className="mt-6 text-[24px] font-semibold text-slate-900">Processing</h1>
              <p className="mt-2 text-[14px] leading-6 text-slate-500">
                Securing transfer, checking funding source, and creating receipt trail.
              </p>
            </div>
          </section>
        )}

        {stage === "success" && (
          <section className="grid flex-1 place-items-center py-10">
            <div className="w-full max-w-[560px] rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl sm:p-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="mt-6 text-[28px] font-semibold text-slate-900">
                {mode === "send" ? "Payment sent" : "Request sent"}
              </h1>
              <p className="mt-2 text-[15px] leading-6 text-slate-600">
                {formatCurrency(numericAmount, currency)} {mode === "send" ? "was sent to" : "was requested from"} {selectedRecipient.name}.
              </p>

              <div className="mt-6 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 text-left">
                <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                  <span className="text-[13px] text-slate-500">Receipt ID</span>
                  <span className="font-mono text-[13px] font-semibold text-slate-900">{receiptId}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-200 py-3">
                  <span className="text-[13px] text-slate-500">Status</span>
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed
                  </span>
                </div>
                <div className="flex justify-between gap-4 pt-3">
                  <span className="text-[13px] text-slate-500">Delivery</span>
                  <span className="text-[13px] font-semibold text-slate-900 capitalize">{deliverySpeed}</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={copyReceipt}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <Copy className="h-4 w-4" />
                  {copyState === "copied" ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={resetFlow}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  New transfer
                </button>
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-900 bg-slate-900 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>

      {isBatchOpen && (
        <BatchModal
          selectedIds={batchIds}
          onToggle={(id) =>
            setBatchIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
          }
          onClose={() => setIsBatchOpen(false)}
          onUseBatch={() => {
            const nextTotal = batchInvoices
              .filter((invoice) => batchIds.includes(invoice.id))
              .reduce((sum, invoice) => sum + invoice.amount, 0);
            setAmount(nextTotal.toFixed(2));
            setPurpose("invoice");
            setMode("send");
            setIsBatchOpen(false);
            setStage("amount");
          }}
        />
      )}
    </main>
  );
}
