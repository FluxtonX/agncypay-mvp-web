"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiAcceptInvitation } from "../../../lib/api/auth";
import { useApp } from "../../../context/AppContext";

function InvitationForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { loginUser } = useApp();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const token = params.get("token") || "";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!token) return setError("This invitation link is missing its token.");
    if (!fullName.trim()) return setError("Your name is required.");
    if (password.length < 12) return setError("Password must be at least 12 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setSubmitting(true);
    try {
      const result = await apiAcceptInvitation({ token, fullName: fullName.trim(), password });
      if (result.user.accountType === "talent") {
        throw new Error("Talent invitations must be completed in the AgncyPay Talent mobile app.");
      }
      loginUser(result.user.email, result.user.fullName, result.user.accountType, {
        uid: result.user.id,
        agencyId: result.user.agncyId,
        kybStatus: result.user.kybStatus,
      });
      router.replace(result.user.accountType === "brand" ? "/branddashboard/invoices" : "/agencydashboard/invoices");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Invitation activation failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center bg-slate-50 p-6">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        <img src="/agncypaybrand-dark.png" alt="AgncyPay" className="mx-auto mb-8 h-10 w-auto" />
        <h1 className="text-2xl font-black text-slate-900">Activate your invitation</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          AgncyPay is a permissioned network. Brand and Agency accounts are created only through an approved Agency invitation.
        </p>
        {!token ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Ask your Agency administrator for a valid invitation link.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block text-sm font-bold text-slate-700">
              Full name
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-slate-900" autoComplete="name" />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900" autoComplete="new-password" />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Confirm password
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900" autoComplete="new-password" />
            </label>
            {error && <p className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
            <button disabled={submitting} className="w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-60">
              {submitting ? "Activating…" : "Activate account"}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-slate-500">
          Already active? <Link href="/auth/login" className="font-bold text-slate-900">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default function RegisterPage() {
  return <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading invitation…</div>}><InvitationForm /></Suspense>;
}
