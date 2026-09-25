"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, FileCheck, Building2, User, Hash, Lock } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { VerificationGate } from "../../../components/dashboard/VerificationGate";
import { Badge } from "../../../components/ui/Badge";

export default function VerificationPage() {
  const { state } = useApp();
  const isApproved = state.verificationStatus === "approved";

  const badgeProps = {
    draft: { variant: "neutral" as const, label: "Draft" },
    submitted: { variant: "secondary" as const, label: "Submitted" },
    in_review: { variant: "warning" as const, label: "In Review" },
    requires_action: { variant: "error" as const, label: "Action Required" },
    approved: { variant: "success" as const, label: "Approved" },
    rejected: { variant: "error" as const, label: "Rejected" },
    suspended: { variant: "error" as const, label: "Suspended" },
  }[state.verificationStatus] || { variant: "neutral" as const, label: "Unknown" };

  const orgName = state.businessSetup.legalName || state.businessSetup.brandName || "Corporate Workspace";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-slate-700" />
            <span>Corporate KYB & Compliance Audit</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time FinCEN compliance status, beneficial ownership audit, and verified clearing rails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={badgeProps.variant} size="md">
            {badgeProps.label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Main Status Widget */}
        <div className="lg:col-span-2 space-y-6">
          <VerificationGate />

          {isApproved && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 text-xs text-slate-700 leading-relaxed flex items-start gap-3 shadow-2xs">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Verification Seal Active:</span> Your corporate entity <span className="font-bold text-slate-900">{orgName}</span> and business registry licenses are verified. Inbound and outbound clearing limits unlocked up to $1,000,000 / batch.
              </div>
            </div>
          )}
        </div>

        {/* Right Review Logs & Compliance Metadata */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Compliance Details</h4>
          
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 text-xs">
            <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
              <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Authorized Signatory</span>
                <p className="font-bold text-slate-900 mt-0.5">{state.representative.fullName || "Alexander Vance (Managing Partner)"}</p>
                <p className="text-[11px] text-slate-500">{state.representative.jobTitle || "Executive Signatory"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
              <Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Registered Entity</span>
                <p className="font-bold text-slate-900 mt-0.5">{state.businessSetup.legalName || "Apex Media Group LLC"}</p>
                <p className="text-[11px] text-slate-500">{state.businessSetup.businessType || "LLC"} • {state.businessSetup.country || "United States"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
              <FileCheck className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tax ID (EIN / VAT)</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{state.businessSetup.taxId || "12-3456789"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Lock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Encrypted Audit Hash</span>
                <p className="font-mono text-[11px] text-slate-600 truncate mt-0.5">ap_984021_cybrid_fincen_audit</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
