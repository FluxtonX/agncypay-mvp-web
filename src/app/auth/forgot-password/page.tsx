"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Password reset failed:", err);
      setError(err.message || "Failed to dispatch reset link. Please check your email.");
    } finally {
      setIsLoading(false);
    }
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
            Reset account password
          </h2>
          <p className="text-sm text-slate-500">
            Submit your registered email address to receive password reset details.
          </p>
        </div>

        <Card className="border-slate-200/90 p-8 bg-white/95 backdrop-blur-xl shadow-xl shadow-slate-200/50 rounded-3xl">
          {isSubmitted ? (
            <div className="space-y-5 text-center">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                If the email matches a registered profile, a secure password modification link will arrive shortly.
              </p>
              <Link href="/auth/login" className="block pt-2">
                <Button variant="outline" className="w-full h-11 text-xs font-bold rounded-xl">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="email"
                type="email"
                label="Work Email Address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                error={error}
                leftIcon={<Mail className="h-4 w-4" />}
                placeholder="name@company.com"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-3 h-11 text-xs font-bold rounded-xl shadow-sm"
                isLoading={isLoading}
              >
                Send Reset Instructions
              </Button>

              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors pt-3"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Return to Sign In
              </Link>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
