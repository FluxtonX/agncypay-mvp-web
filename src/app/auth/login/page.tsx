"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiLogin } from "../../../lib/api/auth";
import { useApp } from "../../../context/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [portal, setPortal] = useState<"brand" | "agency">("brand");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await apiLogin({ email: email.trim().toLowerCase(), password });
      if (result.user.accountType === "talent") {
        localStorage.removeItem("agncypay_token");
        localStorage.removeItem("agncypay_refresh_token");
        throw new Error("Talent accounts must use the AgncyPay Talent mobile app.");
      }
      if (result.user.accountType !== portal) {
        localStorage.removeItem("agncypay_token");
        localStorage.removeItem("agncypay_refresh_token");
        throw new Error(`This account belongs to the ${result.user.accountType} portal.`);
      }
      loginUser(result.user.email, result.user.fullName, result.user.accountType, {
        uid: result.user.id,
        agencyId: result.user.agncyId,
        kybStatus: result.user.kybStatus,
      });
      router.replace(
        result.user.accountType === "brand"
          ? "/branddashboard/invoices"
          : "/agencydashboard/invoices",
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900";
  return (
    <main className="min-h-screen grid place-items-center bg-slate-50 p-6">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        <img src="/agncypaybrand-dark.png" alt="AgncyPay" className="mx-auto mb-8 h-10 w-auto" />
        <h1 className="text-2xl font-black text-slate-950">Sign in</h1>
        <p className="mt-2 text-sm text-slate-500">Brand and Agency access is invitation-only.</p>
        <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-bold">
          {(["brand", "agency"] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setPortal(role)}
              className={`rounded-lg px-3 py-2 capitalize ${portal === role ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
            >
              {role}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-bold text-slate-700">
            Email
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} autoComplete="email" />
          </label>
          <label className="block text-sm font-bold text-slate-700">
            Password
            <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} autoComplete="current-password" />
          </label>
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
          <button disabled={submitting} className="w-full rounded-xl bg-slate-950 px-4 py-3 font-bold text-white disabled:opacity-60">
            {submitting ? "Signing in…" : `Sign in to ${portal}`}
          </button>
        </form>
        <div className="mt-6 flex justify-between text-sm">
          <Link href="/auth/forgot-password" className="font-semibold text-slate-600">Forgot password?</Link>
          <Link href="/auth/register" className="font-semibold text-slate-900">Activate invitation</Link>
        </div>
      </section>
    </main>
  );
}
