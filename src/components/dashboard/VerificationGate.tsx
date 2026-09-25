"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, Lock, ShieldCheck } from "lucide-react";
import { useApp } from "../../context/AppContext";

interface VerificationGateProps {
  children?: React.ReactNode;
}

export function VerificationGate({ children }: VerificationGateProps) {
  const router = useRouter();
  const { state } = useApp();
  const isApproved = state.verificationStatus === "approved";

  if (isApproved) {
    return <>{children}</>;
  }

  const organizationName = state.businessSetup.legalName || state.businessSetup.brandName || "Workspace";

  const checklist = [
    { label: "Business legal entity submitted", done: !!state.businessSetup.legalName },
    { label: "Authorized representative verified", done: !!state.representative?.fullName },
    {
      label: "Corporate documentation uploaded",
      done:
        state.documents.filter((doc) =>
          ["uploaded", "approved", "processing"].includes(doc.status)
        ).length >= 4,
    },
    {
      label: "Brand authorization & domain verified",
      done: state.brand.domainVerified && state.brand.trademarkCertUploaded,
    },
    {
      label: "FinCEN compliance & KYB review",
      done: state.verificationStatus === "approved",
      pending: state.verificationStatus === "submitted" || state.verificationStatus === "in_review",
    },
    {
      label: "Cybrid clearing bank account",
      done: state.bankDetails.status === "approved",
      pending: state.bankDetails.status === "processing",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Status Warning Card */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="shrink-0 rounded-xl border border-amber-300 bg-white p-2.5 text-amber-700 shadow-2xs">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Verification Pending: Restricted Access</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300 uppercase">
                {state.verificationStatus.replace("_", " ")}
              </span>
            </div>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-600">
              Your <strong className="text-slate-900">{organizationName}</strong> corporate account is pending compliance clearance. Disbursals and Pay With AgncyPay features unlock automatically upon approval.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/onboarding/business-setup")}
          className="shrink-0 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <span>Complete KYB</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Checklist Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-500" />
            <span>{organizationName} Compliance Checklist</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-medium">
            {checklist.filter(c => c.done).length} of {checklist.length} verified
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-2">
          {checklist.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2.5 rounded-xl border p-3 transition-colors ${
                item.done
                  ? "border-emerald-200 bg-emerald-50/40 text-emerald-900"
                  : item.pending
                  ? "border-amber-200 bg-amber-50/40 text-amber-900"
                  : "border-slate-100 bg-slate-50/60 text-slate-600"
              }`}
            >
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : item.pending ? (
                <span className="relative flex h-4 w-4 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <Clock3 className="h-3 w-3" />
                  </span>
                </span>
              ) : (
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-400">
                  <Clock3 className="h-2.5 w-2.5" />
                </div>
              )}
              <span
                className={`text-xs ${
                  item.done
                    ? "font-semibold text-slate-800 line-through decoration-slate-300"
                    : item.pending
                    ? "font-semibold text-amber-900"
                    : "font-medium text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
