"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  DollarSign,
  LineChart as LineChartIcon,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "../../../lib/utils";
import { downloadTableReportPdf } from "../../../lib/pdfExport";

type TimeRange = "1W" | "1M" | "1Y" | "ALL";
type Scenario = "baseline" | "music_spike" | "agency_push";

type CashPoint = {
  label: string;
  income: number;
  payouts: number;
  pending: number;
};

type SourcePoint = {
  name: string;
  value: number;
};

type EarnerPoint = {
  name: string;
  amount: number;
  segment: string;
};

type RangeDataset = {
  label: string;
  comparisonLabel: string;
  cashFlow: CashPoint[];
  sources: SourcePoint[];
  earners: EarnerPoint[];
  activeContacts: number;
  pendingReview: number;
  paymentDelayDays: number;
  autosplitAdoption: number;
  successRate: number;
  failedPayments: number;
};

const ranges: TimeRange[] = ["1W", "1M", "1Y", "ALL"];
const scenarios: { id: Scenario; label: string; description: string }[] = [
  {
    id: "baseline",
    label: "Universal",
    description: "Balanced agency, music, and talent revenue.",
  },
  {
    id: "music_spike",
    label: "Music Spike",
    description: "Streaming platforms outperform during release week.",
  },
  {
    id: "agency_push",
    label: "Agency Push",
    description: "Brand and model-agency invoice volume leads.",
  },
];

const rangeData: Record<TimeRange, RangeDataset> = {
  "1W": {
    label: "Last 7 days",
    comparisonLabel: "vs previous week",
    activeContacts: 118,
    pendingReview: 18500,
    paymentDelayDays: 2.1,
    autosplitAdoption: 74,
    successRate: 99.6,
    failedPayments: 2,
    cashFlow: [
      { label: "Mon", income: 24500, payouts: 18200, pending: 4200 },
      { label: "Tue", income: 31800, payouts: 20400, pending: 3600 },
      { label: "Wed", income: 28600, payouts: 19200, pending: 5100 },
      { label: "Thu", income: 42100, payouts: 27600, pending: 4400 },
      { label: "Fri", income: 55700, payouts: 35100, pending: 2900 },
      { label: "Sat", income: 21900, payouts: 14800, pending: 2100 },
      { label: "Sun", income: 34200, payouts: 23600, pending: 2200 },
    ],
    sources: [
      { name: "Brand Invoices", value: 68500 },
      { name: "Spotify", value: 48100 },
      { name: "TikTok", value: 36500 },
      { name: "Apple Music", value: 33100 },
      { name: "Model Agency", value: 52600 },
    ],
    earners: [
      { name: "John Adams", amount: 18400, segment: "Model" },
      { name: "Amy Holland", amount: 16250, segment: "Creator" },
      { name: "Lucy Che", amount: 13900, segment: "Talent" },
      { name: "M Models", amount: 12800, segment: "Agency" },
      { name: "Lola Durant", amount: 9800, segment: "Model" },
    ],
  },
  "1M": {
    label: "Last 30 days",
    comparisonLabel: "vs previous month",
    activeContacts: 327,
    pendingReview: 42500,
    paymentDelayDays: 3.4,
    autosplitAdoption: 71,
    successRate: 99.7,
    failedPayments: 5,
    cashFlow: [
      { label: "W1", income: 188000, payouts: 126000, pending: 32000 },
      { label: "W2", income: 226000, payouts: 151000, pending: 27500 },
      { label: "W3", income: 201000, payouts: 142000, pending: 42100 },
      { label: "W4", income: 276000, payouts: 184000, pending: 36800 },
    ],
    sources: [
      { name: "Brand Invoices", value: 248000 },
      { name: "Spotify", value: 172000 },
      { name: "TikTok", value: 126000 },
      { name: "Apple Music", value: 118000 },
      { name: "Model Agency", value: 227000 },
    ],
    earners: [
      { name: "John Adams", amount: 70500, segment: "Model" },
      { name: "Amy Holland", amount: 61200, segment: "Creator" },
      { name: "Lucy Che", amount: 54800, segment: "Talent" },
      { name: "M Models", amount: 47200, segment: "Agency" },
      { name: "Jessica Bailey", amount: 36100, segment: "Model" },
    ],
  },
  "1Y": {
    label: "This year",
    comparisonLabel: "vs last year",
    activeContacts: 842,
    pendingReview: 95500,
    paymentDelayDays: 4.2,
    autosplitAdoption: 68,
    successRate: 99.8,
    failedPayments: 18,
    cashFlow: [
      { label: "Jan", income: 214000, payouts: 150000, pending: 28000 },
      { label: "Feb", income: 286000, payouts: 180000, pending: 31000 },
      { label: "Mar", income: 181000, payouts: 140000, pending: 22000 },
      { label: "Apr", income: 314000, payouts: 200000, pending: 36500 },
      { label: "May", income: 242000, payouts: 160000, pending: 31800 },
      { label: "Jun", income: 269000, payouts: 190000, pending: 34600 },
      { label: "Jul", income: 337000, payouts: 220000, pending: 39200 },
      { label: "Aug", income: 218000, payouts: 150000, pending: 25500 },
      { label: "Sep", income: 298000, payouts: 210000, pending: 40100 },
      { label: "Oct", income: 361000, payouts: 250000, pending: 43400 },
      { label: "Nov", income: 251000, payouts: 180000, pending: 30200 },
      { label: "Dec", income: 407000, payouts: 280000, pending: 48800 },
    ],
    sources: [
      { name: "Brand Invoices", value: 1045000 },
      { name: "Spotify", value: 756000 },
      { name: "TikTok", value: 612000 },
      { name: "Apple Music", value: 545000 },
      { name: "Model Agency", value: 420000 },
    ],
    earners: [
      { name: "John Adams", amount: 125000, segment: "Model" },
      { name: "Amy Holland", amount: 98000, segment: "Creator" },
      { name: "Lucy Che", amount: 84000, segment: "Talent" },
      { name: "Jessica Bailey", amount: 62000, segment: "Model" },
      { name: "Lola Durant", amount: 41000, segment: "Model" },
    ],
  },
  ALL: {
    label: "All time",
    comparisonLabel: "lifetime trend",
    activeContacts: 2198,
    pendingReview: 148000,
    paymentDelayDays: 5.8,
    autosplitAdoption: 61,
    successRate: 99.4,
    failedPayments: 61,
    cashFlow: [
      { label: "2022", income: 1280000, payouts: 910000, pending: 125000 },
      { label: "2023", income: 2430000, payouts: 1680000, pending: 142000 },
      { label: "2024", income: 3180000, payouts: 2240000, pending: 158000 },
      { label: "2025", income: 3890000, payouts: 2790000, pending: 151000 },
      { label: "2026", income: 3378000, payouts: 2310000, pending: 148000 },
    ],
    sources: [
      { name: "Brand Invoices", value: 3850000 },
      { name: "Spotify", value: 2920000 },
      { name: "TikTok", value: 2210000 },
      { name: "Apple Music", value: 1840000 },
      { name: "Model Agency", value: 3338000 },
    ],
    earners: [
      { name: "M Models", amount: 482000, segment: "Agency" },
      { name: "John Adams", amount: 356000, segment: "Model" },
      { name: "Amy Holland", amount: 288000, segment: "Creator" },
      { name: "Lucy Che", amount: 241000, segment: "Talent" },
      { name: "Lola Durant", amount: 203000, segment: "Model" },
    ],
  },
};

const sourceColors = ["#f8fafc", "#9ca3af", "#737373", "#525252", "#2f2f2f"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function scenarioMultiplier(scenario: Scenario, sourceName?: string) {
  if (scenario === "music_spike") {
    if (["Spotify", "TikTok", "Apple Music"].includes(sourceName || "")) return 1.32;
    if (sourceName === "Brand Invoices") return 0.92;
    return 1.04;
  }

  if (scenario === "agency_push") {
    if (["Brand Invoices", "Model Agency"].includes(sourceName || "")) return 1.24;
    if (["Spotify", "Apple Music"].includes(sourceName || "")) return 0.9;
    return 1;
  }

  return 1;
}

function applyScenario(dataset: RangeDataset, scenario: Scenario): RangeDataset {
  const incomeMultiplier =
    scenario === "music_spike" ? 1.15 : scenario === "agency_push" ? 1.11 : 1;
  const payoutMultiplier =
    scenario === "music_spike" ? 1.09 : scenario === "agency_push" ? 1.07 : 1;

  return {
    ...dataset,
    activeContacts:
      scenario === "baseline"
        ? dataset.activeContacts
        : Math.round(dataset.activeContacts * (scenario === "music_spike" ? 1.08 : 1.05)),
    pendingReview:
      scenario === "baseline"
        ? dataset.pendingReview
        : Math.round(dataset.pendingReview * (scenario === "agency_push" ? 1.18 : 0.94)),
    paymentDelayDays:
      scenario === "baseline"
        ? dataset.paymentDelayDays
        : Number((dataset.paymentDelayDays * (scenario === "agency_push" ? 0.92 : 0.86)).toFixed(1)),
    autosplitAdoption:
      scenario === "baseline"
        ? dataset.autosplitAdoption
        : Math.min(91, dataset.autosplitAdoption + (scenario === "music_spike" ? 8 : 5)),
    successRate:
      scenario === "baseline"
        ? dataset.successRate
        : Number(Math.min(99.95, dataset.successRate + 0.1).toFixed(2)),
    failedPayments:
      scenario === "baseline"
        ? dataset.failedPayments
        : Math.max(1, Math.round(dataset.failedPayments * 0.82)),
    cashFlow: dataset.cashFlow.map((point, index) => ({
      ...point,
      income: Math.round(point.income * incomeMultiplier * (1 + index * 0.006)),
      payouts: Math.round(point.payouts * payoutMultiplier * (1 + index * 0.004)),
      pending: Math.round(point.pending * (scenario === "agency_push" ? 1.12 : 0.94)),
    })),
    sources: dataset.sources.map((source) => ({
      ...source,
      value: Math.round(source.value * scenarioMultiplier(scenario, source.name)),
    })),
    earners: dataset.earners.map((earner, index) => ({
      ...earner,
      amount: Math.round(
        earner.amount *
          (scenario === "baseline" ? 1 : scenario === "music_spike" && earner.segment !== "Agency" ? 1.18 : 1.09) *
          (1 + index * 0.01)
      ),
    })),
  };
}

function totalFor(points: CashPoint[], key: "income" | "payouts" | "pending") {
  return points.reduce((total, point) => total + point[key], 0);
}

function TrendValue({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const isPositive = value >= 0;

  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border",
          isPositive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
        )}
      >
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {isPositive ? "+" : ""}
        {value.toFixed(1)}%
      </span>
      <span className="text-xs font-medium text-slate-500">{label}</span>
    </div>
  );
}

function MetricCard({
  title,
  value,
  trend,
  trendLabel,
  icon: Icon,
}: {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  icon: LucideIcon;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-black text-slate-900 tracking-tight leading-none">{value}</p>
      <TrendValue value={trend} label={trendLabel} />
    </section>
  );
}

function InsightRow({
  icon: Icon,
  title,
  detail,
  tone = "neutral",
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  tone?: "neutral" | "good" | "warning";
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 transition-colors">
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
          tone === "good" && "border-emerald-200 bg-emerald-50 text-emerald-700",
          tone === "warning" && "border-amber-200 bg-amber-50 text-amber-700",
          tone === "neutral" && "border-slate-200 bg-white text-slate-600 shadow-xs"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500 font-medium">{detail}</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("1Y");
  const [scenario, setScenario] = useState<Scenario>("baseline");

  const selectedData = useMemo(
    () => applyScenario(rangeData[timeRange], scenario),
    [scenario, timeRange]
  );

  const totals = useMemo(() => {
    const income = totalFor(selectedData.cashFlow, "income");
    const payouts = totalFor(selectedData.cashFlow, "payouts");
    const pending = totalFor(selectedData.cashFlow, "pending");
    const firstHalf = selectedData.cashFlow.slice(0, Math.max(1, Math.floor(selectedData.cashFlow.length / 2)));
    const secondHalf = selectedData.cashFlow.slice(Math.max(1, Math.floor(selectedData.cashFlow.length / 2)));
    const previousIncome = Math.max(1, totalFor(firstHalf, "income"));
    const currentIncome = totalFor(secondHalf.length > 0 ? secondHalf : selectedData.cashFlow, "income");
    const previousPayouts = Math.max(1, totalFor(firstHalf, "payouts"));
    const currentPayouts = totalFor(secondHalf.length > 0 ? secondHalf : selectedData.cashFlow, "payouts");

    return {
      income,
      payouts,
      pending,
      net: income - payouts,
      incomeTrend: percentChange(currentIncome, previousIncome),
      payoutTrend: percentChange(currentPayouts, previousPayouts),
      pendingTrend: scenario === "agency_push" ? 9.4 : -5.4,
      contactTrend: scenario === "baseline" ? 3.8 : scenario === "music_spike" ? 9.2 : 6.1,
    };
  }, [scenario, selectedData]);

  const topSource = selectedData.sources.reduce((best, source) =>
    source.value > best.value ? source : best
  );
  const payoutRatio = totals.income > 0 ? (totals.payouts / totals.income) * 100 : 0;
  const reserveRatio = totals.income > 0 ? (totals.net / totals.income) * 100 : 0;

  const exportAnalytics = () => {
    downloadTableReportPdf({
      title: `AgncyPay Analytics - ${selectedData.label}`,
      subtitle: `${scenarios.find((item) => item.id === scenario)?.label || "Universal"} demo view`,
      filename: `agncypay-analytics-${timeRange.toLowerCase()}.pdf`,
      summary: [
        { label: "Income", value: formatCurrency(totals.income) },
        { label: "Payouts", value: formatCurrency(totals.payouts) },
        { label: "Net Retained", value: formatCurrency(totals.net) },
        { label: "Success Rate", value: `${selectedData.successRate}%` },
      ],
      columns: ["Period", "Income", "Payouts", "Pending Review"],
      rows: selectedData.cashFlow.map((point) => [
        point.label,
        formatCurrency(point.income),
        formatCurrency(point.payouts),
        formatCurrency(point.pending),
      ]),
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="mb-3 inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Range-aware revenue, payout, and reconciliation insights for brand invoices,
            model agencies, creators, and music platforms.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1">
            {ranges.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                  timeRange === range ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={exportAnalytics}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-300 shadow-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Export
          </button>
        </div>
      </div>

      {/* Scenario Lens Selector */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">{selectedData.label} Perspective</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Select an operational lens to examine how metrics shift across creative verticals.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {scenarios.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setScenario(item.id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all cursor-pointer",
                  scenario === item.id
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                )}
              >
                <span className="block text-xs font-bold">{item.label}</span>
                <span className={cn("mt-0.5 block text-[11px] leading-relaxed", scenario === item.id ? "text-slate-300" : "text-slate-500")}>
                  {item.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Income"
          value={formatCurrency(totals.income)}
          trend={totals.incomeTrend}
          trendLabel={selectedData.comparisonLabel}
          icon={DollarSign}
        />
        <MetricCard
          title="Total Payouts"
          value={formatCurrency(totals.payouts)}
          trend={totals.payoutTrend}
          trendLabel={selectedData.comparisonLabel}
          icon={WalletCards}
        />
        <MetricCard
          title="Active Contacts"
          value={selectedData.activeContacts.toLocaleString()}
          trend={totals.contactTrend}
          trendLabel="new verified contacts"
          icon={Users}
        />
        <MetricCard
          title="Pending Review"
          value={formatCurrency(selectedData.pendingReview)}
          trend={totals.pendingTrend}
          trendLabel="approval queue movement"
          icon={Clock3}
        />
      </div>

      {/* Cash Flow and Revenue Mix Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Cash Flow Dynamics</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Inflows, scheduled distributions, and pending approvals over the active cycle.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Net retained</p>
              <p className="mt-0.5 text-lg font-black text-slate-900">{formatCurrency(totals.net)}</p>
            </div>
          </div>

          <div className="mt-6 min-h-[340px] w-full">
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={selectedData.cashFlow} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="analyticsPayouts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="analyticsPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => `$${formatCompact(value)}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", color: "#0f172a", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  itemStyle={{ color: "#0f172a", fontWeight: 600, fontSize: "12px" }}
                  formatter={(value: unknown) => formatCurrency(Number(value))}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "16px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#0f172a" strokeWidth={2.5} fillOpacity={1} fill="url(#analyticsIncome)" />
                <Area type="monotone" dataKey="payouts" name="Payouts" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#analyticsPayouts)" />
                <Area type="monotone" dataKey="pending" name="Pending Review" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#analyticsPending)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Revenue Mix</h2>
            <p className="mt-0.5 text-xs text-slate-500">Distribution by platform & counterparty source.</p>
            <div className="mt-4 min-h-[260px]">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={selectedData.sources}
                    cx="50%"
                    cy="50%"
                    innerRadius={64}
                    outerRadius={96}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {selectedData.sources.map((entry, index) => (
                      <Cell key={entry.name} fill={sourceColors[index % sourceColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", color: "#0f172a", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    formatter={(value: unknown) => formatCurrency(Number(value))}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={40}
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-semibold text-slate-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 mt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Primary Channel</p>
            <p className="mt-1 text-sm font-black text-slate-900">
              {topSource.name} · {formatCurrency(topSource.value)}
            </p>
          </div>
        </section>
      </div>

      {/* Top Earners and Operating Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900">Top Earners & Talent</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Highest gross settlement recipients for {selectedData.label.toLowerCase()}.
          </p>
          <div className="mt-6 min-h-[280px] w-full">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={selectedData.earners} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal vertical={false} />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(value: number) => `$${formatCompact(value)}`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={110}
                  stroke="#94a3b8"
                  tick={{ fill: "#334155", fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", color: "#0f172a", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  formatter={(value: unknown) => formatCurrency(Number(value))}
                />
                <Bar dataKey="amount" name="Earnings" fill="#0f172a" radius={[0, 6, 6, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900">Operating Health Signals</h2>
          <p className="mt-0.5 text-xs text-slate-500">Settlement velocity and automated reconciliation ratios.</p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Payout Ratio</p>
              <p className="mt-1 text-xl font-black text-slate-900">{payoutRatio.toFixed(1)}%</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Reserve Ratio</p>
              <p className="mt-1 text-xl font-black text-slate-900">{reserveRatio.toFixed(1)}%</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg Clearing</p>
              <p className="mt-1 text-xl font-black text-slate-900">{selectedData.paymentDelayDays}d</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Autosplit Rate</p>
              <p className="mt-1 text-xl font-black text-emerald-600">{selectedData.autosplitAdoption}%</p>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            <InsightRow
              icon={CheckCircle2}
              tone="good"
              title={`${selectedData.successRate}% settlement success rate`}
              detail={`${selectedData.failedPayments} authorization retries in this cycle.`}
            />
            <InsightRow
              icon={LineChartIcon}
              title={`${topSource.name} is leading revenue`}
              detail={`${formatCurrency(topSource.value)} captured from highest performing channel.`}
            />
            <InsightRow
              icon={AlertCircle}
              tone={selectedData.pendingReview > 90000 ? "warning" : "neutral"}
              title="Approval queue movement"
              detail={`${formatCurrency(selectedData.pendingReview)} pending clearance via Batch Pay.`}
            />
          </div>
        </section>
      </div>

      {/* Payment Recommendations */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Optimization Playbook</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Automated suggestions based on recent volume and counterparty trends.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-600">
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            Live rule optimization active
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:bg-slate-50">
            <div className="flex items-center gap-2 text-slate-900">
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-bold">Use Pay All for approvals</p>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500 font-medium">
              Clear {formatCurrency(selectedData.pendingReview)} from pending review when campaign deliverables are signed off.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:bg-slate-50">
            <div className="flex items-center gap-2 text-slate-900">
              <WalletCards className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-bold">Batch recurring payouts</p>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500 font-medium">
              Group high-volume {scenario === "music_spike" ? "streaming payouts" : "invoice payouts"} to reduce audit overhead.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:bg-slate-50">
            <div className="flex items-center gap-2 text-slate-900">
              <Users className="h-4 w-4 text-purple-600" />
              <p className="text-xs font-bold">Expand split adoption</p>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500 font-medium">
              Autosplit is at {selectedData.autosplitAdoption}%. Prioritize top earners to make automated deductions standard.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
