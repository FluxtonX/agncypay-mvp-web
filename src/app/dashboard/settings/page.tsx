"use client";
export const dynamic = "force-dynamic";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Building2,
  CreditCard,
  KeyRound,
  Loader2,
  LogOut,
  Plug,
  Save,
  Shield,
  User,
  X,
  Check,
} from "lucide-react";
import { IntegrationsMarketplace } from "@/components/dashboard/integrations/IntegrationsMarketplace";
import { useApp } from "@/context/AppContext";

type UserRole = "Admin" | "Approver" | "Viewer";
type QuickAction = "payment" | "notifications" | "api" | null;

type TeamUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

const initialUsers: TeamUser[] = [
  { id: "john", name: "John Doe", email: "john@acme.com", role: "Admin" },
  { id: "sarah", name: "Sarah Smith", email: "sarah@acme.com", role: "Approver" },
];

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs ${className}`}>
      {children}
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
      />
    </label>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-xs">
      <section className="w-full max-w-[500px] rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl text-slate-900">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </section>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { logoutUser } = useApp();
  const [organization, setOrganization] = useState({
    companyName: "Acme Corporation Inc.",
    ein: "XX-XXXXXXX",
    address: "123 Main St, San Francisco, CA 94105",
  });
  const [users, setUsers] = useState<TeamUser[]>(initialUsers);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30 min");
  const [saveMessage, setSaveMessage] = useState("");
  const [quickAction, setQuickAction] = useState<QuickAction>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const updateRole = (userId: string, role: UserRole) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === userId ? { ...user, role } : user))
    );
  };

  const saveOrganization = () => {
    setSaveMessage("Changes saved successfully");
    window.setTimeout(() => setSaveMessage(""), 2000);
  };

  const inviteTeamMember = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailName = inviteEmail.split("@")[0] || "New User";
    const displayName = emailName
      .split(/[._-]/)
      .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
      .join(" ");

    setUsers((currentUsers) => [
      ...currentUsers,
      {
        id: `${emailName}-${Date.now()}`,
        name: displayName,
        email: inviteEmail,
        role: "Viewer",
      },
    ]);
    setInviteEmail("");
    setInviteOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/quickbooks/disconnect", { method: "POST" });
    } catch (error) {
      console.warn("QuickBooks disconnect failed during logout; clearing local session anyway.", error);
    } finally {
      await logoutUser();
      router.push("/auth/login");
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your organization profile, team members, integrations, and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Section>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Organization
                </h2>
                <p className="text-xs text-slate-500">
                  Manage your company legal information and billing details.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextInput
                label="Company Name"
                value={organization.companyName}
                onChange={(value) =>
                  setOrganization((current) => ({ ...current, companyName: value }))
                }
              />
              <TextInput
                label="EIN / Tax ID"
                value={organization.ein}
                onChange={(value) =>
                  setOrganization((current) => ({ ...current, ein: value }))
                }
              />
              <TextInput
                label="Business Address"
                value={organization.address}
                onChange={(value) =>
                  setOrganization((current) => ({ ...current, address: value }))
                }
                className="md:col-span-2"
              />
            </div>

            <div className="mt-5 flex items-center gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={saveOrganization}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
              {saveMessage && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  {saveMessage}
                </span>
              )}
            </div>
          </Section>

          <Section>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Users &amp; Permissions
                </h2>
                <p className="text-xs text-slate-500">
                  Manage workspace team members and authorization roles.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>
                  <select
                    value={user.role}
                    onChange={(event) =>
                      updateRole(user.id, event.target.value as UserRole)
                    }
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-slate-900 sm:w-[130px]"
                  >
                    <option>Admin</option>
                    <option>Approver</option>
                    <option>Viewer</option>
                  </select>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="mt-4 h-9 w-full rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Invite Team Member
            </button>
          </Section>

          <Section>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Security
                </h2>
                <p className="text-xs text-slate-500">
                  Configure authentication policies and session controls.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-5 p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Multi-factor Authentication (MFA)
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Require 2-step verification code for all sensitive payouts
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMfaEnabled((enabled) => !enabled)}
                aria-pressed={mfaEnabled}
                className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  mfaEnabled ? "bg-slate-900" : "bg-slate-300"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full bg-white shadow-xs transition-transform ${
                    mfaEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-3 p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Session Timeout
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automatically log out inactive users to protect data
                </p>
              </div>
              <select
                value={sessionTimeout}
                onChange={(event) => setSessionTimeout(event.target.value)}
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-slate-900 sm:w-[130px]"
              >
                <option>15 min</option>
                <option>30 min</option>
                <option>60 min</option>
              </select>
            </div>
          </Section>

          <Section>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Plug className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Integrations Marketplace
                </h2>
                <p className="text-xs text-slate-500">
                  Connect accounting ERPs, banking rails, and payment gateways.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <IntegrationsMarketplace />
            </div>
          </Section>
        </div>

        <aside className="space-y-6">
          <Section>
            <h2 className="text-base font-bold text-slate-900">
              Account Session
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Logging out ends your current active session and safely disconnects temporary tokens.
            </p>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-60 cursor-pointer shadow-2xs"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {isLoggingOut ? "Logging out..." : "Log Out of Workspace"}
            </button>
          </Section>

          <Section>
            <h2 className="text-base font-bold text-slate-900">
              Quick Shortcuts
            </h2>
            <div className="mt-4 space-y-2">
              {[
                ["payment", CreditCard, "Payment Methods"],
                ["notifications", Bell, "Notification Preferences"],
                ["api", KeyRound, "Developer API Keys"],
              ].map(([action, Icon, label]) => {
                const ActionIcon = Icon as typeof CreditCard;

                return (
                  <button
                    key={action as string}
                    type="button"
                    onClick={() => setQuickAction(action as QuickAction)}
                    className="flex h-10 w-full items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 px-3.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
                  >
                    <ActionIcon className="h-4 w-4 text-slate-500" />
                    {label as string}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section>
            <h2 className="text-base font-bold text-slate-900">
              Need Help?
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Contact our enterprise support team for assistance with payouts, ERP syncing, or custom split rules.
            </p>
            <a
              href="mailto:support@agncypay.com?subject=Settings support"
              className="mt-4 flex h-9 w-full items-center justify-center rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Contact Support
            </a>
          </Section>
        </aside>
      </div>

      {inviteOpen && (
        <Modal title="Invite Team Member" onClose={() => setInviteOpen(false)}>
          <form onSubmit={inviteTeamMember} className="space-y-4">
            <TextInput
              label="Work Email"
              value={inviteEmail}
              onChange={setInviteEmail}
            />
            <button
              type="submit"
              className="h-10 w-full rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              Send Workspace Invite
            </button>
          </form>
        </Modal>
      )}

      {quickAction && (
        <Modal
          title={
            quickAction === "payment"
              ? "Payment Methods"
              : quickAction === "notifications"
                ? "Notification Preferences"
                : "Developer API Keys"
          }
          onClose={() => setQuickAction(null)}
        >
          {quickAction === "payment" && (
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <span className="font-bold text-slate-900 block">Primary Account</span>
                <p className="text-slate-500 mt-0.5">Chase Business Checking ••••1234 (Active ACH Rail)</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <span className="font-bold text-slate-900 block">Backup Settlement Account</span>
                <p className="text-slate-500 mt-0.5">Wells Fargo Business Savings ••••5678</p>
              </div>
            </div>
          )}
          {quickAction === "notifications" && (
            <div className="space-y-2">
              {["Payment approvals and disbursements", "Failed settlements and chargebacks", "Weekly accounting ledger reports"].map((item) => (
                <label
                  key={item}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 text-xs font-medium text-slate-800 cursor-pointer hover:bg-slate-100/60 transition-colors"
                >
                  {item}
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-slate-900 accent-slate-900" />
                </label>
              ))}
            </div>
          )}
          {quickAction === "api" && (
            <div className="space-y-3 text-xs text-slate-700">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-slate-900">
                pk_live_agncypay_••••••••4f8a
              </div>
              <button
                type="button"
                onClick={() => alert("New API key generated for this workspace.")}
                className="h-10 w-full rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                Generate New Key
              </button>
            </div>
          )}
        </Modal>
      )}
    </main>
  );
}
