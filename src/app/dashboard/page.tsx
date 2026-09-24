"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlaidLink } from "react-plaid-link";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  EllipsisVertical,
  GripVertical,
  Loader2,
  Play,
  Plug,
  Search,
  Send,
  Settings,
  Unplug,
  Users,
  X,
  Sparkles,
  RefreshCw,
  Check,
  Wallet,
  Lock,
  Clock,
  LogOut,
  Sun,
  Moon
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { cn } from "../../lib/utils";
import { mainboardInvoices, formatMainboardMoney, type MainboardInvoice } from "../../lib/mainboard";
import { apiGetInvoices as subscribeInvoicesByAgency, apiGetInvoices as subscribeInvoicesByTalent } from "../../lib/api/invoices";
import { ModelIncomeList, ModelPayoutsList, CsvDropzonePanel } from "../../components/dashboard/ModelAgencyDashboard";

const BOFA_BUSINESS_DEBIT_VISA_IMAGE =
  "https://business.bankofamerica.com/content/dam/consumer/business/deposits/checking-accounts/debit-cards/bofa_busdbtcm_v.png";
const CHASE_INK_BUSINESS_UNLIMITED_IMAGE = "/chase-ink-business-unlimited.png";
const MERCURY_IO_CARD_IMAGE = "/mercurycard.png";
const LAND_ROVER_LOGO_IMAGE = "/land-rover-logo.svg";

type RemoteBrandImageProps = {
  src: string;
  alt: string;
  fallback: string;
  className?: string;
  imageClassName?: string;
};

function RemoteBrandImage({ src, alt, fallback, className, imageClassName }: RemoteBrandImageProps) {
  const [failed, setFailed] = React.useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {failed ? (
        <div className="flex h-full w-full items-center justify-center rounded-[inherit] border border-[#3f3f3f] bg-white px-1 text-center text-[10px] font-semibold leading-[1.05] text-black">
          <span className="block max-w-full truncate">{fallback}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-contain", imageClassName)}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      )}
    </div>
  );
}

const quickActions = [
  { label: "Send / Request", icon: Send, href: "/dashboard/send-request" },
  { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { label: "Wallet ID contacts", icon: Users, href: "/dashboard/profile" },
  { label: "More", icon: EllipsisVertical, href: "/dashboard/settings" },
] as const;

/*
const oldBrandShortcuts = [
  { label: "Nike", src: "https://cdn.simpleicons.org/nike/000000", fallback: "Nike", href: "/mainboard" },
  { label: "Zara", src: "https://cdn.simpleicons.org/zara/000000", fallback: "Zara", href: "/mainboard" },
  { label: "Adidas", src: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg", fallback: "Adidas", href: "/mainboard" },
  { label: "Spotify", src: "https://cdn.simpleicons.org/spotify/1DB954", fallback: "Spotify", href: "/mainboard" },
  { label: "Netflix", src: "https://cdn.simpleicons.org/netflix/E50914", fallback: "Netflix", href: "/mainboard" },
] as const;
*/

const brandShortcuts = [
  {
    label: "TikTok",
    src: "/tiktok.png",
    fallback: "TikTok",
    href: "/dashboard/income/tiktok",
    tileClassName: "bg-transparent p-0",
    imageClassName: "scale-[3.2]",
  },
  {
    label: "iHeartRadio",
    src: "/iheart.png",
    fallback: "iHeart",
    href: "/dashboard/income/iheart-radio",
    tileClassName: "bg-transparent p-0",
    imageClassName: "scale-[3.2]",
  },
  {
    label: "Instagram",
    src: "/instagram.png",
    fallback: "Instagram",
    href: "/dashboard/income/instagram",
    tileClassName: "bg-transparent p-0",
    imageClassName: "scale-[3.2]",
  },
  {
    label: "Pandora",
    src: "/pandora.png",
    fallback: "Pandora",
    href: "/dashboard/income/pandora",
    tileClassName: "bg-transparent p-0",
    imageClassName: "scale-[3.2]",
  },
  {
    label: "Tidal",
    src: "/tidal.png",
    fallback: "Tidal",
    href: "/dashboard/income/tidal",
    tileClassName: "bg-transparent p-0",
    imageClassName: "scale-[3.2]",
  },
] as const;

const bankCards = [
  {
    name: "Chase Ink Business Unlimited Visa",
    detail: "Visa ****86",
    cardImage: CHASE_INK_BUSINESS_UNLIMITED_IMAGE,
    fallback: "Chase",
  },
  {
    name: "Mercury Business IO Mastercard",
    detail: "Mastercard ****57",
    cardImage: MERCURY_IO_CARD_IMAGE,
    fallback: "Mercury",
  },
  {
    name: "Bank of America Business Debit Visa",
    detail: "Debit ****88",
    cardImage: BOFA_BUSINESS_DEBIT_VISA_IMAGE,
    fallback: "Bank of America",
  },
  {
    name: "Mercury Debit Mastercard",
    detail: "Debit ****86",
    cardImage: MERCURY_IO_CARD_IMAGE,
    fallback: "Mercury",
  },
] as const;

const musicIncomeItems = [
  {
    slug: "soundcloud",
    name: "SoundCloud",
    detail: "Q3 Stream revenue",
    date: "Today, 10:24 AM",
    amount: "$3,040.00",
    src: "https://cdn.simpleicons.org/soundcloud/FFFFFF",
    fallback: "SC",
    className: "bg-[#ff5500]",
    imageClassName: "scale-[0.82]",
  },
  {
    slug: "amazon-music",
    name: "Amazon Music",
    detail: "Q3 Stream revenue",
    date: "Today, 9:42 AM",
    amount: "$9,805.25",
    src: "/logo-tiles/amazonMusic.png",
    fallback: "AM",
    className: "bg-[#2ccfd2]",
    imageClassName: "scale-[1.18] -translate-x-[14%] -translate-y-[14%]",
  },
  {
    slug: "apple-music",
    name: "Apple Music",
    detail: "Q3 Stream revenue",
    date: "Yesterday",
    amount: "$3,500.00",
    src: "/logo-tiles/appleMusic.png",
    fallback: "Apple",
    className: "bg-[linear-gradient(135deg,#fa2d48,#fb1ba5)]",
    imageClassName: "scale-[1.18] -translate-x-[14%] -translate-y-[14%]",
  },
  {
    slug: "spotify",
    name: "Spotify",
    detail: "Q3 Stream revenue",
    date: "May 31",
    amount: "$2,600.00",
    src: "https://cdn.simpleicons.org/spotify/1DB954",
    fallback: "Spotify",
    className: "bg-black",
    imageClassName: "scale-[0.78]",
  },
  {
    slug: "youtube",
    name: "Youtube",
    detail: "Q3 Stream revenue",
    date: "May 24",
    amount: "$1,800.00",
    src: "https://cdn.simpleicons.org/youtube/FFFFFF",
    fallback: "YT",
    className: "bg-[#ff0000]",
    imageClassName: "scale-[0.72]",
  },
] as const;

const yearlyActivity = [
  { month: "Jan", label: "J", height: 44, revenue: "$214K", streams: "4.2M", growth: "+8.4%" },
  { month: "Feb", label: "F", height: 60, revenue: "$286K", streams: "5.7M", growth: "+12.1%" },
  { month: "Mar", label: "M", height: 37, revenue: "$181K", streams: "3.6M", growth: "-3.8%" },
  { month: "Apr", label: "A", height: 66, revenue: "$314K", streams: "6.3M", growth: "+15.4%" },
  { month: "May", label: "M", height: 50, revenue: "$242K", streams: "4.9M", growth: "+6.2%" },
  { month: "Jun", label: "J", height: 56, revenue: "$269K", streams: "5.4M", growth: "+9.1%" },
  { month: "Jul", label: "J", height: 71, revenue: "$337K", streams: "6.9M", growth: "+18.7%" },
  { month: "Aug", label: "A", height: 44, revenue: "$218K", streams: "4.4M", growth: "+4.0%" },
  { month: "Sep", label: "S", height: 62, revenue: "$298K", streams: "6.0M", growth: "+11.8%" },
  { month: "Oct", label: "O", height: 76, revenue: "$361K", streams: "7.2M", growth: "+21.3%" },
  { month: "Nov", label: "N", height: 52, revenue: "$251K", streams: "5.1M", growth: "+7.6%" },
  { month: "Dec", label: "D", height: 86, revenue: "$407K", streams: "8.1M", growth: "+26.9%" },
] as const;

const dashboardInvoices: MainboardInvoice[] = [];

const dashboardPeopleByInvoiceId: Record<string, string> = {};

const payeeLogoByInvoiceId: Record<
  string,
  {
    mark: string;
    label: string;
    detail?: string;
    src?: string;
    className: string;
    markClassName?: string;
  }
> = {};

const activityDates = ["Today, 10:24 AM", "Today, 9:42 AM", "Yesterday", "May 31", "May 24"];

function getInvoicePersonName(invoice: (typeof dashboardInvoices)[number]) {
  return dashboardPeopleByInvoiceId[invoice.id] || invoice.talentRealName || invoice.talentName || invoice.recipient;
}

const payoutItems = dashboardInvoices.map((invoice, index) => ({
  invoice,
  invoiceId: invoice.id,
  name: getInvoicePersonName(invoice),
  detail: `${invoice.recipient} - ${invoice.jobType}`,
  date: activityDates[index] || invoice.invoiceDate,
  amount: formatMainboardMoney(invoice.amount + invoice.fee),
  status: invoice.status,
}));

const quickBooksInvoiceRows = [
  {
    id: "QB-inv#29475 - 2918...",
    detailId: "INV-2845",
    requested: "paid",
    status: "Done",
    due: "27",
    amount: "$1,500.00",
    client: "Nike, Inc.",
  },
  {
    id: "QB-inv#38485 - 2299...",
    detailId: "INV-2844",
    requested: "request",
    status: "In Process",
    due: "2",
    amount: "$5,400.00",
    client: "The Gap, Inc.",
  },
  {
    id: "QB-inv#88573 - 8857...",
    detailId: "INV-2843",
    requested: "request",
    status: "In Process",
    due: "20",
    amount: "$12,000.00",
    client: "Levi Strauss & Co.",
  },
  {
    id: "QB-inv#88442 - 1184...",
    detailId: "INV-2842",
    requested: "request",
    status: "In Process",
    due: "19",
    amount: "€2,800.00",
    client: "Adidas AG",
  },
  {
    id: "QB-inv#99781 - 7463...",
    detailId: "INV-2841",
    requested: "paid",
    status: "Done",
    due: "25",
    amount: "£1,200.00",
    client: "Burberry Group plc",
  },
  {
    id: "QB-inv#77362 - 9911...",
    detailId: "INV-2845",
    requested: "paid",
    status: "Done",
    due: "7",
    amount: "£800.65",
    client: "Timberland LLC",
  },
  {
    id: "QB-inv#65622 - 7712...",
    detailId: "INV-2844",
    requested: "paid",
    status: "Done",
    due: "30",
    amount: "$1,100.11",
    client: "Levi Strauss & Co.",
  },
] as const;

const walletContacts = [
  { id: "john-adams", name: "John Adams", handle: "@agncy11174" },
  { id: "amy-holland", name: "Amy Holland", handle: "@agncy66122" },
  { id: "lucy-che", name: "Lucy Che", handle: "@agncy88179" },
  { id: "jessica-bailey", name: "Jessica Bailey", handle: "@agncy67171" },
  { id: "lola-durant", name: "Lola Durant", handle: "@agncy72176" },
] as const;

function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn("rounded-2xl border border-slate-200/80 bg-white shadow-xs", className)}>{children}</section>;
}

function FinanceAppPromoCard({ className }: { className?: string }) {
  return (
    <Panel className={cn("overflow-hidden p-0 border border-slate-200/80 shadow-xs", className)}>
      <img
        src="/dashboard-app-promo.png"
        alt="For Those Who Create — Get AgncyPay on Google Play and the App Store"
        className="block h-auto w-full rounded-2xl"
        loading="lazy"
      />
    </Panel>
  );
}

function getInvoiceStatusLabel(status: string): "Request" | "Paid" | "Pay" {
  const normalized = status.toLowerCase();
  if (normalized === "paid") return "Paid";
  if (normalized === "ready" || normalized === "pending") return "Request";
  return "Pay";
}

function InvoiceStatusPill({ invoice }: { invoice: (typeof dashboardInvoices)[number] }) {
  const label = getInvoiceStatusLabel(invoice.status);
  const colorClass =
    label === "Paid"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : label === "Pay"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span className={cn("inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-semibold", colorClass)}>
      {label}
    </span>
  );
}

function RequestedPill({ state }: { state: (typeof quickBooksInvoiceRows)[number]["requested"] }) {
  if (state === "paid") {
    return (
      <span className="inline-flex h-7 min-w-[70px] items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-3 text-[11px] font-bold text-emerald-700">
        <span className="mr-1 text-[11px] leading-none">A</span>
        paid
      </span>
    );
  }

  return (
    <span className="inline-flex h-7 min-w-[114px] items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-3 text-[11px] font-bold text-white shadow-xs">
      Request <span className="mx-1 text-[11px] leading-none">A</span> pay
    </span>
  );
}

function InvoiceStatusBadge({ status }: { status: (typeof quickBooksInvoiceRows)[number]["status"] }) {
  if (status === "Done") {
    return (
      <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
        Done
      </span>
    );
  }

  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 text-[11px] font-semibold text-amber-700">
      <span className="relative h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
      In Process
    </span>
  );
}

function QuickBooksInvoicesList() {
  const router = useRouter();
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const allSelected = selectedInvoiceIds.length === quickBooksInvoiceRows.length;

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoiceIds((current) =>
      current.includes(invoiceId)
        ? current.filter((id) => id !== invoiceId)
        : [...current, invoiceId]
    );
  };

  const toggleAllInvoices = () => {
    setSelectedInvoiceIds(allSelected ? [] : quickBooksInvoiceRows.map((row) => row.id));
  };

  const openInvoiceDetail = (invoiceId: string) => {
    router.push(`/dashboard/invoices/${invoiceId}`);
  };

  return (
    <Panel className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[860px] w-full text-left">
          <thead>
            <tr className="h-10 border-b border-slate-200 bg-slate-50/75 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="w-[40px] px-3">
                <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md bg-[#2ca01c]">
                  <span className="text-[13px] font-black tracking-[-0.08em] text-white">qb</span>
                </div>
              </th>
              <th className="w-[40px] px-3">
                <button
                  type="button"
                  onClick={toggleAllInvoices}
                  aria-label={allSelected ? "Deselect all invoices" : "Select all invoices"}
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                    allSelected ? "border-slate-900 bg-slate-900" : "border-slate-300 bg-white hover:border-slate-400"
                  )}
                >
                  {allSelected ? <Check className="h-3 w-3 text-white" /> : null}
                </button>
              </th>
              <th className="px-3">Invoice(s)</th>
              <th className="w-[160px] px-3 text-center">Requested</th>
              <th className="w-[140px] px-3 text-center">Status</th>
              <th className="w-[80px] px-3 text-center">Due</th>
              <th className="w-[130px] px-3 text-center">Amount</th>
              <th className="w-[160px] px-3 text-center">Client</th>
              <th className="w-[36px]" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quickBooksInvoiceRows.map((row) => {
              const isSelected = selectedInvoiceIds.includes(row.id);

              return (
              <tr
                key={row.id}
                role="button"
                tabIndex={0}
                onClick={() => openInvoiceDetail(row.detailId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openInvoiceDetail(row.detailId);
                  }
                }}
                className={cn(
                  "h-[52px] cursor-pointer bg-white text-slate-900 transition-colors hover:bg-slate-50/80 focus:bg-slate-50 focus:outline-none",
                  isSelected && "bg-slate-50 shadow-[inset_3px_0_0_#0F172A]"
                )}
              >
                <td className="px-3 text-center text-slate-400">
                  <GripVertical className="mx-auto h-4 w-4" />
                </td>
                <td className="px-3">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleInvoiceSelection(row.id);
                    }}
                    aria-label={isSelected ? `Deselect ${row.id}` : `Select ${row.id}`}
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                      isSelected ? "border-slate-900 bg-slate-900" : "border-slate-300 bg-white hover:border-slate-400"
                    )}
                  >
                    {isSelected ? <Check className="h-3 w-3 text-white" /> : null}
                  </button>
                </td>
                <td className="px-3 text-[13px] font-semibold text-slate-900">{row.id}</td>
                <td className="px-3 text-center">
                  <RequestedPill state={row.requested} />
                </td>
                <td className="px-3 text-center">
                  <InvoiceStatusBadge status={row.status} />
                </td>
                <td className="px-3 text-center text-[13px] font-medium text-slate-500">{row.due}</td>
                <td className="px-3 text-center text-[13px] font-bold text-slate-900">{row.amount}</td>
                <td className="px-3 text-center text-[13px] font-medium text-slate-700">{row.client}</td>
                <td className="px-2 text-slate-400">
                  <button
                    type="button"
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`More actions for ${row.id}`}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:text-slate-900"
                  >
                    <EllipsisVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function PayeeLogoTile({
  invoice,
  size = "md",
}: {
  invoice: (typeof dashboardInvoices)[number];
  size?: "sm" | "md";
}) {
  const config = payeeLogoByInvoiceId[invoice.id];
  const name = getInvoicePersonName(invoice);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const mark = config?.mark || initials;

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-[9px] border border-[#444] leading-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]",
        size === "sm" ? "h-9 w-9" : "h-12 w-12",
        config?.className || "bg-[#161616] text-white"
      )}
      aria-label={config?.label || name}
      title={config?.label || name}
    >
      {config?.src ? (
        <RemoteBrandImage
          src={config.src}
          alt={config.label}
          fallback={config.label}
          className={cn("h-full w-full", size === "sm" ? "p-1.5" : "p-2")}
          imageClassName="object-contain"
        />
      ) : (
        <span className={cn(size === "sm" ? "text-[12px]" : "text-[15px]", "font-black", config?.markClassName)}>
          {mark}
        </span>
      )}
      {!config?.src && config?.detail && size === "md" ? (
        <span className="mt-1 max-w-full px-1 text-[6px] font-black tracking-[0.12em] opacity-75">
          {config.detail}
        </span>
      ) : null}
    </div>
  );
}

function BrandTile({
  label,
  href,
  src,
  fallback,
  tileClassName,
  imageClassName,
  search,
}: {
  label: string;
  href?: string;
  src?: string;
  fallback: string;
  tileClassName?: string;
  imageClassName?: string;
  search?: boolean;
}) {
  const Component = href ? Link : "button";
  return (
    <Component
      href={href as string}
      className="flex min-w-0 flex-col items-center gap-2 text-center"
      aria-label={label}
    >
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[12px] border border-[#303030] bg-[#060606] p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        {search ? (
          <div className={cn("flex h-full w-full items-center justify-center overflow-hidden rounded-[9px]", tileClassName)}>
            <Search className="h-6 w-6 text-black" />
          </div>
        ) : src ? (
          <div className={cn("h-full w-full overflow-hidden rounded-[9px]", tileClassName)}>
            <RemoteBrandImage
              src={src}
              alt={label}
              fallback={fallback}
              className="h-full w-full"
              imageClassName={cn("object-contain", imageClassName)}
            />
          </div>
        ) : (
          <div className={cn("flex h-full w-full items-center justify-center overflow-hidden rounded-[9px]", tileClassName)}>
            <span className={cn("text-[12px] font-semibold", fallback === "N/A" ? "text-[#555]" : "text-black")}>{fallback}</span>
          </div>
        )}
      </div>
      <span className={cn("max-w-[78px] text-[12px] leading-4", label === "N/A" ? "text-[#555]" : "text-[#b8b8b8]")}>{label}</span>
    </Component>
  );
}

function BankCardFace({ card }: { card: (typeof bankCards)[number] }) {
  return (
    <div className="relative h-16 w-[104px] shrink-0 overflow-hidden rounded-[8px] bg-black">
      <RemoteBrandImage
        src={card.cardImage}
        alt={card.name}
        fallback={card.fallback}
        className="h-full w-full rounded-[inherit] bg-black"
        imageClassName="h-full w-full object-cover"
      />
    </div>
  );
}

function MusicIncomeLogo({ item }: { item: (typeof musicIncomeItems)[number] }) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-[#303030] bg-[#060606] p-[3px]"
      )}
    >
      <div className={cn("h-full w-full overflow-hidden rounded-[8px]", item.className)}>
        <RemoteBrandImage
          src={item.src}
          alt={item.name}
          fallback={item.fallback}
          className="h-full w-full"
          imageClassName={cn("object-contain", item.imageClassName)}
        />
      </div>
    </div>
  );
}

function CatalogValuationPanel() {
  const [liveTotalIncome] = useState(3657001);

  return (
    <div className="space-y-3">
      <Link
        href="https://catalogcalculator.com/"
        className="flex h-[50px] items-center justify-center rounded-[11px] bg-[#16cf55] px-4 text-center text-[24px] font-black text-[#08240f] transition-colors hover:bg-[#23df65]"
      >
        Catalog Valuation
        <Play className="ml-2 h-6 w-6 fill-current" />
      </Link>

      <Panel className="p-4 sm:p-6 bg-white border-slate-200/80 shadow-sm rounded-2xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr]">
          <div className="flex min-h-[170px] flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 text-center">
            <p className="text-[20px] leading-7 text-slate-500 font-medium">
              Total Income
              <br />
              2026:
            </p>
            <p className="mt-3 text-[36px] font-black leading-none text-emerald-600">${liveTotalIncome.toLocaleString()}</p>
          </div>

          <div className="flex min-h-[170px] flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5">
            <div>
              <p className="text-[18px] text-slate-500 font-medium">Payment Due</p>
              <p className="mt-2 text-[31px] font-bold leading-none text-slate-900">1 Apr</p>
            </div>
            <button
              type="button"
              className="h-10 rounded-xl border border-slate-900 bg-slate-900 text-[16px] font-semibold text-white transition-colors hover:bg-slate-800 cursor-pointer shadow-sm"
            >
              Pay Early
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-5 py-6">
          <p className="text-[18px] font-semibold text-slate-900">Yearly Activity</p>
          <div className="mt-5 grid h-[128px] grid-cols-12 items-end gap-3 overflow-visible">
            {yearlyActivity.map((month) => (
              <button
                key={month.month}
                type="button"
                className="group relative flex h-full min-w-0 flex-col items-center justify-end gap-2 outline-none cursor-pointer"
                aria-label={`${month.month}: ${month.revenue} revenue, ${month.streams} streams, ${month.growth} growth`}
              >
                <span className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-10 w-[124px] -translate-x-1/2 translate-y-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  <span className="block text-[11px] font-bold text-slate-900">{month.month}</span>
                  <span className="mt-1 block text-[10px] font-medium text-slate-500">Revenue {month.revenue}</span>
                  <span className="block text-[10px] font-medium text-slate-500">Streams {month.streams}</span>
                  <span className={cn("mt-1 block text-[10px] font-bold", month.growth.startsWith("-") ? "text-rose-600" : "text-emerald-600")}>
                    {month.growth}
                  </span>
                </span>
                <div
                  className="w-full max-w-[30px] rounded-t-[4px] bg-emerald-500 shadow-[0_0_0_rgba(16,185,129,0)] transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:bg-emerald-600 group-hover:shadow-[0_0_18px_rgba(16,185,129,0.35)] group-focus-visible:-translate-y-1 group-focus-visible:bg-emerald-600 group-focus-visible:shadow-[0_0_18px_rgba(16,185,129,0.35)]"
                  style={{ height: `${month.height}%` }}
                />
                <span className="text-[13px] font-medium text-slate-500 transition-colors duration-200 group-hover:text-slate-900 group-focus-visible:text-slate-900">
                  {month.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function AutoSplitToggle({
  active,
  onToggle,
  label = "Autosplit",
}: {
  active: boolean;
  onToggle: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className="inline-flex h-8 items-center gap-2 rounded-full border border-[#444] bg-black px-2.5 text-[11px] font-black text-white hover:border-[#777]"
      aria-pressed={active}
    >
      <span
        className={cn(
          "relative h-5 w-10 overflow-hidden rounded-full border transition-colors",
          active ? "border-[#13e56d] bg-[#13e56d]" : "border-[#555] bg-[#151515]"
        )}
      >
        <span
          className={cn(
            "absolute left-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white transition-transform",
            active ? "translate-x-5" : "translate-x-0"
          )}
        />
      </span>
      {label}
    </button>
  );
}

function AutoSplitNotice({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-xs">
      <div className="w-full max-w-[420px] rounded-2xl border border-slate-200/90 bg-white p-6 text-slate-900 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Autosplit Enabled</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              AgncyPay will include a $5 autosplit fee when this invoice or contact is paid.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close autosplit notice"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-10 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function WalletContactsOverlay({
  query,
  autosplitContactIds,
  onQueryChange,
  onClose,
  onToggleContact,
  onEnableAll,
}: {
  query: string;
  autosplitContactIds: string[];
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onToggleContact: (contactId: string) => void;
  onEnableAll: () => void;
}) {
  const normalized = query.trim().toLowerCase();
  const filteredContacts = normalized
    ? walletContacts.filter((contact) =>
        [contact.name, contact.handle].join(" ").toLowerCase().includes(normalized)
      )
    : walletContacts;

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/40 px-4 py-16 backdrop-blur-xs">
      <div className="mx-auto w-full max-w-[720px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search name, Agncy ID, email, or mobile..."
            className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-13 pr-12 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 shadow-lg focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 transition-all"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close wallet contacts"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recent contacts</p>
          <div className="mt-4 divide-y divide-slate-100">
            {filteredContacts.map((contact) => {
              const active = autosplitContactIds.includes(contact.id);
              return (
                <div key={contact.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{contact.name}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{contact.handle}</p>
                  </div>
                  <AutoSplitToggle
                    active={active}
                    label="Autosplit"
                    onToggle={() => onToggleContact(contact.id)}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col gap-3 pt-4 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline cursor-pointer"
            >
              Clear filter
            </button>
            <button
              type="button"
              onClick={onEnableAll}
              className="h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Autosplit all talent invoices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreativeBankingPanel({
  liquidity,
  crystallised,
  pending,
  onWithdraw,
  onNet0,
}: {
  liquidity: number;
  crystallised: number;
  pending: number;
  onWithdraw: () => void;
  onNet0: () => void;
}) {
  return (
    <Panel className="p-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Payout Balances</h2>
        <p className="text-xs text-slate-500 mt-0.5">Your real-time settled balances, liquidity, and upcoming earnings.</p>
      </div>

      <div className="mt-4 space-y-3">
        {/* Pending Balance Row */}
        <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-800">Pending Balance</span>
              <p className="mt-0.5 text-2xl font-black text-slate-900 tracking-tight leading-none">
                ${pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-amber-700/80 mt-1">Invoiced but awaiting brand payment.</p>
            </div>
          </div>
          <span className={cn(
            "text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 border",
            pending > 0
              ? "text-amber-800 bg-amber-100 border-amber-300"
              : "text-slate-500 bg-white border-slate-200"
          )}>
            {pending > 0 ? "Awaiting" : "Cleared"}
          </span>
        </div>

        {/* Liquidity Balance Row */}
        <div className="p-4 bg-emerald-50/60 border border-emerald-200/70 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-800">Liquidity Balance</span>
              <p className="mt-0.5 text-2xl font-black text-slate-900 tracking-tight leading-none">
                ${liquidity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-emerald-700/80 mt-1">Available to send, withdraw, or spend anytime.</p>
            </div>
          </div>
          <button
            onClick={onWithdraw}
            disabled={liquidity <= 0}
            className="h-9 px-3.5 rounded-lg border border-slate-900 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-xs"
          >
            Withdraw
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Crystallised Balance Row */}
        <div className="p-4 bg-purple-50/60 border border-purple-200/70 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-800 border border-purple-200">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-purple-800">Crystallised Balance</span>
              <p className="mt-0.5 text-2xl font-black text-slate-900 tracking-tight leading-none">
                ${crystallised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-purple-700/80 mt-1">Earnings locked from completed settlements.</p>
            </div>
          </div>
          <button
            onClick={onNet0}
            disabled={crystallised <= 0}
            className="h-9 px-3.5 rounded-lg border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-xs"
          >
            Early Payout
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Panel>
  );
}

function DashboardFooter() {
  return (
    <footer className="mt-10 border-t border-slate-200 py-8">
      <div className="mx-auto flex max-w-[1040px] flex-wrap items-center justify-center gap-6 px-4 text-xs font-semibold text-slate-500">
        <img
          src="/agncypaybrand.png"
          alt="AgncyPay"
          className="h-8 w-auto object-contain [filter:invert(1)_brightness(0.15)]"
        />
        <Link href="/dashboard/support" className="hover:text-slate-900 transition-colors">Help</Link>
        <Link href="/dashboard/support" className="hover:text-slate-900 transition-colors">Contact Us</Link>
        <Link href="/dashboard/verification" className="hover:text-slate-900 transition-colors">Security</Link>
        <Link href="/dashboard/settings" className="hover:text-slate-900 transition-colors">Fees</Link>
      </div>
    </footer>
  );
}

function IntegrationsShortcutsPanel({
  connectedIntegrations,
  onAddClick,
}: {
  connectedIntegrations: string[];
  onAddClick: () => void;
}) {
  const masterIntegrations = [
    { label: "QuickBooks", src: "/quickbook.png", href: "/dashboard/settings/integrations/quickbooks" },
    { label: "Mercury", src: "/mercuryLogo.png", href: "/dashboard/settings/integrations/mercury", bg: "bg-white" },
    { label: "Xero", src: "/xero.png", href: "/dashboard/settings/integrations/xero" },
    { label: "Sage", src: "/sage.png", href: "/dashboard/settings/integrations/sage" },
    { label: "NetSuite", src: "/netsuite.png", href: "/dashboard/settings/integrations/netsuite" },
  ];

  const connected = masterIntegrations.filter((item) => connectedIntegrations.includes(item.label));
  
  const gridItems: any[] = [];
  
  connected.forEach((item) => {
    gridItems.push({ type: "connected", ...item });
  });

  if (gridItems.length < 5) {
    gridItems.push({ type: "add" });
  }

  while (gridItems.length < 5) {
    gridItems.push({ type: "na" });
  }

  return (
    <Panel className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold text-white">Integrations</h2>
          <p className="mt-1 text-[13px] text-[#8f8f8f]">
            Connect external systems and services to sync data automatically.
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-3">
        {gridItems.map((item, idx) => {
          if (item.type === "na") {
            return (
              <div key={`na-${idx}`} className="flex min-w-0 flex-col items-center gap-2 text-center">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[12px] border border-[#303030] bg-[#060606] p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                  <span className="text-[12px] font-semibold text-[#555]">N/A</span>
                </div>
                <span className="max-w-[78px] text-[12px] leading-4 text-[#555]">N/A</span>
              </div>
            );
          }

          if (item.type === "add") {
            return (
              <button
                key="add-btn"
                type="button"
                onClick={onAddClick}
                className="flex min-w-0 flex-col items-center gap-2 text-center group"
                aria-label="Add Integration"
              >
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[12px] border border-dashed border-[#3a3a3a] bg-black text-[#555] transition-all group-hover:border-[#888] group-hover:text-white">
                  <span className="text-[28px] font-light leading-none">+</span>
                </div>
                <span className="max-w-[78px] text-[12px] leading-4 text-[#555] group-hover:text-white transition-colors">Connect</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex min-w-0 flex-col items-center gap-2 text-center group"
              aria-label={item.label}
            >
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[12px] border border-[#303030] bg-[#060606] p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-colors group-hover:border-[#555]">
                <div className={cn("h-full w-full overflow-hidden rounded-[9px] flex items-center justify-center", item.bg || "bg-transparent")}>
                  <img
                    src={item.src}
                    alt={item.label}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
              <span className="max-w-[78px] text-[12px] leading-4 text-[#b8b8b8] group-hover:text-white transition-colors">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </Panel>
  );
}

function QuickBooksOnlinePanel({
  connected,
  invoices,
  loading,
  disconnecting,
  onDisconnect,
}: {
  connected: boolean;
  invoices: any[];
  loading: boolean;
  disconnecting: boolean;
  onDisconnect: () => Promise<void>;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setShowConfirm(false);
  }, [connected]);

  return (
    <Panel className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-transparent">
            <img src="/quickbook.png" alt="QuickBooks" className="h-full w-full object-contain" />
          </div>
          <h2 className="text-[18px] font-semibold text-white">QuickBooks Online</h2>
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-[#333] bg-[#111] px-3 text-[11px] font-semibold text-[#8f8f8f]">
              <Loader2 className="h-3 w-3 animate-spin" />
              Checking
            </span>
          ) : connected ? (
            <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 text-[11px] font-semibold text-green-500">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Connected
            </span>
          ) : (
            <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-[#444] bg-[#1a1a1a] px-3 text-[11px] font-semibold text-[#777]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#555]" />
              Not Connected
            </span>
          )}
          <Link
            href="/dashboard/settings/integrations/quickbooks"
            className="text-[12px] font-semibold text-[#8f8f8f] hover:text-white"
          >
            Settings
          </Link>
        </div>
      </div>

      <p className="mt-1 text-[13px] text-[#8f8f8f]">
        Sync invoices, payments, and vendors automatically to your QBO account.
      </p>

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[#8f8f8f]" />
          </div>
        ) : showConfirm ? (
          /* ── Disconnect Confirmation State ── */
          <div className="flex flex-col items-center rounded-[10px] border border-red-500/20 bg-red-500/5 px-5 py-6 text-center animate-in fade-in duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-[15px] font-semibold text-white">Disconnect QuickBooks?</h3>
            <p className="mt-1.5 max-w-[320px] text-[12px] leading-[18px] text-[#9b9b9b]">
              Are you sure you want to disconnect QuickBooks? This will stop syncing invoices and payouts immediately.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="inline-flex h-[32px] items-center rounded-[7px] border border-[#444] bg-[#1a1a1a] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#2a2a2a]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onDisconnect();
                  setShowConfirm(false);
                }}
                disabled={disconnecting}
                className="inline-flex h-[32px] items-center gap-1.5 rounded-[7px] border border-red-500 bg-red-500 px-4 text-[12px] font-semibold text-black transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {disconnecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unplug className="h-3 w-3" />}
                Yes, Disconnect
              </button>
            </div>
          </div>
        ) : !connected ? (
          /* ── Disconnected Empty State ── */
          <div className="flex flex-col items-center rounded-[10px] border border-dashed border-[#333] bg-[#060606] px-5 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#333] bg-[#111]">
              <Plug className="h-5 w-5 text-[#8f8f8f]" />
            </div>
            <h3 className="mt-4 text-[15px] font-semibold text-white">Connect QuickBooks</h3>
            <p className="mt-1.5 max-w-[320px] text-[12px] leading-[18px] text-[#7f7f7f]">
              Link your QuickBooks sandbox account to fetch live invoices, sync payments, and manage vendors directly from your dashboard.
            </p>
            <Link
              href="http://localhost:3001/api/v1/quickbooks/connect"
              className="mt-5 inline-flex h-[34px] items-center gap-2 rounded-[7px] border border-white bg-white px-4 text-[12px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
            >

              <Plug className="h-3.5 w-3.5" />
              Connect Now
            </Link>
          </div>
        ) : invoices.length === 0 ? (
          /* ── Connected but no invoices ── */
          <div className="flex flex-col items-center rounded-[10px] border border-dashed border-[#2a2a2a] bg-[#060606] px-5 py-6 text-center">
            <p className="text-[13px] text-[#7f7f7f]">No invoices found in QuickBooks.</p>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={disconnecting}
              className="mt-3 inline-flex h-[30px] items-center gap-1.5 rounded-[6px] border border-red-500/20 bg-red-500/5 px-3 text-[11px] font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              <Unplug className="h-3 w-3" />
              Disconnect
            </button>
          </div>
        ) : (
          /* ── Connected with invoices ── */
          <div className="space-y-2">
            {invoices.slice(0, 5).map((inv) => {
              const isOverdue = inv.daysText === "Overdue";
              const isPaid = inv.status === "Paid";
              const targetHref = isPaid
                ? `/receipt/${inv.id}?tx=TX-AP-QBO-${inv.id}&mode=logged_in&returnTo=dashboard`
                : `/dashboard/pay-flow/${inv.id}`;

              return (
                <Link
                  key={inv.id}
                  href={targetHref}
                  className="flex items-center gap-3 rounded-[8px] border border-[#333] bg-black px-3 py-2 transition-colors hover:border-[#555] hover:bg-white/[0.04] cursor-pointer"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-transparent">
                    <img src="/quickbook.png" alt="QuickBooks" className="h-full w-full object-contain" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-white">{inv.name}</p>
                    <p className="truncate text-[11px] text-[#7f7f7f]">{inv.detail}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "inline-flex h-[22px] items-center rounded-full border px-2.5 text-[10px] font-bold",
                        isPaid
                          ? "border-[#10b95f]/30 bg-[#082315] text-[#70ff9e]"
                          : isOverdue
                            ? "border-[#ff3b30]/30 bg-[#250706] text-[#ff9088]"
                            : "border-[#f59e0b]/30 bg-[#261a03] text-[#fbbf24]"
                      )}
                    >
                      {inv.status}
                    </span>

                    <span
                      className={cn(
                        "hidden text-[11px] sm:inline-block w-28 text-left",
                        isOverdue ? "text-[#ff9088]" : isPaid ? "text-[#70ff9e]" : "text-[#7f7f7f]"
                      )}
                    >
                      {inv.daysText}
                    </span>

                    <div className="hidden text-right text-[11px] text-[#7f7f7f] md:block">{inv.date}</div>

                    <div className="min-w-[72px] text-right text-[13px] font-semibold text-white">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(inv.amount)}
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-[#7f7f7f] hover:text-white">
                      <EllipsisVertical className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Disconnect button below invoices */}
            <div className="flex items-center justify-between pt-2">
              <Link
                href="/dashboard/settings/integrations/quickbooks"
                className="text-[11px] font-semibold text-[#8f8f8f] hover:text-white"
              >
                View All Invoices →
              </Link>
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={disconnecting}
                className="inline-flex h-[28px] items-center gap-1.5 rounded-[6px] border border-red-500/20 bg-red-500/5 px-2.5 text-[11px] font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
              >
                <Unplug className="h-3 w-3" />
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

export default function DashboardHomePage() {
  const router = useRouter();
  const { state, resetState } = useApp();
  const activeWorkspace = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
  const workspaceType = activeWorkspace?.type || state.user?.accountType || "brand";
  const workspaceName = activeWorkspace?.name || "Acme Corp";

  const [isLightTheme, setIsLightTheme] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      setIsLightTheme(true);
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      const isLight = document.documentElement.classList.toggle("light");
      if (isLight) {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }
      setIsLightTheme(isLight);
      localStorage.setItem("agncypay_theme_talent", isLight ? "light" : "dark");
    }
  };

  const handleLogout = () => {
    resetState();
    router.push("/auth/login");
  };

  const [autosplitInvoiceIds, setAutosplitInvoiceIds] = useState<string[]>([dashboardInvoices[0]?.id || ""]);
  const [autosplitContactIds, setAutosplitContactIds] = useState<string[]>([]);
  const [isAutosplitNoticeOpen, setIsAutosplitNoticeOpen] = useState(false);
  const [isWalletContactsOpen, setIsWalletContactsOpen] = useState(false);
  const [walletContactQuery, setWalletContactQuery] = useState("");
  const [dynamicIncomes, setDynamicIncomes] = useState<any[]>([]);
  const [isLoadingIncomes, setIsLoadingIncomes] = useState(true);
  const [hasUpload, setHasUpload] = useState(false);

  // Banks & Cards list state
  const [linkedCards, setLinkedCards] = useState<any[]>([
    {
      name: "Chase Ink Business Unlimited Visa",
      detail: "Visa ****86",
      cardImage: CHASE_INK_BUSINESS_UNLIMITED_IMAGE,
      fallback: "Chase",
    },
    {
      name: "Mercury Business IO Mastercard",
      detail: "Mastercard ****57",
      cardImage: MERCURY_IO_CARD_IMAGE,
      fallback: "Mercury",
    },
    {
      name: "Bank of America Business Debit Visa",
      detail: "Debit ****88",
      cardImage: BOFA_BUSINESS_DEBIT_VISA_IMAGE,
      fallback: "Bank of America",
    },
    {
      name: "Mercury Debit Mastercard",
      detail: "Debit ****86",
      cardImage: MERCURY_IO_CARD_IMAGE,
      fallback: "Mercury",
    },
  ]);

  // Link Card/Bank Modal States
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkModalStep, setLinkModalStep] = useState<
    "select" | "plaid_intro" | "plaid_banks" | "plaid_login" | "plaid_verifying" | "plaid_success" | "card_form" | "card_verifying" | "card_success"
  >("select");
  const [selectedBank, setSelectedBank] = useState("");
  const [plaidUsername, setPlaidUsername] = useState("");
  const [plaidPassword, setPlaidPassword] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [cardZip, setCardZip] = useState("");
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [plaidErrors, setPlaidErrors] = useState<Record<string, string>>({});
  const [modalLoadingText, setModalLoadingText] = useState("");

  // Reset modal values
  const resetLinkModal = () => {
    setLinkModalStep("select");
    setSelectedBank("");
    setPlaidUsername("");
    setPlaidPassword("");
    setCardHolder("");
    setCardNumber("");
    setCardExpiry("");
    setCardCVC("");
    setCardZip("");
    setCardErrors({});
    setPlaidErrors({});
    setModalLoadingText("");
    setDashboardPlaidError(null);
  };

  const handlePlaidLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!plaidUsername.trim()) errors.username = "Username is required";
    if (!plaidPassword.trim()) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      setPlaidErrors(errors);
      return;
    }

    setPlaidErrors({});
    setLinkModalStep("plaid_verifying");
    setModalLoadingText("Connecting to " + selectedBank + "...");

    setTimeout(() => {
      setModalLoadingText("Verifying credentials...");
      setTimeout(() => {
        setModalLoadingText("Importing checking account details...");
        setTimeout(() => {
          const newBank = {
            name: `${selectedBank} Business Account`,
            detail: `Checking ****${Math.floor(1000 + Math.random() * 9000)}`,
            cardImage: selectedBank === "Chase" ? CHASE_INK_BUSINESS_UNLIMITED_IMAGE : (selectedBank === "Mercury" ? MERCURY_IO_CARD_IMAGE : (selectedBank === "Bank of America" ? BOFA_BUSINESS_DEBIT_VISA_IMAGE : "/quickbook.png")),
            fallback: selectedBank,
          };
          setLinkedCards((prev) => [newBank, ...prev]);
          setLinkModalStep("plaid_success");
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!cardHolder.trim()) errors.holder = "Cardholder name is required";
    
    const cleanNum = cardNumber.replace(/\s+/g, "");
    if (!cleanNum) {
      errors.number = "Card number is required";
    } else if (cleanNum.length < 15 || cleanNum.length > 16 || !/^\d+$/.test(cleanNum)) {
      errors.number = "Invalid card number (15-16 digits)";
    }

    if (!cardExpiry.trim()) {
      errors.expiry = "Expiration is required";
    } else if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(cardExpiry)) {
      errors.expiry = "MM/YY format required";
    }

    if (!cardCVC.trim()) {
      errors.cvc = "CVC is required";
    } else if (cardCVC.length < 3 || cardCVC.length > 4 || !/^\d+$/.test(cardCVC)) {
      errors.cvc = "Invalid CVC (3-4 digits)";
    }

    if (!cardZip.trim()) {
      errors.zip = "ZIP code is required";
    } else if (cardZip.length < 5 || !/^\d+$/.test(cardZip)) {
      errors.zip = "Invalid ZIP";
    }

    if (Object.keys(errors).length > 0) {
      setCardErrors(errors);
      return;
    }

    setCardErrors({});
    setLinkModalStep("card_verifying");
    setModalLoadingText("Authorizing credit/debit card details...");

    setTimeout(() => {
      setModalLoadingText("Securing tokens with payment gateway...");
      setTimeout(() => {
        const cardBrand = cleanNum.startsWith("4") ? "Visa" : (cleanNum.startsWith("5") ? "Mastercard" : "Amex");
        const newCard = {
          name: `${cardHolder}'s ${cardBrand}`,
          detail: `${cardBrand} ****${cleanNum.slice(-4)}`,
          cardImage: MERCURY_IO_CARD_IMAGE,
          fallback: cardBrand,
        };
        setLinkedCards((prev) => [newCard, ...prev]);
        setLinkModalStep("card_success");
      }, 1000);
    }, 1000);
  };

  // QBO state lifted to page level
  const [qboConnected, setQboConnected] = useState(false);
  const [qboInvoices, setQboInvoices] = useState<any[]>([]);
  const [qboPayouts, setQboPayouts] = useState<any[]>([]);
  const [qboVendors, setQboVendors] = useState<any[]>([]);
  const [qboLoading, setQboLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  // Plaid connection states
  const [plaidConnected, setPlaidConnected] = useState(false);
  const [plaidLinkToken, setPlaidLinkToken] = useState<string | null>(null);
  const [isDashboardMockPlaid, setIsDashboardMockPlaid] = useState(false);
  const [plaidLoading, setPlaidLoading] = useState(true);
  const [plaidDisconnecting, setPlaidDisconnecting] = useState(false);
  const [plaidInstitutionName, setPlaidInstitutionName] = useState("");
  const [dashboardPlaidError, setDashboardPlaidError] = useState<string | null>(null);
  const handlePlaidDisconnect = async () => { setPlaidConnected(false); };

  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);
  const [isAddIntegrationModalOpen, setIsAddIntegrationModalOpen] = useState(false);
  const [addIntegrationModalStep, setAddIntegrationModalStep] = useState<"select" | "connecting" | "success">("select");
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [integrationLoadingText, setIntegrationLoadingText] = useState("");

  useEffect(() => {
    if (qboConnected) {
      setConnectedIntegrations((prev) => {
        if (prev.includes("QuickBooks")) return prev;
        return [...prev, "QuickBooks"];
      });
    } else {
      setConnectedIntegrations((prev) => prev.filter((item) => item !== "QuickBooks"));
    }
  }, [qboConnected]);

  const handleConnectIntegration = (integration: any) => {
    setSelectedIntegration(integration);
    
    if (integration.label === "QuickBooks") {
      window.location.href = "http://localhost:3001/api/v1/quickbooks/connect";
      return;
    }


    setAddIntegrationModalStep("connecting");
    setIntegrationLoadingText("Establishing secure connection with " + integration.label + "...");

    setTimeout(() => {
      setIntegrationLoadingText("Authorizing data scopes & sync intervals...");
      setTimeout(() => {
        setIntegrationLoadingText("Importing integration profiles...");
        setTimeout(() => {
          setConnectedIntegrations((prev) => {
            if (prev.includes(integration.label)) return prev;
            return [...prev, integration.label];
          });
          setAddIntegrationModalStep("success");
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/quickbooks/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setQboConnected(data.connected);
        if (data.connected) {
          const [invRes, payRes, vendRes] = await Promise.all([
            fetch("/api/quickbooks/invoices", { cache: "no-store" }),
            fetch("/api/quickbooks/payouts", { cache: "no-store" }),
            fetch("/api/quickbooks/vendors", { cache: "no-store" }),
          ]);
          if (invRes.ok) {
            const invData = await invRes.json();
            setQboInvoices(invData.invoices || []);
          }
          if (payRes.ok) {
            const payData = await payRes.json();
            setQboPayouts(payData.payouts || []);
          }
          if (vendRes.ok) {
            const vendData = await vendRes.json();
            setQboVendors(vendData.vendors || []);
          }
        } else {
          setQboInvoices([]);
          setQboPayouts([]);
          setQboVendors([]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch QuickBooks status:", err);
    } finally {
      setQboLoading(false);
    }
  };

  const fetchPlaidStatus = async () => {
    try {
      const res = await fetch("/api/plaid/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPlaidConnected(data.connected);
        if (data.connected) {
          setPlaidInstitutionName(data.institutionName || "Linked Bank");
          
          // If connected, add a representation of the bank to linkedCards if not already in there
          if (data.institutionName) {
            setLinkedCards((prev) => {
              const exists = prev.some((card) => card.name.includes(data.institutionName));
              if (exists) return prev;
              const newBank = {
                name: `${data.institutionName} Business Account`,
                detail: `Checking ****${data.itemId ? data.itemId.slice(-4) : "8827"}`,
                cardImage: CHASE_INK_BUSINESS_UNLIMITED_IMAGE,
                fallback: data.institutionName,
              };
              return [newBank, ...prev];
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch Plaid status:", err);
    } finally {
      setPlaidLoading(false);
    }
  };

  // Check if we are resuming from an OAuth redirect
  const [dashboardReceivedRedirectUri, setDashboardReceivedRedirectUri] = useState<string | undefined>(undefined);

  const [widgetInvoices, setWidgetInvoices] = useState<any[]>([]);
  const [sessionWithdrawAmount, setSessionWithdrawAmount] = useState(0);
  const [sessionNet0Advanced, setSessionNet0Advanced] = useState(0);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const userEmail = state.user?.email || "";
    const accountType = state.user?.accountType || "agency";

    subscribeInvoicesByAgency()
      .then((invoicesList) => setWidgetInvoices(invoicesList))
      .catch((err) => console.error("Error fetching widget invoices:", err));
  }, [state.user]);

  useEffect(() => {
    const userEmail = state.user?.email || "guest";
    const savedWithdraw = localStorage.getItem(`talent_withdraw_adjust_${userEmail}`);
    if (savedWithdraw) setSessionWithdrawAmount(parseFloat(savedWithdraw));

    const savedNet0 = localStorage.getItem(`talent_net0_advanced_${userEmail}`);
    if (savedNet0) setSessionNet0Advanced(parseFloat(savedNet0));
  }, [state.user]);

  const [liveAvailable] = useState(24500.00);
  const [liveSpent] = useState(1200.00);

  const [liquidityBalance, setLiquidityBalance] = useState(0);
  const [crystallisedBalance, setCrystallisedBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);

  useEffect(() => {
    const userEmail = state.user?.email || "guest";
    const normalizedEmail = userEmail.trim().toLowerCase();

    const dynamicCrystallised = widgetInvoices.reduce((sum, i) => {
      if (i.splits && i.splits.length > 0) {
        const mySplit = i.splits.find((s: any) => s.talentEmail.trim().toLowerCase() === normalizedEmail);
        if (mySplit && i.status === "paid" && mySplit.status === "pending") {
          return sum + mySplit.amount;
        }
      } else if (i.talentEmail.trim().toLowerCase() === normalizedEmail && i.status === "paid" && i.talentPayoutStatus === "pending") {
        return sum + i.amount * 0.85;
      }
      return sum;
    }, 0);

    const dynamicLiquidity = widgetInvoices.reduce((sum, i) => {
      if (i.splits && i.splits.length > 0) {
        const mySplit = i.splits.find((s: any) => s.talentEmail.trim().toLowerCase() === normalizedEmail);
        if (mySplit && mySplit.status === "disbursed") {
          return sum + mySplit.amount;
        }
      } else if (i.talentEmail.trim().toLowerCase() === normalizedEmail && i.talentPayoutStatus === "disbursed") {
        return sum + i.amount * 0.85;
      }
      return sum;
    }, 0);

    // Pending balance: invoices assigned to this talent where brand hasn't paid yet
    const dynamicPending = widgetInvoices.reduce((sum, i) => {
      if (i.status === "pending") {
        if (i.splits && i.splits.length > 0) {
          const mySplit = i.splits.find((s: any) => s.talentEmail.trim().toLowerCase() === normalizedEmail);
          if (mySplit) return sum + mySplit.amount;
        } else if (i.talentEmail.trim().toLowerCase() === normalizedEmail) {
          return sum + i.amount * 0.85;
        }
      }
      return sum;
    }, 0);

    // Start at $0 — balances build from real Firestore data
    const defaultLiq = 0;
    const defaultCry = 0;

    const finalCry = Math.max(0, (defaultCry + dynamicCrystallised) - sessionNet0Advanced);
    const finalLiq = Math.max(0, (defaultLiq + dynamicLiquidity) + (sessionNet0Advanced * 0.985) - sessionWithdrawAmount);

    setLiquidityBalance(finalLiq);
    setCrystallisedBalance(finalCry);
    setPendingBalance(dynamicPending);
  }, [widgetInvoices, sessionWithdrawAmount, sessionNet0Advanced, state.user]);

  const [isNet0Open, setIsNet0Open] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [net0Stage, setNet0Stage] = useState<"idle" | "verifying" | "advancing" | "crediting" | "success">("idle");
  const [withdrawStage, setWithdrawStage] = useState<"idle" | "submitting" | "success">("idle");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [selectedWithdrawCard, setSelectedWithdrawCard] = useState(0);

  const handleProcessNet0 = () => {
    const userEmail = state.user?.email || "guest";
    const net0Key = `brand_stats_net0_funded_${userEmail}`;
    const incomesKey = `uploadedIncomes_${userEmail}`;

    setNet0Stage("verifying");
    setTimeout(() => {
      setNet0Stage("advancing");
      setTimeout(() => {
        setNet0Stage("crediting");
        setTimeout(() => {
          setNet0Stage("success");
          
          const advAmt = crystallisedBalance;
          const fee = advAmt * 0.015;
          const netCredit = advAmt - fee;

          setSessionNet0Advanced((prev) => {
            const next = prev + advAmt;
            localStorage.setItem(`talent_net0_advanced_${userEmail}`, next.toString());
            return next;
          });

          // Sync with Brand/Agency Net-0 Funded stats card
          const currentNet0 = localStorage.getItem(net0Key);
          const defaultNet0 = 0;
          const nextNet0 = (currentNet0 ? parseFloat(currentNet0) : defaultNet0) + advAmt;
          localStorage.setItem(net0Key, nextNet0.toString());

          const newIncome = {
            slug: `net0-advance-${Date.now()}`,
            name: "AgncyPay Net-0 Treasury",
            detail: "Instant Campaign Cash Advance",
            date: "Today, Just now",
            amount: `+$${netCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            src: "/agncypaybrand.png",
            fallback: "AP",
            className: "bg-white/10",
            imageClassName: "scale-[1.1] p-1",
          };

          const stored = localStorage.getItem(incomesKey);
          const existing = stored ? JSON.parse(stored) : [];
          const nextIncomes = [newIncome, ...existing];
          localStorage.setItem(incomesKey, JSON.stringify(nextIncomes));

          window.dispatchEvent(new Event("incomesUpdated"));
          window.dispatchEvent(new Event("syncBrandDashboard"));

          setTimeout(() => {
            setIsNet0Open(false);
            setNet0Stage("idle");
          }, 2000);
        }, 1500);
      }, 1500);
    }, 1200);
  };

  const handleProcessWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawError("Please enter a valid amount.");
      return;
    }
    if (amt > liquidityBalance) {
      setWithdrawError("Amount exceeds your available liquidity balance.");
      return;
    }

    const userEmail = state.user?.email || "guest";
    const incomesKey = `uploadedIncomes_${userEmail}`;

    setWithdrawError("");
    setWithdrawStage("submitting");

    setTimeout(() => {
      setWithdrawStage("success");
      setSessionWithdrawAmount((prev) => {
        const next = prev + amt;
        localStorage.setItem(`talent_withdraw_adjust_${userEmail}`, next.toString());
        return next;
      });

      const newIncome = {
        slug: `withdrawal-${Date.now()}`,
        name: `Transfer to ${bankCards[selectedWithdrawCard].fallback}`,
        detail: bankCards[selectedWithdrawCard].name,
        date: "Today, Just now",
        amount: `-$${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        src: bankCards[selectedWithdrawCard].cardImage,
        fallback: bankCards[selectedWithdrawCard].fallback.substring(0, 2),
        className: "bg-[#111]",
        imageClassName: "object-cover",
      };

      const stored = localStorage.getItem(incomesKey);
      const existing = stored ? JSON.parse(stored) : [];
      const nextIncomes = [newIncome, ...existing];
      localStorage.setItem(incomesKey, JSON.stringify(nextIncomes));

      window.dispatchEvent(new Event("incomesUpdated"));

      setTimeout(() => {
        setIsWithdrawOpen(false);
        setWithdrawStage("idle");
        setWithdrawAmount("");
      }, 2000);
    }, 2000);
  };

  useEffect(() => {
    const userEmail = state.user?.email || "guest";
    const incomesKey = `uploadedIncomes_${userEmail}`;

    const loadIncomes = async () => {
      const uploadId = typeof window !== "undefined" ? localStorage.getItem("uploadedUploadId") : null;
      let hasRenderedCache = false;
      try {
        const stored = localStorage.getItem(incomesKey);
        if (stored) {
          setDynamicIncomes(JSON.parse(stored));
        } else {
          setDynamicIncomes([]);
        }
      } catch {}

      // If there was no cached data to show, show the skeleton loader while we fetch
      if (!hasRenderedCache) {
        setIsLoadingIncomes(true);
      }

      // 2. Fetch live data from API in background
      if (uploadId) {
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://agencypay-website-backend.onrender.com";
          const response = await fetch(`${apiBaseUrl}/api/excel/uploads/${uploadId}/summary`);
          
          if (response.status === 404) {
            // Upload was not found on the backend (e.g. after container restart or expiration)
            try {
              localStorage.removeItem("uploadedUploadId");
              localStorage.removeItem("uploadedFileName");
              localStorage.removeItem("uploadedFileSize");
              localStorage.removeItem("uploadedTotals");
              localStorage.removeItem("uploadedOriginalName");
              localStorage.removeItem("uploadedRowCount");
              localStorage.removeItem("uploadedVendors");
              localStorage.removeItem("uploadedIncomes");
            } catch {}
            setHasUpload(false);
            setDynamicIncomes([]);
            setIsLoadingIncomes(false);
          } else {
            const data = await response.json();

            if (response.ok && data?.success && data?.data?.vendors) {
              const vendors = data.data.vendors || [];
              localStorage.setItem("uploadedVendors", JSON.stringify(vendors));

              const mapped = vendors.map((v: any) => {
                const vName = v.vendor || "Unknown Vendor";
                const vRowCount = typeof v.rowCount === "number" ? v.rowCount : 0;
                const vNetIncome = typeof v.totalNetIncome === "number" ? v.totalNetIncome : 0;
                return {
                  slug: "uploaded-preview",
                  name: vName,
                  detail: `${vRowCount.toLocaleString()} transactions parsed`,
                  date: "Parsed from Excel",
                  amount: `$${vNetIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  rawAmount: vNetIncome,
                  src: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${vName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com&size=128`,
                  fallback: vName.substring(0, 2).toUpperCase(),
                  className: "bg-[#111]",
                  imageClassName: "scale-[1]",
                };
              });
              mapped.sort((a: any, b: any) => b.rawAmount - a.rawAmount);
              setDynamicIncomes(mapped);
              setIsLoadingIncomes(false);
              return;
            } else if (data?.success === false && data?.error?.code === "NOT_FOUND") {
              try {
                localStorage.removeItem("uploadedUploadId");
                localStorage.removeItem("uploadedFileName");
                localStorage.removeItem("uploadedFileSize");
                localStorage.removeItem("uploadedTotals");
                localStorage.removeItem("uploadedOriginalName");
                localStorage.removeItem("uploadedRowCount");
                localStorage.removeItem("uploadedVendors");
                localStorage.removeItem("uploadedIncomes");
              } catch {}
              setHasUpload(false);
              setDynamicIncomes([]);
              setIsLoadingIncomes(false);
            }
          }
        } catch (err) {
          console.error("Dashboard API fetch failed, falling back to cached state:", err);
          setIsLoadingIncomes(false);
        }
      } else {
        setIsLoadingIncomes(false);
      }
    };
    loadIncomes();
    window.addEventListener("incomesUpdated", loadIncomes);
    return () => window.removeEventListener("incomesUpdated", loadIncomes);
  }, [state.user]);

  const allIncomes = dynamicIncomes;

  const toggleAutosplitInvoice = (invoiceId: string) => {
    const isActive = autosplitInvoiceIds.includes(invoiceId);
    if (!isActive) setIsAutosplitNoticeOpen(true);
    setAutosplitInvoiceIds((current) =>
      isActive ? current.filter((id) => id !== invoiceId) : [...current, invoiceId]
    );
  };

  const toggleAutosplitContact = (contactId: string) => {
    const isActive = autosplitContactIds.includes(contactId);
    if (!isActive) setIsAutosplitNoticeOpen(true);
    setAutosplitContactIds((current) =>
      isActive ? current.filter((id) => id !== contactId) : [...current, contactId]
    );
  };

  const enableAllContactAutosplit = () => {
    setAutosplitContactIds(walletContacts.map((contact) => contact.id));
    setIsAutosplitNoticeOpen(true);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-50/40 text-slate-900 pb-12">
      <div className="mx-auto max-w-[1520px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {state.user?.fullName || "Partner"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time payment settlements, creator splits, and accounting ledger.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Ledger Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="space-y-6">
            <FinanceAppPromoCard />

            {/* 1. Recent Income Panel */}
            <Panel className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recent Income</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {qboConnected ? "Money received from QuickBooks Online synced invoices." : "Your latest account activity."}
                  </p>
                </div>
                {qboConnected && (
                  <Link
                    href="/dashboard/incomes"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                  >
                    View All
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              <div className="mt-5">
                {qboLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                ) : !qboConnected ? (
                  /* ERP Connect Cards Grid */
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                    {[
                      { id: "netsuite", name: "Oracle NetSuite", desc: "Enterprise grade syncing for complex chart of accounts and multi-entity setups.", src: "https://www.google.com/s2/favicons?domain=netsuite.com&sz=128" },
                      { id: "sage", name: "Sage Intacct", desc: "Automate financial reporting and sync payables effortlessly to Sage.", src: "https://www.google.com/s2/favicons?domain=sage.com&sz=128" },
                      { id: "quickbooks", name: "QuickBooks Online", desc: "Sync invoices, payments, and vendors automatically to your QBO account.", src: "/quickbook.png", connectUrl: "/api/auth/quickbooks/connect" },
                      { id: "xero", name: "Xero", desc: "Keep your Xero ledgers up to date in real-time as payments are processed.", src: "https://www.google.com/s2/favicons?domain=xero.com&sz=128" }
                    ].map((erp) => (
                      <div key={erp.id} className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 text-center hover:border-slate-300 transition-all shadow-2xs">
                        <div>
                          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white p-2 border border-slate-200/80 shadow-2xs">
                            <img src={erp.src} alt={erp.name} className="h-full w-full object-contain" />
                          </div>
                          <h4 className="mt-3 text-sm font-bold text-slate-900">{erp.name}</h4>
                          <span className="mt-1 inline-flex items-center rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            Not Connected
                          </span>
                        </div>
                        <div className="mt-4">
                          {erp.connectUrl ? (
                            <Link
                              href={erp.connectUrl}
                              className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
                            >
                              Connect
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                alert(`${erp.name} integration setup will redirect to its authorization portal in production.`);
                              }}
                              className="h-8 w-full rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                            >
                              Connect
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Synced QuickBooks Invoices */
                  <div className="space-y-2.5">
                    {qboInvoices.length === 0 ? (
                      <p className="py-4 text-center text-xs text-slate-400">No invoices found in QuickBooks.</p>
                    ) : (
                      qboInvoices.slice(0, 5).map((inv) => {
                        const isOverdue = inv.daysText === "Overdue";
                        const isPaid = inv.status === "Paid";
                        const targetHref = isPaid
                          ? `/receipt/${inv.id}?tx=TX-AP-QBO-${inv.id}&mode=logged_in&returnTo=dashboard`
                          : `/dashboard/pay-flow/${inv.id}`;

                        return (
                          <Link
                            key={inv.id}
                            href={targetHref}
                            className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 transition-colors hover:border-slate-300 hover:bg-slate-50/80 cursor-pointer shadow-2xs"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-200/60 p-1">
                              <img src="/quickbook.png" alt="QuickBooks" className="h-full w-full object-contain" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-900">{inv.name}</p>
                              <p className="truncate text-xs text-slate-500">{inv.detail}</p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  "inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-semibold",
                                  isPaid
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : isOverdue
                                      ? "border-rose-200 bg-rose-50 text-rose-700"
                                      : "border-amber-200 bg-amber-50 text-amber-700"
                                )}
                              >
                                {inv.status}
                              </span>

                              <span
                                className={cn(
                                  "hidden text-xs sm:inline-block w-28 text-left font-medium",
                                  isOverdue ? "text-rose-600" : isPaid ? "text-emerald-600" : "text-slate-500"
                                )}
                              >
                                {inv.daysText}
                              </span>

                              <div className="hidden text-right text-xs text-slate-400 md:block">{inv.date}</div>

                              <div className="min-w-[72px] text-right text-sm font-bold text-slate-900">
                                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(inv.amount)}
                              </div>

                              <div className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700">
                                <EllipsisVertical className="h-4 w-4" />
                              </div>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </Panel>

            {workspaceType === "agency" && (
              <ModelPayoutsList invoices={widgetInvoices} />
            )}

            {/* Recent Vendors Panel */}
            <Panel className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recent Vendors</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Vendor contacts and accounts synced from QuickBooks.</p>
                </div>
                {qboConnected && (
                  <Link
                    href="/dashboard/vendors"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                  >
                    View All
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              <div className="mt-5">
                {qboLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                ) : !qboConnected ? (
                  /* Disconnected Empty Vendors State */
                  <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-8 text-center">
                    <h3 className="text-sm font-semibold text-slate-900">No vendors synced</h3>
                    <p className="mt-1.5 max-w-[320px] text-xs leading-relaxed text-slate-500">
                      Connect QuickBooks to sync vendor contacts, track outstanding balances, and configure payout rules.
                    </p>
                    <Link
                      href="/dashboard/settings/integrations/quickbooks"
                      className="mt-4 inline-flex h-8 items-center rounded-lg bg-slate-900 px-3.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
                    >
                      Import Vendors
                    </Link>
                  </div>
                ) : (
                  /* Connected Vendors list (Table structure) */
                  <div className="overflow-x-auto">
                    {qboVendors.length === 0 ? (
                      <p className="py-4 text-center text-xs text-slate-400">No vendors found in QuickBooks.</p>
                    ) : (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                            <th className="py-2.5 pr-3">Vendor / Company</th>
                            <th className="py-2.5 px-3">Contact</th>
                            <th className="py-2.5 px-3 hidden sm:table-cell">Account #</th>
                            <th className="py-2.5 px-3 text-right">Owed Balance</th>
                            <th className="py-2.5 pl-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {qboVendors.slice(0, 5).map((v) => (
                            <tr
                              key={v.id}
                              className="hover:bg-slate-50/70 transition-colors"
                            >
                              <td className="py-3 pr-3 flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-800 font-bold">
                                  <span className="text-[11px] font-black">{v.fallback}</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 truncate">{v.name}</p>
                                  {v.company && <p className="text-[11px] text-slate-400 truncate">{v.company}</p>}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-slate-600 max-w-[150px] truncate">
                                <p>{v.email}</p>
                                {v.phone && v.phone !== "No Phone" && <p className="text-[11px] text-slate-400">{v.phone}</p>}
                              </td>
                              <td className="py-3 px-3 text-slate-500 hidden sm:table-cell font-mono">{v.acctNum}</td>
                              <td className="py-3 px-3 text-right font-bold text-slate-900">{v.balance}</td>
                              <td className="py-3 pl-3 text-right">
                                <span className={cn(
                                  "inline-flex h-6 items-center rounded-full border px-2.5 text-[10px] font-bold",
                                  v.active
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-slate-200 bg-slate-100 text-slate-600"
                                )}>
                                  {v.active ? "Active" : "Inactive"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </Panel>

            {/* 3. Sync Table when connected */}
            {qboConnected && (
              <QuickBooksInvoicesList />
            )}

            {/* Card Program and Treasury Cards side-by-side */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* 7. Card Program Panel */}
              <Panel className="flex min-h-[190px] flex-col justify-between p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Card program</p>
                    <h3 className="mt-1 text-xl font-bold text-slate-900">AgncyPay Card</h3>
                  </div>
                  <span className={cn(
                    "inline-flex h-6 items-center rounded-full border px-2.5 text-[10px] font-bold",
                    qboConnected ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600"
                  )}>
                    {qboConnected ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    ["Available", `$${liveAvailable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                    ["Pending", "$3,200.00"],
                    ["Cards", "4"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3">
                      <p className="text-[11px] font-semibold text-slate-400">{label}</p>
                      <p className="mt-1 truncate text-sm font-bold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Virtual and physical cards for approved workspace spend.
                  </p>
                  <Link
                    href="/dashboard/wallet"
                    className="inline-flex h-8 shrink-0 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                  >
                    Manage
                  </Link>
                </div>
              </Panel>

              {/* 8. Treasury/AgncyPay Cards Right Section */}
              <Panel className="flex flex-col justify-between p-5">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["Limit", "$10,000.00"],
                    ["Spent", `$${liveSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                    ["Review", "3"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3">
                      <p className="text-[11px] font-semibold text-slate-400">{label}</p>
                      <p className="mt-1 truncate text-sm font-bold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-row gap-4 mt-4 items-center">
                  <div className="relative w-[110px] h-[130px] shrink-0 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                    <img
                      src="/mobilelook.jpeg"
                      alt="AgncyPay Mobile View"
                      className="absolute inset-0 h-full w-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      Online &amp; in Stores,<br />
                      Use AgncyPay Cards
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">Instant split disbursement straight to your mobile card.</p>
                  </div>
                </div>
              </Panel>
            </div>
          </div>

          <div className="space-y-6">
            {/* 1. Send / Request Analytics */}
            <Panel className="p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  const baseClassName =
                    "flex flex-col items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-center transition-all hover:bg-white hover:border-slate-300 hover:shadow-xs group cursor-pointer";

                  if (action.label === "Wallet ID contacts") {
                    return (
                      <button
                        key={action.label}
                        type="button"
                        onClick={() => setIsWalletContactsOpen(true)}
                        className={baseClassName}
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 group-hover:scale-105 shadow-2xs transition-transform">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="text-[11px] font-semibold text-slate-700 group-hover:text-slate-900 leading-tight">{action.label}</span>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className={baseClassName}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 group-hover:scale-105 shadow-2xs transition-transform">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-[11px] font-semibold text-slate-700 group-hover:text-slate-900 leading-tight">{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </Panel>

            {["individual", "talent_independent", "talent_agency"].includes(workspaceType) && (
              <ModelIncomeList invoices={widgetInvoices} />
            )}

            <CreativeBankingPanel
              liquidity={liquidityBalance}
              crystallised={crystallisedBalance}
              pending={pendingBalance}
              onWithdraw={() => setIsWithdrawOpen(true)}
              onNet0={() => setIsNet0Open(true)}
            />

            {/* 6. Banks and Cards */}
            <Panel className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Banks and Cards</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Linked accounts for deposits and ACH settlements.</p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {linkedCards.length > 0 ? (
                  linkedCards.map((card, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 hover:bg-white hover:border-slate-300 transition-colors shadow-2xs"
                    >
                      <BankCardFace card={card} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{card.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{card.detail}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center py-4 text-center">
                    <p className="text-xs text-slate-400">No bank accounts or cards linked.</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  resetLinkModal();
                  setIsLinkModalOpen(true);
                }}
                className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
              >
                Link a card or bank
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </Panel>

            {/* 7. Plaid Connection */}
            <Panel className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Plaid Secure Rail</p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">
                    {plaidConnected ? plaidInstitutionName : "Connect Bank"}
                  </h2>
                  <p className="mt-1 max-w-[280px] text-xs leading-relaxed text-slate-500">
                    {plaidConnected
                      ? "Your bank account is securely linked for automated royalty distributions."
                      : "Link your payout method to receive automated royalty distributions."}
                  </p>
                </div>
                <span className={cn(
                  "inline-flex h-9 shrink-0 items-center rounded-lg border bg-white px-3 shadow-2xs",
                  plaidConnected ? "border-emerald-200" : "border-slate-200"
                )}>
                  <img
                    src="/plaid-logo.svg"
                    alt="Plaid"
                    className="h-5 w-[76px] object-contain"
                    loading="lazy"
                  />
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
                {plaidConnected ? (
                  <button
                    type="button"
                    onClick={handlePlaidDisconnect}
                    disabled={plaidDisconnecting}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition-colors"
                  >
                    {plaidDisconnecting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <Unplug className="h-3.5 w-3.5" />
                        Disconnect Bank
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      resetLinkModal();
                      setLinkModalStep("plaid_intro");
                      setIsLinkModalOpen(true);
                    }}
                    className="inline-flex h-8 items-center rounded-lg bg-slate-900 px-3.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
                  >
                    Set Up Payouts
                  </button>
                )}
                <span className="text-[11px] text-slate-400 font-medium">
                  {plaidConnected ? "Active connection" : "Bank-grade encryption"}
                </span>
              </div>
            </Panel>
          </div>
        </div>
      </div>
      {isWalletContactsOpen && (
        <WalletContactsOverlay
          query={walletContactQuery}
          autosplitContactIds={autosplitContactIds}
          onQueryChange={setWalletContactQuery}
          onClose={() => setIsWalletContactsOpen(false)}
          onToggleContact={toggleAutosplitContact}
          onEnableAll={enableAllContactAutosplit}
        />
      )}
      {isAutosplitNoticeOpen && <AutoSplitNotice onClose={() => setIsAutosplitNoticeOpen(false)} />}
      
      {/* Net-0 Early Payout Modal */}
      {isNet0Open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-xs">
          <div className="w-full max-w-[460px] rounded-2xl border border-slate-200/90 bg-white p-6 text-slate-900 shadow-2xl relative overflow-hidden">
            
            {net0Stage === "idle" && (
              <>
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
                      Net-0 Early Payout
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Advance secured campaign earnings instantly.</p>
                  </div>
                  <button type="button" onClick={() => setIsNet0Open(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  {/* Campaign List */}
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Locked Campaign Invoice</span>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Adidas Originals Summer Campaign</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Payout due date: July 20, 2026</p>
                      </div>
                      <span className="text-sm font-bold text-slate-900">$38,275.80</span>
                    </div>
                  </div>

                  {/* Calculations */}
                  <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Crystallised Value</span>
                      <span className="text-slate-900 font-semibold">$38,275.80</span>
                    </div>
                    <div className="flex justify-between text-rose-600">
                      <span>Early Routing Fee (1.5%)</span>
                      <span className="font-semibold">-$574.14</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2.5 text-sm font-bold">
                      <span className="text-slate-900">Net Advanced Credit</span>
                      <span className="text-emerald-600 font-black">$37,701.66</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-6">
                  <button
                    type="button"
                    onClick={handleProcessNet0}
                    className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    Confirm &amp; Deposit Instantly
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNet0Open(false)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold transition-all hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {net0Stage !== "idle" && net0Stage !== "success" && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <RefreshCw className="h-8 w-8 text-slate-900 animate-spin mb-4" />
                <h3 className="text-base font-bold text-slate-900">Processing Net-0 Advance</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-[280px]">
                  {net0Stage === "verifying" && "Verifying campaign contract clearance..."}
                  {net0Stage === "advancing" && "Advancing funds from Net-0 treasury pool..."}
                  {net0Stage === "crediting" && "Crediting active liquidity balance..."}
                </p>
              </div>
            )}

            {net0Stage === "success" && (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4 border border-emerald-200">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Advance Complete!</h3>
                <p className="text-xs text-emerald-700 mt-2 max-w-[260px] font-semibold">
                  $37,701.66 has been credited to your Liquidity Balance.
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-3 font-mono">
                  TX-ADV-AP{Date.now().toString().slice(-6)}
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Withdraw Funds Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-xs">
          <div className="w-full max-w-[440px] rounded-2xl border border-slate-200/90 bg-white p-6 text-slate-900 shadow-2xl relative overflow-hidden">
            
            {withdrawStage === "idle" && (
              <form onSubmit={handleProcessWithdrawal}>
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Wallet className="h-4.5 w-4.5 text-slate-800" />
                      Withdraw Funds
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Transfer cleared liquidity to your bank.</p>
                  </div>
                  <button type="button" onClick={() => setIsWithdrawOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Select Card */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Select Destination Card</label>
                    <div className="grid grid-cols-1 gap-2">
                      {bankCards.slice(0, 2).map((card, idx) => (
                        <button
                          key={card.name}
                          type="button"
                          onClick={() => setSelectedWithdrawCard(idx)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer",
                            selectedWithdrawCard === idx
                              ? "border-slate-900 bg-slate-50 shadow-2xs"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          )}
                        >
                          <div className="h-8 w-14 shrink-0 rounded-md bg-slate-100 overflow-hidden border border-slate-200">
                            <img src={card.cardImage} alt={card.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{card.name}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">{card.detail}</p>
                          </div>
                          {selectedWithdrawCard === idx && (
                            <div className="h-4 w-4 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0">
                              <Check className="h-2.5 w-2.5" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Amount */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="withdrawAmount" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount to Withdraw</label>
                      <button
                        type="button"
                        onClick={() => {
                          setWithdrawAmount(liquidityBalance.toString());
                          setWithdrawError("");
                        }}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                      >
                        Use Max (${liquidityBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
                      <input
                        id="withdrawAmount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={liquidityBalance}
                        value={withdrawAmount}
                        onChange={(e) => {
                          setWithdrawAmount(e.target.value);
                          if (withdrawError) setWithdrawError("");
                        }}
                        className={cn(
                          "w-full h-11 bg-white border rounded-xl pl-8 pr-4 text-sm text-slate-900 focus:outline-none transition-colors focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5",
                          withdrawError ? "border-rose-400 focus:border-rose-500" : "border-slate-300"
                        )}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    {withdrawError && (
                      <span className="text-xs text-rose-600 font-semibold mt-0.5">{withdrawError}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-6">
                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    Withdraw Funds
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsWithdrawOpen(false)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold transition-all hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {withdrawStage === "submitting" && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <RefreshCw className="h-8 w-8 text-slate-900 animate-spin mb-4" />
                <h3 className="text-base font-bold text-slate-900">Initiating Bank Transfer</h3>
                <p className="text-xs text-slate-500 mt-2">Routing instant ACH payment splits...</p>
              </div>
            )}

            {withdrawStage === "success" && (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4 border border-emerald-200">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Transfer Successful!</h3>
                <p className="text-xs text-emerald-700 mt-2 max-w-[260px] font-semibold">
                  ${parseFloat(withdrawAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} has been sent to your {bankCards[selectedWithdrawCard].fallback} account.
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-3 font-mono">
                  TX-WIT-AP{Date.now().toString().slice(-6)}
                </p>
              </div>
            )}

          </div>
        </div>
      )}
      <DashboardFooter />
    </main>
  );
}
