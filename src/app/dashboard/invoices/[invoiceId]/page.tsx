"use client";

import React, { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Lock,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "../../../../lib/utils";
import { useApp } from "../../../../context/AppContext";
import {
  WorkspaceType,
  getDefaultPermissions,
  getDefaultWorkspaceRole,
  normalizeWorkspaceType,
} from "../../../../types/workspace";

interface PageProps {
  params: Promise<{ invoiceId: string }>;
}

type InvoiceDetail = {
  id: string;
  agency: string;
  email: string;
  campaign: string;
  amount: number;
  fee: number;
  status: string;
  due: string;
  created: string;
  lineItems: {
    description: string;
    quantity: number;
    rate: number;
  }[];
};

type PaymentStage = "review" | "processing" | "success";
type PaymentFlow = {
  stage: PaymentStage;
  fundingMethod: "ach" | "card";
  activeStep: number;
  transactionId: string;
};

type ChangeFlow = {
  reason: string;
  submitted: boolean;
};
type SourceCopyValue = {
  label: string;
  detail: string;
  actionLabel: string;
  primaryLabel: string;
  secondaryLabel: string;
  amountLabel: string;
  feeLabel: string;
  permissionView: string;
};

const invoices: InvoiceDetail[] = [
  {
    id: "INV-2845",
    agency: "Creative Co",
    email: "billing@creativeco.com",
    campaign: "Q2 Brand Campaign",
    amount: 24500,
    fee: 245,
    status: "Pending",
    due: "22/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Creative Strategy & Concept Development", quantity: 1, rate: 8000 },
      { description: "Brand Asset Creation (10 assets)", quantity: 10, rate: 800 },
      { description: "Performance Analytics & Reporting", quantity: 1, rate: 1500 },
      { description: "Campaign Management (2 months)", quantity: 2, rate: 3500 },
    ],
  },
  {
    id: "INV-2844",
    agency: "Media Partners",
    email: "billing@mediapartners.com",
    campaign: "Digital Ads May",
    amount: 18200,
    fee: 182,
    status: "Approved",
    due: "21/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Media Buying Strategy", quantity: 1, rate: 5200 },
      { description: "Paid Search Placement", quantity: 2, rate: 3500 },
      { description: "Audience Testing & Optimization", quantity: 4, rate: 900 },
      { description: "Monthly Reporting", quantity: 1, rate: 2400 },
    ],
  },
  {
    id: "INV-2843",
    agency: "Digital Agency",
    email: "billing@digitalagency.com",
    campaign: "Social Media Management",
    amount: 32100,
    fee: 321,
    status: "Processing",
    due: "20/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Social Content Calendar", quantity: 1, rate: 6500 },
      { description: "Community Management", quantity: 3, rate: 4200 },
      { description: "Influencer Coordination", quantity: 5, rate: 1800 },
      { description: "Performance Reporting", quantity: 2, rate: 2000 },
    ],
  },
  {
    id: "INV-2842",
    agency: "Brand Studio",
    email: "billing@brandstudio.com",
    campaign: "Creative Services",
    amount: 15800,
    fee: 158,
    status: "Paid",
    due: "19/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Creative Direction", quantity: 1, rate: 4800 },
      { description: "Design System Updates", quantity: 4, rate: 1600 },
      { description: "Presentation Assets", quantity: 2, rate: 2300 },
    ],
  },
  {
    id: "INV-2841",
    agency: "Marketing Pro",
    email: "billing@marketingpro.com",
    campaign: "Email Campaign",
    amount: 8900,
    fee: 89,
    status: "Paid",
    due: "18/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Email Strategy", quantity: 1, rate: 2500 },
      { description: "Template Design", quantity: 3, rate: 900 },
      { description: "Automation Setup", quantity: 1, rate: 3700 },
    ],
  },
  {
    id: "INV-2840",
    agency: "Creative Co",
    email: "billing@creativeco.com",
    campaign: "Video Production",
    amount: 45000,
    fee: 450,
    status: "Pending",
    due: "17/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Production Planning", quantity: 1, rate: 9000 },
      { description: "Shoot Day Crew", quantity: 3, rate: 6500 },
      { description: "Post Production", quantity: 2, rate: 7000 },
      { description: "Final Mastering", quantity: 1, rate: 2500 },
    ],
  },
  {
    id: "INV-2839",
    agency: "Digital Agency",
    email: "billing@digitalagency.com",
    campaign: "SEO Services",
    amount: 12400,
    fee: 124,
    status: "Approved",
    due: "16/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Technical SEO Audit", quantity: 1, rate: 4200 },
      { description: "Content Optimization", quantity: 4, rate: 1400 },
      { description: "Monthly Rank Reporting", quantity: 1, rate: 2600 },
    ],
  },
  {
    id: "INV-2838",
    agency: "Media Partners",
    email: "billing@mediapartners.com",
    campaign: "Influencer Campaign",
    amount: 28700,
    fee: 287,
    status: "Processing",
    due: "15/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Creator Shortlist & Outreach", quantity: 1, rate: 5200 },
      { description: "Influencer Placements", quantity: 6, rate: 3200 },
      { description: "Usage Rights Management", quantity: 1, rate: 4300 },
    ],
  },
  {
    id: "INV-2837",
    agency: "Brand Studio",
    email: "billing@brandstudio.com",
    campaign: "Print Advertising",
    amount: 19200,
    fee: 192,
    status: "Paid",
    due: "14/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Print Concept Development", quantity: 1, rate: 6200 },
      { description: "Layout Production", quantity: 4, rate: 1700 },
      { description: "Prepress Review", quantity: 2, rate: 3100 },
    ],
  },
  {
    id: "INV-2836",
    agency: "Marketing Pro",
    email: "billing@marketingpro.com",
    campaign: "Content Marketing",
    amount: 14300,
    fee: 143,
    status: "Failed",
    due: "13/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Editorial Strategy", quantity: 1, rate: 4300 },
      { description: "Article Production", quantity: 5, rate: 1400 },
      { description: "Distribution Reporting", quantity: 1, rate: 3000 },
    ],
  },
];

const sourceCopy: Record<string, SourceCopyValue> = {
  brand: {
    label: "Mainboard Sync",
    detail: "Imported from Mainboard/ERP and waiting inside brand approval controls.",
    actionLabel: "Approve & Pay",
    primaryLabel: "Agency",
    secondaryLabel: "Campaign",
    amountLabel: "Invoice Amount",
    feeLabel: "AgencyPay Fee (1%)",
    permissionView: "Brand payment approval",
  },
  agency: {
    label: "Agency Issued",
    detail: "Created inside the agency workspace for a client payment workflow.",
    actionLabel: "Approve Invoice",
    primaryLabel: "Client / Brand",
    secondaryLabel: "Work / Campaign",
    amountLabel: "Client Invoice Total",
    feeLabel: "Platform Fee",
    permissionView: "Agency invoice management",
  },
  talent_independent: {
    label: "Talent Created",
    detail: "Owned by the independent talent workspace for direct collection tracking.",
    actionLabel: "Approve Invoice",
    primaryLabel: "Client",
    secondaryLabel: "Work",
    amountLabel: "Invoice Total",
    feeLabel: "Fee",
    permissionView: "Independent invoice tracking",
  },
  talent_agency: {
    label: "Agency Assigned",
    detail: "Visible because this invoice is tied to the talent payout relationship.",
    actionLabel: "Review Invoice",
    primaryLabel: "Agency",
    secondaryLabel: "Assignment / Work",
    amountLabel: "Gross Amount",
    feeLabel: "Split / Fee",
    permissionView: "Assigned invoice view",
  },
  mother_agency: {
    label: "Network Rollup",
    detail: "Part of consolidated oversight across child agencies and vendor relationships.",
    actionLabel: "Release Payment",
    primaryLabel: "Child Agency",
    secondaryLabel: "Client / Work",
    amountLabel: "Network Amount",
    feeLabel: "Override / Fee",
    permissionView: "Network treasury release",
  },
};

const paymentSteps = [
  "Validating invoice ID and approval authority",
  "Checking wallet funding source",
  "Submitting settlement instruction",
  "Reconciling paid invoice record",
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatLongDate(value: string) {
  const [day, month, year] = value.split("/");
  const monthName = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ][Number(month) - 1];

  return `${monthName} ${Number(day)}, ${year}`;
}

function pdfEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildInvoicePdf(invoice: InvoiceDetail, labels: SourceCopyValue) {
  const lines = [
    `Invoice ${invoice.id}`,
    `${labels.primaryLabel}: ${invoice.agency}`,
    `${labels.secondaryLabel}: ${invoice.campaign}`,
    `${labels.amountLabel}: ${formatMoney(invoice.amount)}`,
    `${labels.feeLabel}: ${formatMoney(invoice.fee)}`,
    `Total Due: ${formatMoney(invoice.amount + invoice.fee)}`,
    `Due Date: ${formatLongDate(invoice.due)}`,
  ];
  const content = [
    "BT",
    "/F1 18 Tf",
    "72 760 Td",
    `(${pdfEscape(lines[0])}) Tj`,
    "/F1 11 Tf",
    ...lines.slice(1).map((line) => `0 -24 Td (${pdfEscape(line)}) Tj`),
    "ET",
  ].join("\n");
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
    `5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[28px] items-center rounded-full border px-3 text-[13px] font-medium leading-none",
        status === "Paid" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "Approved" && "border-blue-200 bg-blue-50 text-blue-700",
        (status === "Processing" || status === "Pending") && "border-amber-200 bg-amber-50 text-amber-700",
        (status === "Changes Requested" || status === "Failed") && "border-rose-200 bg-rose-50 text-rose-700",
        status !== "Paid" &&
          status !== "Approved" &&
          status !== "Processing" &&
          status !== "Pending" &&
          status !== "Changes Requested" &&
          status !== "Failed" &&
          "border-slate-200 bg-slate-100 text-slate-700"
      )}
    >
      {status}
    </span>
  );
}

function downloadPdf(invoice: InvoiceDetail, labels: SourceCopyValue) {
  const blob = new Blob([buildInvoicePdf(invoice, labels)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${invoice.id}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function InvoiceDetailPage({ params }: PageProps) {
  const { invoiceId } = use(params);
  const { state } = useApp();
  const invoice = invoices.find((item) => item.id === invoiceId);
  const [status, setStatus] = useState(invoice?.status ?? "Pending");
  const [paymentFlow, setPaymentFlow] = useState<PaymentFlow | null>(null);
  const [changeFlow, setChangeFlow] = useState<ChangeFlow | null>(null);
  const paymentIntervalRef = useRef<number | null>(null);
  const paymentTimeoutRef = useRef<number | null>(null);
  const activeWorkspace = state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId);
  const activeMembership = state.memberships.find(
    (membership) => membership.workspaceId === state.activeWorkspaceId
  );
  const workspaceType = activeWorkspace?.type ?? (state.user ? normalizeWorkspaceType(state.user.accountType) : "brand");
  const permissions =
    activeMembership?.permissions && activeMembership.permissions.length > 0
      ? activeMembership.permissions
      : getDefaultPermissions(getDefaultWorkspaceRole(workspaceType));
  const canApproveInvoice = permissions.includes("approve_invoices") || workspaceType === "mother_agency";
  const canInitiatePayment = permissions.includes("initiate_payments");
  const canRequestChanges =
    canApproveInvoice || permissions.includes("create_invoices") || workspaceType === "agency";

  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.debug("[InvoiceDetail] workspaceType:", workspaceType, "membershipRole:", activeMembership?.role ?? null, "permissions:", permissions, "canInitiatePayment:", canInitiatePayment);
  }
  const source = sourceCopy[workspaceType];
  const total = invoice ? invoice.amount + invoice.fee : 0;

  useEffect(() => {
    setStatus(invoice?.status ?? "Pending");
  }, [invoice?.id, invoice?.status]);

  useEffect(() => {
    return () => {
      if (paymentIntervalRef.current) window.clearInterval(paymentIntervalRef.current);
      if (paymentTimeoutRef.current) window.clearTimeout(paymentTimeoutRef.current);
    };
  }, []);

  if (!invoice) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-slate-400" />
        <h1 className="text-[28px] font-semibold text-slate-900">Invoice Not Found</h1>
        <p className="max-w-md text-[16px] text-slate-500">
          This invoice is not available in the current frontend dataset.
        </p>
        <Link
          href="/dashboard"
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[15px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const openPaymentFlow = () => {
    if (!canApproveInvoice && !canInitiatePayment) return;

    setPaymentFlow({
      stage: "review",
      fundingMethod: "ach",
      activeStep: 0,
      transactionId: "",
    });
  };

  const closePaymentFlow = () => {
    if (paymentFlow?.stage === "processing") return;
    setPaymentFlow(null);
  };

  const confirmPayment = () => {
    if (!paymentFlow) return;

    const transactionId = `TX-AP-${Math.floor(100000 + Math.random() * 900000)}`;

    setStatus("Processing");
    setPaymentFlow({
      ...paymentFlow,
      stage: "processing",
      activeStep: 0,
      transactionId,
    });

    if (paymentIntervalRef.current) window.clearInterval(paymentIntervalRef.current);
    if (paymentTimeoutRef.current) window.clearTimeout(paymentTimeoutRef.current);

    paymentIntervalRef.current = window.setInterval(() => {
      setPaymentFlow((flow) => {
        if (!flow || flow.stage !== "processing") return flow;

        return {
          ...flow,
          activeStep: Math.min(flow.activeStep + 1, paymentSteps.length - 1),
        };
      });
    }, 850);

    paymentTimeoutRef.current = window.setTimeout(() => {
      if (paymentIntervalRef.current) {
        window.clearInterval(paymentIntervalRef.current);
        paymentIntervalRef.current = null;
      }

      setStatus(canInitiatePayment ? "Paid" : "Approved");
      setPaymentFlow((flow) =>
        flow
          ? {
              ...flow,
              stage: "success",
              activeStep: paymentSteps.length - 1,
              transactionId,
            }
          : flow
      );
    }, 3600);
  };

  const submitChangeRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Changes Requested");
    setChangeFlow((flow) => ({
      reason: flow?.reason.trim() || "Invoice requires updates before approval.",
      submitted: true,
    }));
  };

  const workflowSummary = canInitiatePayment
    ? "This action validates invoice approval, submits a settlement instruction, and marks the invoice Paid after reconciliation."
    : "This action records approval for the invoice. Payment release remains with a finance or treasury user.";

  return (
    <div className="mx-auto w-full max-w-[1048px] px-4 py-8 md:py-12">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-[18px]">
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="mt-[27px] text-[24px] leading-none text-slate-400 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-[16px]">
              <h1 className="text-[30px] font-semibold leading-tight text-slate-900 sm:text-[35px]">
                Invoice {invoice.id}
              </h1>
              <StatusBadge status={status} />
            </div>
            <p className="mt-[14px] text-[18px] leading-6 text-slate-500 sm:mt-[18px] sm:text-[20px]">
              {invoice.campaign}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row md:mt-[11px]">
          <button
            type="button"
            onClick={() => downloadPdf(invoice, source)}
            className="inline-flex h-[38px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[14px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <Download className="h-4 w-4" />
            View PDF
          </button>
          {(canApproveInvoice || canInitiatePayment) && (
            <button
              type="button"
              onClick={openPaymentFlow}
              className="h-[38px] rounded-xl border border-slate-900 bg-slate-900 px-5 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
            >
              {source.actionLabel}
            </button>
          )}
        </div>
      </div>

      <section className="mt-[28px] rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">
              {source.label}
            </p>
            <p className="mt-1.5 max-w-[700px] text-[15px] leading-6 text-slate-600">
              {source.detail}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
              <p className="text-[12px] font-medium text-slate-500">Workspace</p>
              <p className="mt-1 truncate text-[14px] font-semibold text-slate-900">
                {activeWorkspace?.name || "Current Workspace"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
              <p className="text-[12px] font-medium text-slate-500">Agncy ID</p>
              <p className="mt-1 truncate text-[14px] font-semibold text-slate-900">
                {activeWorkspace?.agncyId || "ORG-100245"}
              </p>
            </div>
            <div className="col-span-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 sm:col-span-1">
              <p className="text-[12px] font-medium text-slate-500">Permission</p>
              <p className="mt-1 truncate text-[14px] font-semibold text-slate-900">
                {canInitiatePayment ? source.permissionView : canApproveInvoice ? "Approval Only" : "View / Track"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-[29px] grid grid-cols-1 gap-[29px] xl:grid-cols-[minmax(0,690px)_330px]">
        <div className="space-y-[29px]">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm">
            <h2 className="text-[22px] font-semibold leading-none text-slate-900 sm:text-[24px]">
              Invoice Details
            </h2>
            <div className="mt-[26px] grid grid-cols-1 gap-[26px] md:grid-cols-2">
              <div className="flex items-start gap-[15px]">
                <div className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Building2 className="h-[22px] w-[22px]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] leading-5 text-slate-500">{source.primaryLabel}</p>
                  <p className="mt-1 break-words text-[18px] font-semibold leading-6 text-slate-900">
                    {invoice.agency}
                  </p>
                  <p className="mt-1 break-all text-[14px] leading-5 text-slate-500">
                    {invoice.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-[15px]">
                <div className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <CalendarDays className="h-[22px] w-[22px]" />
                </div>
                <div>
                  <p className="text-[14px] leading-5 text-slate-500">Due Date</p>
                  <p className="mt-1 text-[18px] font-semibold leading-6 text-slate-900">
                    {formatLongDate(invoice.due)}
                  </p>
                  <p className="mt-1 text-[14px] leading-5 text-slate-500">
                    Created {invoice.created}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm">
            <h2 className="text-[22px] font-semibold leading-none text-slate-900 sm:text-[24px]">
              Line Items
            </h2>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[610px] table-fixed text-left">
                <colgroup>
                  <col className="w-[56%]" />
                  <col className="w-[14%]" />
                  <col className="w-[16%]" />
                  <col className="w-[14%]" />
                </colgroup>
                <thead>
                  <tr className="h-[40px] border-b border-slate-200 text-[14px] font-medium leading-none text-slate-500">
                    <th className="font-medium">Description</th>
                    <th className="text-right font-medium">Qty</th>
                    <th className="text-right font-medium">Rate</th>
                    <th className="text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.lineItems.map((item) => (
                    <tr
                      key={item.description}
                      className="h-[64px] text-[15px] leading-6 text-slate-700"
                    >
                      <td className="pr-5 font-medium text-slate-900">{item.description}</td>
                      <td className="text-right text-slate-600">{item.quantity}</td>
                      <td className="text-right text-slate-500">{formatMoney(item.rate)}</td>
                      <td className="text-right font-semibold text-slate-900">
                        {formatMoney(item.quantity * item.rate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <div className="flex justify-between gap-4 text-[15px] leading-5">
                <span className="text-slate-500">{source.amountLabel}</span>
                <span className="font-semibold text-slate-900">{formatMoney(invoice.amount)}</span>
              </div>
              <div className="mt-4 flex justify-between gap-4 text-[15px] leading-5">
                <span className="text-slate-500">{source.feeLabel}</span>
                <span className="font-semibold text-slate-900">{formatMoney(invoice.fee)}</span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-200 pt-5">
                <span className="text-[17px] font-semibold leading-6 text-slate-900">
                  Total Amount
                </span>
                <span className="break-words text-right text-[26px] font-bold leading-none text-slate-900 sm:text-[30px]">
                  {formatMoney(total)}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm">
            <h2 className="text-[22px] font-semibold leading-none text-slate-900 sm:text-[24px]">
              Activity Timeline
            </h2>
            <div className="mt-6 space-y-6">
              {[
                ["Invoice created", `${invoice.agency} - 2026-05-15 10:23 AM`],
                [source.label, `System - 2026-05-15 10:25 AM`],
                [status === "Changes Requested" ? "Changes requested" : "Awaiting approval", `AgncyPay - 2026-05-15 02:14 PM`],
              ].map(([title, detail], index, items) => (
                <div key={title} className="relative flex gap-4">
                  <div className="relative flex w-[10px] justify-center">
                    <span className="mt-[6px] h-2.5 w-2.5 rounded-full bg-slate-400" />
                    {index < items.length - 1 && (
                      <span className="absolute top-[18px] h-[calc(100%+10px)] w-px bg-slate-200" />
                    )}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold leading-5 text-slate-900">{title}</p>
                    <p className="mt-1 text-[14px] leading-5 text-slate-500">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-[24px]">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-[20px] font-semibold leading-none text-slate-900">
              Payment Summary
            </h2>
            <div className="mt-6 space-y-4">
              <div className="flex justify-between gap-6 text-[15px] leading-5">
                <span className="text-slate-500">{source.amountLabel}</span>
                <span className="font-semibold text-slate-900">{formatMoney(invoice.amount)}</span>
              </div>
              <div className="flex justify-between gap-6 text-[15px] leading-5">
                <span className="text-slate-500">{source.feeLabel}</span>
                <span className="font-semibold text-slate-900">{formatMoney(invoice.fee)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
                <span className="text-[16px] font-semibold leading-6 text-slate-900">Total Due</span>
                <span className="break-words text-right text-[22px] font-bold leading-none text-slate-900">
                  {formatMoney(total)}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3.5">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
              <div>
                <h2 className="text-[16px] font-semibold leading-6 text-slate-900">
                  {status === "Paid" ? "Payment Settled" : status}
                </h2>
                <p className="mt-2 text-[14px] leading-6 text-slate-600">
                  {canApproveInvoice || canInitiatePayment
                    ? workflowSummary
                    : "You can view this invoice and track payout/payment status. Approval and treasury controls stay with authorized workspace users."}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            {(canApproveInvoice || canInitiatePayment) && (
              <button
                type="button"
                onClick={openPaymentFlow}
                className="h-[44px] w-full rounded-xl border border-slate-900 bg-slate-900 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
              >
                {source.actionLabel}
              </button>
            )}
            {canRequestChanges && (
              <button
                type="button"
                onClick={() => setChangeFlow({ reason: "", submitted: false })}
                className={cn(
                  "h-[44px] w-full rounded-xl border border-slate-200 bg-white text-[15px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900",
                  (canApproveInvoice || canInitiatePayment) && "mt-3"
                )}
              >
                Request Changes
              </button>
            )}
            {!canRequestChanges && !canApproveInvoice && !canInitiatePayment && (
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] leading-5 text-slate-600">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                Invoice controls are limited by your current workspace role.
              </div>
            )}
          </section>
        </aside>
      </div>

      {paymentFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 px-3 py-5 backdrop-blur-sm sm:px-4">
          <section className="flex max-h-[calc(100vh-40px)] w-full max-w-[620px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm">
                  {paymentFlow.stage === "success" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <ShieldCheck className="h-5 w-5 text-slate-700" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-[18px] font-semibold leading-tight text-slate-900 sm:text-[20px]">
                    {paymentFlow.stage === "review" && "Review Invoice Payment"}
                    {paymentFlow.stage === "processing" && "Processing Payment"}
                    {paymentFlow.stage === "success" && (canInitiatePayment ? "Payment Successful" : "Approval Recorded")}
                  </h2>
                  <p className="mt-1 text-[13px] leading-4 text-slate-500">
                    {invoice.id} · {source.label}
                  </p>
                </div>
              </div>

              {paymentFlow.stage !== "processing" && (
                <button
                  type="button"
                  onClick={closePaymentFlow}
                  aria-label="Close payment flow"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">
              {paymentFlow.stage === "review" && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-mono text-[14px] font-semibold leading-5 text-slate-900">
                          {invoice.id}
                        </p>
                        <p className="mt-1 break-words text-[13px] leading-5 text-slate-500">
                          {invoice.agency} · {invoice.campaign}
                        </p>
                      </div>
                      <p className="shrink-0 text-[18px] font-bold leading-none text-slate-900">
                        {formatMoney(total)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                      <p className="text-[12px] leading-4 text-slate-500">{source.amountLabel}</p>
                      <p className="mt-1.5 break-words text-[16px] font-semibold leading-tight text-slate-900">
                        {formatMoney(invoice.amount)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                      <p className="text-[12px] leading-4 text-slate-500">{source.feeLabel}</p>
                      <p className="mt-1.5 break-words text-[16px] font-semibold leading-tight text-slate-900">
                        {formatMoney(invoice.fee)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                      <p className="text-[12px] leading-4 text-slate-500">Total</p>
                      <p className="mt-1.5 break-words text-[16px] font-semibold leading-tight text-slate-900">
                        {formatMoney(total)}
                      </p>
                    </div>
                  </div>

                  {canInitiatePayment && (
                    <div>
                      <p className="text-[13px] font-semibold leading-4 text-slate-700">
                        Funding Source
                      </p>
                      <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                          ["ach", "Primary ACH", "Chase Business Checking ...1234"],
                          ["card", "Corporate Card", "Visa Signature ...8930"],
                        ].map(([method, title, detail]) => {
                          const isSelected = paymentFlow.fundingMethod === method;

                          return (
                            <button
                              key={method}
                              type="button"
                              onClick={() =>
                                setPaymentFlow((flow) =>
                                  flow ? { ...flow, fundingMethod: method as PaymentFlow["fundingMethod"] } : flow
                                )
                              }
                              className={cn(
                                "rounded-xl border p-4 text-left transition-all",
                                isSelected
                                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                                  : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                              )}
                            >
                              <span className="flex items-center gap-2 text-[14px] font-semibold">
                                <CreditCard className="h-4 w-4" />
                                {title}
                              </span>
                              <span className={cn("mt-1.5 block text-[12px]", isSelected ? "text-slate-300" : "text-slate-500")}>
                                {detail}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-[13px] leading-5 text-slate-600">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    {workflowSummary}
                  </div>

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closePaymentFlow}
                      className="h-[40px] rounded-xl border border-slate-200 bg-white px-5 text-[14px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmPayment}
                      className="h-[40px] rounded-xl border border-slate-900 bg-slate-900 px-5 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                    >
                      {canInitiatePayment ? "Confirm Payment" : "Record Approval"}
                    </button>
                  </div>
                </div>
              )}

              {paymentFlow.stage === "processing" && (
                <div className="flex min-h-full flex-col items-center justify-center py-6 text-center">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                    <RefreshCw className="h-7 w-7 animate-spin text-slate-700" />
                    <Lock className="absolute h-3.5 w-3.5 text-slate-400" />
                  </div>

                  <h3 className="mt-5 text-[22px] font-semibold leading-none text-slate-900">
                    {canInitiatePayment ? `Settling ${formatMoney(total)}` : "Recording Approval"}
                  </h3>
                  <p className="mt-2 text-[14px] leading-5 text-slate-500">
                    Keep this window open while the workflow is reconciled.
                  </p>

                  <div className="mt-6 w-full space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-left">
                    {paymentSteps.map((step, index) => {
                      const isDone = index < paymentFlow.activeStep;
                      const isActive = index === paymentFlow.activeStep;

                      return (
                        <div
                          key={step}
                          className={cn(
                            "flex items-center gap-3 text-[14px] transition-colors",
                            isDone ? "font-medium text-emerald-600" : isActive ? "font-semibold text-slate-900" : "text-slate-400"
                          )}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          ) : isActive ? (
                            <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-slate-700" />
                          ) : (
                            <span className="h-4 w-4 shrink-0 rounded-full border border-slate-300" />
                          )}
                          <span>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {paymentFlow.stage === "success" && (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>

                  <h3 className="mt-5 text-[22px] font-semibold leading-none text-slate-900">
                    {canInitiatePayment ? "Payment Settled Successfully" : "Invoice Approved"}
                  </h3>
                  <p className="mt-2 max-w-[420px] text-[14px] leading-5 text-slate-500">
                    {canInitiatePayment
                      ? "The invoice is now marked Paid and the transaction reference is ready for records."
                      : "Approval has been recorded. A finance user can release payment from the authorized workspace."}
                  </p>

                  <div className="mt-6 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-left">
                    <div className="flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:justify-between">
                      <span className="text-[13px] text-slate-500">Transaction ID</span>
                      <span className="break-all font-mono text-[13px] font-semibold text-slate-900 sm:text-right">
                        {paymentFlow.transactionId}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-200 py-3">
                      <span className="text-[13px] text-slate-500">Invoice</span>
                      <span className="text-[13px] font-semibold text-slate-900">{invoice.id}</span>
                    </div>
                    <div className="flex flex-col gap-2 pt-3 sm:flex-row sm:justify-between">
                      <span className="text-[13px] text-slate-500">Final Amount</span>
                      <span className="break-words text-[14px] font-bold text-slate-900 sm:text-right">
                        {formatMoney(total)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closePaymentFlow}
                    className="mt-6 h-[40px] rounded-xl border border-slate-900 bg-slate-900 px-6 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                  >
                    Back to Invoice
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {changeFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 px-3 py-5 backdrop-blur-sm sm:px-4">
          <section className="flex max-h-[calc(100vh-40px)] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-[18px] font-semibold leading-tight text-slate-900 sm:text-[20px]">
                  {changeFlow.submitted ? "Changes Requested" : "Request Invoice Changes"}
                </h2>
                <p className="mt-1 text-[13px] leading-4 text-slate-500">
                  {invoice.id} · {invoice.agency}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setChangeFlow(null)}
                aria-label="Close change request"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">
              {changeFlow.submitted ? (
                <div className="space-y-5">
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-[15px] font-semibold text-slate-900">
                        Request sent to invoice owner
                      </p>
                      <p className="mt-1 text-[13px] leading-5 text-slate-600">
                        The invoice has been moved to Changes Requested until the owner updates it.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                    <p className="text-[12px] font-medium text-slate-500">Reason</p>
                    <p className="mt-2 whitespace-pre-wrap text-[14px] leading-6 text-slate-900">
                      {changeFlow.reason}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setChangeFlow(null)}
                      className="h-[40px] rounded-xl border border-slate-900 bg-slate-900 px-6 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submitChangeRequest} className="space-y-5">
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                    <p className="font-mono text-[14px] font-semibold text-slate-900">{invoice.id}</p>
                    <p className="mt-1 text-[13px] leading-5 text-slate-500">
                      {invoice.campaign} · {formatMoney(total)}
                    </p>
                  </div>
                  <label className="block">
                    <span className="text-[13px] font-semibold text-slate-700">
                      Change request note
                    </span>
                    <textarea
                      required
                      value={changeFlow.reason}
                      onChange={(event) =>
                        setChangeFlow((flow) =>
                          flow ? { ...flow, reason: event.target.value } : flow
                        )
                      }
                      placeholder="Explain what needs to be corrected before approval."
                      className="mt-2 min-h-[140px] w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900"
                    />
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setChangeFlow(null)}
                      className="h-[40px] rounded-xl border border-slate-200 bg-white px-5 text-[14px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-[40px] rounded-xl border border-slate-900 bg-slate-900 px-5 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                    >
                      Send Request
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
