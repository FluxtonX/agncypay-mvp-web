"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CommercialDocument,
  decideCommercialVersion,
  getAgencyCommercialDocuments,
  prepareTalentFunding,
} from "../../../lib/api/commercial-documents";
import { useApp } from "../../../context/AppContext";

function money(amount: string, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(amount));
}

export default function AgencyCommercialDocumentsPage() {
  const { state, logoutUser } = useApp();
  const [documents, setDocuments] = useState<CommercialDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string>();
  const [error, setError] = useState("");
  const [funding, setFunding] = useState<Awaited<ReturnType<typeof prepareTalentFunding>>>();

  const refresh = useCallback(async () => {
    setError("");
    try { setDocuments(await getAgencyCommercialDocuments()); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load CRM documents."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let active = true;
    getAgencyCommercialDocuments()
      .then((nextDocuments) => { if (active) setDocuments(nextDocuments); })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : "Unable to load CRM documents.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function decide(versionId: string, decision: "approved" | "rejected") {
    setWorkingId(versionId);
    setError("");
    try {
      await decideCommercialVersion(versionId, decision, decision === "rejected" ? "Rejected by Agency reviewer" : undefined);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Decision failed.");
    } finally { setWorkingId(undefined); }
  }

  async function prepare(versionId: string) {
    setWorkingId(versionId);
    setError("");
    try { setFunding(await prepareTalentFunding(versionId)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to prepare Talent funding."); }
    finally { setWorkingId(undefined); }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <img src="/agncypaybrand-dark.png" alt="AgncyPay" className="mb-5 h-8 w-auto" />
            <h1 className="text-3xl font-black text-slate-950">CRM commercial documents</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">Review source-system economics exactly as supplied. AgncyPay validates identity, totals, currency, and mappings; it never calculates Agency/Talent splits.</p>
          </div>
          <div className="text-right text-sm text-slate-500"><div className="font-bold text-slate-900">{state.user?.fullName}</div><button onClick={() => void logoutUser()} className="mt-2 font-semibold hover:text-slate-900">Sign out</button></div>
        </header>

        {error && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}
        {funding && (
          <section className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-950">
            <h2 className="font-black">Agency → Talent AP balance funding</h2>
            <p className="mt-1">{funding.transferPolicy}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {funding.instructions.map((instruction) => (
                <div key={instruction.instructionId} className="rounded-xl bg-white/70 p-3">
                  <div className="font-mono text-xs font-bold">{instruction.instructionId}</div>
                  <div className="mt-1 font-black">{money(instruction.amount, instruction.currency)}</div>
                  <div className="mt-1 text-xs">CRM allocation {instruction.externalAllocationId} · {instruction.status}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5"><h2 className="font-black text-slate-900">Validation and approval queue</h2></div>
          {loading ? <p className="p-8 text-sm text-slate-500">Loading immutable source versions…</p> : documents.length === 0 ? (
            <p className="p-8 text-sm text-slate-500">No documents have been ingested from an approved CRM/accounting connection.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {documents.map((document) => {
                const version = document.versions[0];
                if (!version) return null;
                const pending = version.approval?.status === "pending";
                const approvedPayable = document.documentType === "payable" && version.approval?.status === "approved";
                return (
                  <article key={document.id} className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2"><h3 className="font-black text-slate-900">{document.externalDocumentId}</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase text-slate-600">{document.documentType}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{version.validationStatus}</span></div>
                        <p className="mt-2 text-xl font-black">{money(version.totalAmount, version.currency)}</p>
                        <p className="mt-1 text-xs text-slate-500">Immutable source version {version.versionNumber} · approval {version.approval?.status || "unavailable"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {pending && version.validationStatus === "valid" && <><button disabled={workingId === version.id} onClick={() => void decide(version.id, "rejected")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-50">Reject</button><button disabled={workingId === version.id} onClick={() => void decide(version.id, "approved")} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Approve source economics</button></>}
                        {approvedPayable && <button disabled={workingId === version.id} onClick={() => void prepare(version.id)} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Prepare exact funding</button>}
                      </div>
                    </div>
                    {version.allocations && version.allocations.length > 0 && <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr><th className="pb-2">CRM allocation</th><th className="pb-2">AP participant</th><th className="pb-2">Amount</th><th className="pb-2">Mapping</th></tr></thead><tbody>{version.allocations.map((allocation) => <tr key={allocation.id} className="border-t border-slate-100"><td className="py-3 font-mono text-xs">{allocation.externalAllocationId}</td><td className="py-3 font-mono text-xs">{allocation.beneficiaryParticipantId || "Unmapped"}</td><td className="py-3 font-bold">{money(allocation.amount, allocation.currency)}</td><td className="py-3">{allocation.status}</td></tr>)}</tbody></table></div>}
                    {version.findings.length > 0 && <ul className="mt-4 space-y-2">{version.findings.map((finding) => <li key={finding.id} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">{finding.code}: {finding.message}</li>)}</ul>}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
