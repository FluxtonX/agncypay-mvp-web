"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CommercialDocument, getBrandCommercialDocuments } from "../../../lib/api/commercial-documents";
import { createPayment, getPayments, FundingInstructions, PaymentRecord } from "../../../lib/api/payments";
import { useApp } from "../../../context/AppContext";

function money(amount: string, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(amount));
}

export default function BrandInvoicesPage() {
  const { state, logoutUser } = useApp();
  const [documents, setDocuments] = useState<CommercialDocument[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string>();
  const [error, setError] = useState("");
  const [instructions, setInstructions] = useState<FundingInstructions>();

  const refresh = useCallback(async () => {
    setError("");
    try {
      const [nextDocuments, nextPayments] = await Promise.all([
        getBrandCommercialDocuments(),
        getPayments(),
      ]);
      setDocuments(nextDocuments);
      setPayments(nextPayments);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load commercial records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([getBrandCommercialDocuments(), getPayments()])
      .then(([nextDocuments, nextPayments]) => {
        if (!active) return;
        setDocuments(nextDocuments);
        setPayments(nextPayments);
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : "Unable to load commercial records.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function fund(document: CommercialDocument) {
    const version = document.versions[0];
    if (!version) return;
    setWorkingId(document.id);
    setError("");
    try {
      const result = await createPayment({
        agencyOrganizationId: document.agencyOrganizationId,
        amount: Number(version.totalAmount),
        currency: version.currency,
        commercialDocumentVersionId: version.id,
        purpose: "commercial_invoice_payment",
        idempotencyKey: `brand-invoice-${version.id}`,
      });
      setInstructions(result.fundingInstructions);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to initiate payment.");
    } finally {
      setWorkingId(undefined);
    }
  }

  const paidVersions = new Set(payments.map((payment) => payment.commercialDocumentVersionId).filter(Boolean));

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <img src="/agncypaybrand-dark.png" alt="AgncyPay" className="mb-5 h-8 w-auto" />
            <h1 className="text-3xl font-black text-slate-950">Brand invoices</h1>
            <p className="mt-2 text-sm text-slate-500">CRM-originated, Agency-approved economics. AgncyPay validates and orchestrates payment without recalculating allocations.</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <div className="font-bold text-slate-900">{state.user?.fullName}</div>
            <button onClick={() => void logoutUser()} className="mt-2 font-semibold hover:text-slate-900">Sign out</button>
          </div>
        </header>

        {error && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}
        {instructions && (
          <section className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-950">
            <h2 className="font-black">External bank funding instructions</h2>
            <p className="mt-1">Send the exact amount from the Brand&apos;s external bank. The Brand does not have an AgncyPay stored balance.</p>
            <dl className="mt-4 grid gap-2 sm:grid-cols-2">
              {Object.entries(instructions).filter(([, value]) => typeof value === "string").map(([key, value]) => (
                <div key={key}><dt className="text-xs font-bold uppercase text-emerald-700">{key}</dt><dd className="font-mono font-semibold">{String(value)}</dd></div>
              ))}
            </dl>
          </section>
        )}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5"><h2 className="font-black text-slate-900">Commercial invoice queue</h2></div>
          {loading ? <p className="p-8 text-sm text-slate-500">Loading verified invoices…</p> : documents.length === 0 ? (
            <p className="p-8 text-sm text-slate-500">No CRM invoices are mapped to this Brand yet. Your Agency controls onboarding and source-system mapping.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {documents.map((document) => {
                const version = document.versions[0];
                if (!version) return null;
                const existing = payments.find((payment) => payment.commercialDocumentVersionId === version.id);
                const eligible = version.validationStatus === "valid" && version.approval?.status === "approved";
                return (
                  <article key={document.id} className="grid gap-4 p-6 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-slate-900">{document.externalDocumentId}</h3>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{version.validationStatus}</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{version.approval?.status || "not reviewable"}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">Payable to {document.agencyOrganization?.name || document.agencyOrganizationId} · Source version {version.versionNumber}</p>
                      <p className="mt-2 text-xl font-black text-slate-950">{money(version.totalAmount, version.currency)}</p>
                    </div>
                    {existing || paidVersions.has(version.id) ? (
                      <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">Payment {existing?.status || "created"}</div>
                    ) : (
                      <button disabled={!eligible || workingId === document.id} onClick={() => void fund(document)} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
                        {workingId === document.id ? "Preparing…" : eligible ? "Get bank instructions" : "Awaiting Agency approval"}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
        <p className="mt-6 text-xs text-slate-400">Need help? <Link href="/auth/login" className="font-bold text-slate-600">Return to sign in</Link></p>
      </div>
    </main>
  );
}
