"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiCreateInvitation } from "../../../lib/api/auth";
import { createCrmConnection, getCrmConfig, CrmConnection } from "../../../lib/api/crm";
import { provisionAgencyRails } from "../../../lib/api/payments";
import { apiGetMe } from "../../../lib/api/users";

export default function AgencySettingsPage() {
  const [organizationId, setOrganizationId] = useState("");
  const [connections, setConnections] = useState<CrmConnection[]>([]);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteType, setInviteType] = useState<"brand" | "talent">("brand");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([apiGetMe(), getCrmConfig()])
      .then(([profile, crm]) => {
        setOrganizationId(profile.organizations.find((item) => item.type === "agency")?.id || "");
        setConnections(crm.connections);
        setWebhookUrl(crm.webhookUrl);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load Agency settings."));
  }, []);

  async function invite(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(""); setResult("");
    try {
      if (!organizationId) throw new Error("Agency organization identity is unavailable.");
      const invitation = await apiCreateInvitation({
        organizationId,
        email: inviteEmail.trim().toLowerCase(),
        accountType: inviteType,
        relationshipType: inviteType === "brand" ? "agency_brand_user" : "represented_talent",
      });
      const link = inviteType === "brand"
        ? `${window.location.origin}/auth/register?token=${encodeURIComponent(invitation.token)}`
        : `agncypay://activate?token=${encodeURIComponent(invitation.token)}`;
      setResult(`Single-use ${inviteType} invitation: ${link}`);
      setInviteEmail("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Invitation failed."); }
    finally { setBusy(false); }
  }

  async function addCrm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setResult("");
    const form = new FormData(event.currentTarget);
    try {
      const created = await createCrmConnection(String(form.get("displayName") || "CRM webhook"));
      setResult(`Copy this API key now; it will not be shown again: ${created.apiKey}`);
      const crm = await getCrmConfig(); setConnections(crm.connections); setWebhookUrl(crm.webhookUrl);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Connection creation failed."); }
    finally { setBusy(false); }
  }

  async function rails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setResult("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await provisionAgencyRails({
        accountName: String(form.get("accountName")), bankName: String(form.get("bankName")),
        accountNumber: String(form.get("accountNumber")), routingNumber: String(form.get("routingNumber")),
        currency: String(form.get("currency") || "USD"),
      });
      setResult(`Agency payment rails are ready for organization ${response.agencyOrganizationId}.`);
      event.currentTarget.reset();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Rail provisioning failed."); }
    finally { setBusy(false); }
  }

  const input = "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900";
  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-8"><div className="mx-auto max-w-5xl">
      <header className="mb-8"><img src="/agncypaybrand-dark.png" alt="AgncyPay" className="mb-5 h-8"/><h1 className="text-3xl font-black">Agency network setup</h1><p className="mt-2 text-sm text-slate-500">Permissioned onboarding, source connections, and provider-backed bank rails.</p></header>
      {error && <p className="mb-5 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}
      {result && <p className="mb-5 break-all rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{result}</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={invite} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-black">Invite network participant</h2><p className="mt-1 text-sm text-slate-500">Brand portals originate here. Talent receives a mobile-app activation link.</p><label className="mt-5 block text-sm font-bold">Participant type<select value={inviteType} onChange={(e) => setInviteType(e.target.value as "brand" | "talent")} className={input}><option value="brand">Brand</option><option value="talent">Talent</option></select></label><label className="mt-4 block text-sm font-bold">Email<input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className={input}/></label><button disabled={busy} className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">Create single-use invitation</button></form>
        <form onSubmit={addCrm} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-black">CRM/accounting source</h2><p className="mt-1 text-sm text-slate-500">Generic connector today; additional platforms use the same source-connection boundary.</p><label className="mt-5 block text-sm font-bold">Connection name<input name="displayName" required className={input} placeholder="Production CRM"/></label><button disabled={busy} className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">Create webhook connection</button><p className="mt-4 break-all text-xs text-slate-500">Endpoint: {webhookUrl || "Loading…"}</p><ul className="mt-3 space-y-2 text-xs">{connections.map((item) => <li key={item.id} className="rounded-lg bg-slate-50 p-2 font-semibold">{item.displayName} · {item.status}</li>)}</ul></form>
        <form onSubmit={rails} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"><h2 className="text-lg font-black">Agency external bank rails</h2><p className="mt-1 text-sm text-slate-500">Creates provider recipient and collection mappings behind the generic PaymentProvider abstraction.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Account name<input name="accountName" required className={input}/></label><label className="text-sm font-bold">Bank name<input name="bankName" required className={input}/></label><label className="text-sm font-bold">Account number<input name="accountNumber" required className={input} autoComplete="off"/></label><label className="text-sm font-bold">Routing number<input name="routingNumber" required className={input} autoComplete="off"/></label><label className="text-sm font-bold">Currency<input name="currency" defaultValue="USD" maxLength={3} className={input}/></label></div><button disabled={busy} className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">Provision rails</button></form>
      </div>
    </div></main>
  );
}
