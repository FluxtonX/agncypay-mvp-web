"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";

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
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-slate-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[520px] sm:max-w-[540px] space-y-7 z-10">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block transition-transform hover:scale-105 duration-200" aria-label="AgncyPay home">
            <img
              src="/agncypaybrand-dark.png"
              alt="AgncyPay"
              className="h-11 sm:h-13 w-auto object-contain mx-auto"
            />
          </Link>
          <h2 className="text-3xl sm:text-[34px] font-black text-slate-900 tracking-tight leading-tight mt-5">
            Reset account password
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-md mx-auto leading-relaxed mt-2.5">
            Submit your registered email address to receive password reset details.
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-[28px] sm:rounded-3xl p-8 sm:p-11 shadow-xl shadow-slate-200/60 relative">
          {isSubmitted ? (
            <div className="space-y-6 text-center py-2">
              <div className="h-16 w-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-xs">
                <Send className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Reset Link Dispatched
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed font-normal">
                  If the email matches a registered profile, a secure password modification link will arrive shortly.
                </p>
              </div>
              <Link href="/auth/login" className="block pt-2">
                <button
                  type="button"
                  className="w-full h-13 text-sm sm:text-base font-bold text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all cursor-pointer"
                >
                  Return to Sign In
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider block mb-2"
                >
                  Work Email Address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center justify-center">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="name@company.com"
                    className="w-full h-13 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-2xs"
                  />
                </div>
                {error && (
                  <span className="text-xs sm:text-sm text-rose-600 font-medium mt-1.5 block">
                    {error}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-13 sm:h-14 mt-3 bg-slate-950 hover:bg-slate-800 text-white text-base font-bold rounded-2xl transition-all shadow-lg shadow-slate-950/15 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ color: "#FFFFFF" }}
              >
                {isLoading ? "Sending Instructions..." : "Send Reset Instructions"}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-slate-600 hover:text-slate-950 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Return to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
