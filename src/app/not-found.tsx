"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-slate-900 selection:text-white">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="transition-opacity hover:opacity-85">
            <img
              src="/agncypaybrand-dark.png"
              alt="AgncyPay"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <Link
            href="/auth/login"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign in to Workspace
          </Link>
        </div>
      </header>

      {/* Main 404 Hero */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center text-slate-800 shadow-2xs mb-6">
          <FileQuestion className="w-8 h-8 text-slate-600" />
        </div>

        <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200 uppercase tracking-wider mb-3">
          Error 404 • Resource Not Found
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Page does not exist
        </h1>

        <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md">
          The requested fintech workspace URL, invoice transaction, or compliance ledger record could not be found or may have been archived.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full sm:w-auto">
          <Link
            href="/branddashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} AgncyPay Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
            <Link href="/auth/login" className="hover:text-slate-600 transition-colors">Sign in</Link>
            <Link href="/auth/register" className="hover:text-slate-600 transition-colors">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
