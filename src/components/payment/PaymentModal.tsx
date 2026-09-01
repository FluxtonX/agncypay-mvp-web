"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  Landmark,
  Zap,
  Copy,
  Check,
  ArrowRight,
  Building2,
  Info
} from "lucide-react";
import { Invoice } from "../../types/invoice";
import { formatCurrency } from "../../lib/formatCurrency";
import { formatDate } from "../../lib/formatDate";
import { useApp } from "../../context/AppContext";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

type PayState = "summary" | "processing" | "success" | "failed";
type PaymentRail = "ach" | "wire_instructions" | "instant_treasury";

export function PaymentModal({ isOpen, onClose, invoice }: PaymentModalProps) {
  const router = useRouter();
  const { payInvoice } = useApp();
  const [payState, setPayState] = useState<PayState>("summary");
  const [activeStep, setActiveStep] = useState(0);
  const [txId, setTxId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedRail, setSelectedRail] = useState<PaymentRail>("instant_treasury");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Virtual Cybrid deposit account details for wire/ACH instructions
  const agencyDepositDetails = {
    bankName: "Evolve Bank & Trust / Cybrid",
    routingNumber: "111000025",
    accountNumber: `4098${invoice.id.replace(/\D/g, "").padStart(6, "0").slice(0, 8)}`,
    accountType: "Commercial Checking",
    uniqueMemoId: `AGY-INV-${invoice.id.toUpperCase()}`,
    beneficiaryName: invoice.agency || "Partner Agency Workspace",
  };

  const steps = [
    "Validating corporate invoice & cryptographic signature",
    "Allocating liquidity via Cybrid partner banking ledger",
    "Executing real-time clearing & settlement entry",
    "Generating immutable double-entry receipt on platform ledger",
  ];

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Process simulation steps
  useEffect(() => {
    if (payState !== "processing") return;
    
    setActiveStep(0);
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          return steps.length - 1;
        }
        return prev + 1;
      });
    }, 850);

    return () => clearInterval(interval);
  }, [payState]);

  const handleConfirmPayment = async () => {
    setPayState("processing");
    try {
      const result = await payInvoice(invoice.id);
      setTimeout(() => {
        if (result.success) {
          setTxId(`TX-CYB-${Math.floor(100000 + Math.random() * 900000)}`);
          setPayState("success");
        } else {
          setErrorMessage(result.error || "Payment was declined by financial provider authority.");
          setPayState("failed");
        }
      }, 3400);
    } catch (err: any) {
      setErrorMessage(err?.message || "Payment transaction could not be processed.");
      setPayState("failed");
    }
  };

  const handleRetry = () => {
    setPayState("summary");
    setActiveStep(0);
    setErrorMessage("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={payState === "summary" ? onClose : undefined}
            className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="w-full max-w-xl glass-panel rounded-2xl overflow-hidden bg-[#0D0D12] shadow-2xl z-10 border border-white/[0.1] text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {payState === "summary" && "Brand Payment Gateway"}
                  {payState === "processing" && "Processing Cybrid Settlement"}
                  {payState === "success" && "Settlement Confirmed"}
                  {payState === "failed" && "Settlement Failed"}
                </h3>
              </div>
              {payState === "summary" && (
                <button
                  onClick={onClose}
                  className="text-[#8E8E93] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* STATE 1: SUMMARY */}
              {payState === "summary" && (
                <div className="space-y-5">
                  {/* Invoice Header details */}
                  <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center font-bold text-white">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{invoice.agency || "Partner Agency Workspace"}</h4>
                        <p className="text-[11px] text-[#8E8E93] mt-0.5 font-mono">Invoice #{invoice.id}</p>
                      </div>
                    </div>
                    <Badge variant="warning" className="uppercase tracking-wider font-bold">
                      Awaiting Payment
                    </Badge>
                  </div>

                  {/* Due Date & Settlement Currency */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/[0.02] border border-white/[0.06] p-3 rounded-xl">
                      <p className="text-[#8E8E93] font-semibold uppercase tracking-wider text-[10px]">Due Terms</p>
                      <p className="text-white font-bold mt-1">{invoice.dueDate ? formatDate(invoice.dueDate) : "Net-30 Settlement"}</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] p-3 rounded-xl">
                      <p className="text-[#8E8E93] font-semibold uppercase tracking-wider text-[10px]">Settlement Rails</p>
                      <p className="text-emerald-400 font-bold mt-1 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        Cybrid Cloud Banking
                      </p>
                    </div>
                  </div>

                  {/* Amount Breakdown */}
                  <div className="space-y-2 border-b border-white/[0.06] pb-4 text-xs">
                    <div className="flex justify-between text-[#8E8E93]">
                      <span>Invoice Gross Amount</span>
                      <span className="font-semibold text-white">{formatCurrency(invoice.amount)}</span>
                    </div>
                    <div className="flex justify-between text-[#8E8E93]">
                      <span>Real-time Clearing Fee</span>
                      <span className="font-semibold text-emerald-400">0.00 USD (Sponsored)</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.06]">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Total Amount Due</span>
                    <span className="text-2xl font-black text-white tracking-tight">{formatCurrency(invoice.amount)}</span>
                  </div>

                  {/* Payment Rail Selector */}
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
                      Select Funding Rail
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedRail("instant_treasury")}
                        className={cn(
                          "p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between",
                          selectedRail === "instant_treasury"
                            ? "bg-white text-black border-white shadow-lg"
                            : "border-white/10 text-[#A1A1AA] hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <Zap className="h-4 w-4 text-amber-500" /> Instant Settlement
                          </div>
                          <span className={cn("text-[10px] mt-1 block", selectedRail === "instant_treasury" ? "text-neutral-700" : "text-[#71717A]")}>
                            Cybrid Treasury Ledger
                          </span>
                        </div>
                        <span className={cn("text-[9px] font-extrabold uppercase mt-2 px-1.5 py-0.5 rounded w-fit", selectedRail === "instant_treasury" ? "bg-black/10 text-black" : "bg-emerald-500/20 text-emerald-300")}>
                          Instant (0s)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRail("ach")}
                        className={cn(
                          "p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between",
                          selectedRail === "ach"
                            ? "bg-white text-black border-white shadow-lg"
                            : "border-white/10 text-[#A1A1AA] hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <CreditCard className="h-4 w-4 text-blue-400" /> Plaid ACH Pull
                          </div>
                          <span className={cn("text-[10px] mt-1 block", selectedRail === "ach" ? "text-neutral-700" : "text-[#71717A]")}>
                            Connected Bank Account
                          </span>
                        </div>
                        <span className={cn("text-[9px] font-extrabold uppercase mt-2 px-1.5 py-0.5 rounded w-fit", selectedRail === "ach" ? "bg-black/10 text-black" : "bg-blue-500/20 text-blue-300")}>
                          1-2 Business Days
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRail("wire_instructions")}
                        className={cn(
                          "p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between",
                          selectedRail === "wire_instructions"
                            ? "bg-white text-black border-white shadow-lg"
                            : "border-white/10 text-[#A1A1AA] hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <Landmark className="h-4 w-4 text-purple-400" /> Wire / Inbound ACH
                          </div>
                          <span className={cn("text-[10px] mt-1 block", selectedRail === "wire_instructions" ? "text-neutral-700" : "text-[#71717A]")}>
                            Virtual Deposit Account
                          </span>
                        </div>
                        <span className={cn("text-[9px] font-extrabold uppercase mt-2 px-1.5 py-0.5 rounded w-fit", selectedRail === "wire_instructions" ? "bg-black/10 text-black" : "bg-purple-500/20 text-purple-300")}>
                          Manual Fedwire
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Wire Instructions Box */}
                  {selectedRail === "wire_instructions" && (
                    <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 space-y-3">
                      <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                        <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                          <Landmark className="h-4 w-4 text-purple-400" />
                          Dedicated Inbound Wire Details
                        </span>
                        <span className="text-[10px] font-mono text-purple-300 font-semibold">Evolve Bank & Trust</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-black/40 p-2.5 rounded-lg flex items-center justify-between border border-white/5">
                          <div>
                            <span className="text-[10px] text-neutral-400 block font-semibold">Routing (ABA)</span>
                            <span className="font-mono font-bold text-white">{agencyDepositDetails.routingNumber}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy("routing", agencyDepositDetails.routingNumber)}
                            className="p-1.5 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors"
                          >
                            {copiedField === "routing" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>

                        <div className="bg-black/40 p-2.5 rounded-lg flex items-center justify-between border border-white/5">
                          <div>
                            <span className="text-[10px] text-neutral-400 block font-semibold">Account Number</span>
                            <span className="font-mono font-bold text-white">{agencyDepositDetails.accountNumber}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy("account", agencyDepositDetails.accountNumber)}
                            className="p-1.5 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors"
                          >
                            {copiedField === "account" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-black/40 p-2.5 rounded-lg flex items-center justify-between border border-white/5 text-xs">
                        <div>
                          <span className="text-[10px] text-amber-400 block font-bold uppercase">Required Payment Memo / Reference ID</span>
                          <span className="font-mono font-bold text-white">{agencyDepositDetails.uniqueMemoId}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy("memo", agencyDepositDetails.uniqueMemoId)}
                          className="p-1.5 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors"
                        >
                          {copiedField === "memo" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>

                      <p className="text-[10px] text-neutral-300 leading-relaxed">
                        ⚠️ Please include the exact Memo ID when initiating from your corporate bank. AgncyPay automatically reconciles and deposits funds into the Agency wallet upon settlement.
                      </p>
                    </div>
                  )}

                  {/* Security message */}
                  <div className="flex items-start gap-2.5 bg-white/[0.02] border border-white/[0.06] p-3.5 rounded-xl text-[11px] text-[#A1A1AA] leading-relaxed">
                    <Lock className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                    <span>
                      Protected by Cybrid Banking Security. Funds are held in FDIC-insured partner custodial accounts and automatically balanced on the platform double-entry ledger.
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={onClose} className="text-xs">
                      Cancel
                    </Button>
                    <Button variant="primary" className="px-6 bg-white text-black hover:bg-white/90 text-xs font-bold" onClick={handleConfirmPayment}>
                      {selectedRail === "wire_instructions" ? "I Have Sent Funds / Confirm" : "Authorize & Settle"}
                    </Button>
                  </div>
                </div>
              )}

              {/* STATE 2: PROCESSING */}
              {payState === "processing" && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative flex items-center justify-center">
                    <RefreshCw className="h-16 w-16 text-emerald-400 animate-spin stroke-[1.5px]" />
                    <Lock className="absolute h-6 w-6 text-white animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">Settling {formatCurrency(invoice.amount)}</h3>
                    <p className="text-xs text-[#8E8E93]">Routing through Cybrid Banking Network</p>
                  </div>

                  {/* Checklist of validation steps */}
                  <div className="w-full max-w-md bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl text-left space-y-3">
                    {steps.map((step, idx) => {
                      const isDone = idx < activeStep;
                      const isActive = idx === activeStep;
                      
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center gap-3 text-xs transition-all duration-300",
                            isDone ? "text-emerald-400" : isActive ? "text-white font-medium" : "text-[#52525B]"
                          )}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                          ) : isActive ? (
                            <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-amber-400" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-white/10 flex items-center justify-center text-[8px] shrink-0" />
                          )}
                          <span className={cn(isDone && "line-through opacity-80")}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STATE 3: SUCCESS */}
              {payState === "success" && (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white tracking-tight">Payment Settled Successfully</h3>
                    <p className="text-xs text-[#8E8E93]">Double-entry ledger reconciliation completed.</p>
                  </div>

                  {/* Transaction metadata */}
                  <div className="w-full bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl text-left text-xs divide-y divide-white/[0.04] space-y-2">
                    <div className="flex justify-between py-1">
                      <span className="text-[#8E8E93]">Cybrid Transfer Reference</span>
                      <span className="font-mono font-bold text-white">{txId}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-[#8E8E93]">Invoice Number</span>
                      <span className="font-bold text-white">#{invoice.id}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-[#8E8E93]">Settlement Amount</span>
                      <span className="font-extrabold text-emerald-400">{formatCurrency(invoice.amount)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-[#8E8E93]">Settled Timestamp</span>
                      <span className="font-bold text-white">{new Date().toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="flex w-full gap-3 pt-2">
                    <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/5" onClick={onClose}>
                      Back to Invoices
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1 bg-white text-black hover:bg-white/90 font-bold"
                      onClick={() => {
                        onClose();
                        router.push("/branddashboard/invoices");
                      }}
                    >
                      View Updated Ledger
                    </Button>
                  </div>
                </div>
              )}

              {/* STATE 4: FAILED */}
              {payState === "failed" && (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="h-16 w-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                    <XCircle className="h-10 w-10" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white tracking-tight">Payment Settlement Declined</h3>
                    <p className="text-xs text-red-300">{errorMessage}</p>
                  </div>

                  <div className="w-full bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl text-left text-xs space-y-2">
                    <p className="text-[#8E8E93] leading-relaxed">
                      Provider clearing code: <span className="font-mono text-white font-semibold">R01 (Insufficient Balance / Gateway Rejected)</span>. Please review bank connection or try alternative settlement rail.
                    </p>
                  </div>

                  <div className="flex w-full gap-3 pt-2">
                    <Button variant="outline" className="flex-1 border-white/10" onClick={onClose}>
                      Dismiss
                    </Button>
                    <Button variant="primary" className="flex-1 bg-white text-black hover:bg-white/90 font-bold" onClick={handleRetry}>
                      Retry Transaction
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
