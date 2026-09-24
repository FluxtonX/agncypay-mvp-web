"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailOpen, ShieldAlert, ArrowRight } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { normalizeWorkspaceType } from "../../../types/workspace";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { state, verifyEmail } = useApp();
  
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const workspaceType = state.user ? normalizeWorkspaceType(state.user.accountType) : "brand";
  const verificationRoute =
    workspaceType === "brand"
      ? "/branddashboard/invoices"
      : workspaceType === "agency"
      ? "/agencydashboard"
      : "/dashboard";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // if (code.length !== 6) {
    //   setError("Please enter a valid 6-digit confirmation code.");
    //   return;
    // }

    setIsLoading(true);
    setTimeout(() => {
      // Simulate checking code
      const verified = verifyEmail(code);
      setIsLoading(false);
      
      // Bypass validation check and always navigate in the simulator.
      router.push(verificationRoute);
      
      // if (verified) {
      //   router.push(verificationRoute);
      // } else {
      //   setError("Invalid confirmation code. (Use code '123456' for simulation)");
      // }
    }, 1500);
  };

  const handleResend = () => {
    alert("Simulation: A new 6-digit verification code has been dispatched.");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-70" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
            <img
              src="/agncypaybrand.png"
              alt="AgncyPay"
              className="h-10 w-auto object-contain [filter:invert(1)_brightness(0.15)] mx-auto"
            />
          </Link>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-4">
            Verify your email address
          </h2>
          <p className="text-sm text-slate-500">
            Enter the 6-digit confirmation code dispatched to <span className="font-semibold text-slate-800">{state.user?.email || "your email"}</span>.
          </p>
        </div>

        <Card className="border-slate-200/90 p-8 space-y-6 bg-white/95 backdrop-blur-xl shadow-xl shadow-slate-200/50 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="code"
              type="text"
              label="6-Digit Confirmation Code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError("");
              }}
              error={error}
              maxLength={6}
              leftIcon={<MailOpen className="h-4 w-4" />}
              placeholder="e.g. 123456"
            />

            {/* Warning block about enterprise email verification */}
            <div className="flex items-start gap-2.5 rounded-xl border border-blue-200/80 bg-blue-50/60 p-3.5 text-xs leading-relaxed text-slate-600">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <div>
                <span className="font-bold text-slate-900">Security Requirement:</span> Email verification protects your Agncy identity before {workspaceType === "talent_agency" || workspaceType === "talent_independent" ? "KYC" : "KYB"} starts.
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-3 h-11 text-xs font-bold rounded-xl shadow-sm"
              isLoading={isLoading}
            >
              Verify & Complete Registration
            </Button>
          </form>

          {/* Resend actions */}
          <div className="flex items-center justify-between pt-1 text-xs text-slate-500 font-medium">
            <span>Didn&apos;t receive code?</span>
            <button
              onClick={handleResend}
              className="cursor-pointer font-bold text-slate-900 hover:underline"
            >
              Resend Code
            </button>
          </div>

          <div className="relative flex py-1 items-center text-xs">
            <div className="flex-grow border-t border-slate-200" />
            <span className="mx-4 flex-shrink text-[10px] font-bold tracking-wider text-slate-400 uppercase">Simulator Quick-Fill</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          <button
            type="button"
            onClick={() => setCode("123456")}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-2.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900 hover:bg-slate-50"
          >
            Auto-fill mock code: <span className="font-bold text-slate-900 ml-1">123456</span>
          </button>
        </Card>
      </div>
    </div>
  );
}
