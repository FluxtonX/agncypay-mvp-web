"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  CreditCard,
  FileText,
  HelpCircle,
  Landmark,
  LayoutGrid,
  LogOut,
  Network,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useApp } from "../../context/AppContext";
import { Permission, WorkspaceType, normalizeWorkspaceType } from "../../types/workspace";

type DashboardNavItem = {
  label: string;
  path: string;
  activePath: string;
  icon: LucideIcon;
  permission?: Permission;
};

const secondaryNav = [
  { label: "Settings", path: "/dashboard/settings", activePath: "/dashboard/settings", icon: Settings },
  { label: "Help & Support", path: "/dashboard/support", activePath: "/dashboard/support", icon: HelpCircle },
];

const navByWorkspace: Record<WorkspaceType, DashboardNavItem[]> = {
  brand: [
    { label: "Dashboard", path: "/dashboard", activePath: "/dashboard", icon: LayoutGrid },
    { label: "Invoices", path: "/dashboard/invoices", activePath: "/dashboard/invoices", icon: FileText },
    { label: "Analytics", path: "/dashboard/analytics", activePath: "/dashboard/analytics", icon: ChartNoAxesColumnIncreasing },
    { label: "Agencies", path: "/dashboard/agencies", activePath: "/dashboard/agencies", icon: Users },
  ],
  agency: [
    { label: "Dashboard", path: "/dashboard", activePath: "/dashboard", icon: LayoutGrid },
    { label: "Invoices", path: "/dashboard/invoices", activePath: "/dashboard/invoices", icon: FileText },
    { label: "Splits", path: "/dashboard/splits", activePath: "/dashboard/splits", icon: Network, permission: "view_splits" },
    { label: "Payouts", path: "/dashboard/payouts", activePath: "/dashboard/payouts", icon: BadgeDollarSign, permission: "approve_payouts" },
    { label: "Analytics", path: "/dashboard/analytics", activePath: "/dashboard/analytics", icon: ChartNoAxesColumnIncreasing },
    { label: "Clients", path: "/dashboard/clients", activePath: "/dashboard/clients", icon: BriefcaseBusiness },
  ],
  talent_independent: [
    { label: "Dashboard", path: "/dashboard", activePath: "/dashboard", icon: LayoutGrid },
    { label: "My Invoices", path: "/dashboard/invoices", activePath: "/dashboard/invoices", icon: FileText },
    { label: "Payouts", path: "/dashboard/payouts", activePath: "/dashboard/payouts", icon: BadgeDollarSign },
    { label: "Analytics", path: "/dashboard/analytics", activePath: "/dashboard/analytics", icon: ChartNoAxesColumnIncreasing },
    { label: "Profile", path: "/dashboard/profile", activePath: "/dashboard/profile", icon: UserRound },
  ],
  talent_agency: [
    { label: "Dashboard", path: "/dashboard", activePath: "/dashboard", icon: LayoutGrid },
    { label: "Payouts", path: "/dashboard/payouts", activePath: "/dashboard/payouts", icon: BadgeDollarSign },
    { label: "Assigned Invoices", path: "/dashboard/invoices", activePath: "/dashboard/invoices", icon: FileText },
    { label: "Analytics", path: "/dashboard/analytics", activePath: "/dashboard/analytics", icon: ChartNoAxesColumnIncreasing },
    { label: "Profile", path: "/dashboard/profile", activePath: "/dashboard/profile", icon: UserRound },
  ],
  mother_agency: [
    { label: "Dashboard", path: "/dashboard", activePath: "/dashboard", icon: LayoutGrid },
    { label: "Child Agencies", path: "/dashboard/agencies", activePath: "/dashboard/agencies", icon: Users },
    { label: "Vendors", path: "/dashboard/vendors", activePath: "/dashboard/vendors", icon: BriefcaseBusiness },
    { label: "Treasury", path: "/dashboard/treasury", activePath: "/dashboard/treasury", icon: Landmark, permission: "view_treasury" },
    { label: "Payouts", path: "/dashboard/payouts", activePath: "/dashboard/payouts", icon: BadgeDollarSign, permission: "approve_payouts" },
    { label: "Analytics", path: "/dashboard/analytics", activePath: "/dashboard/analytics", icon: ChartNoAxesColumnIncreasing },
    { label: "Team", path: "/dashboard/team", activePath: "/dashboard/team", icon: UsersRound, permission: "manage_team" },
  ],
};

function getWorkspaceNav(workspaceType: WorkspaceType, permissions: Permission[]) {
  return (navByWorkspace[workspaceType] ?? navByWorkspace.brand).filter(
    (item) => !item.permission || permissions.includes(item.permission)
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "AC";
}

function isNavActive(pathname: string, item: DashboardNavItem) {
  return item.activePath === "/dashboard"
    ? pathname === item.activePath
    : pathname === item.activePath || pathname.startsWith(`${item.activePath}/`);
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, logoutUser, switchWorkspace } = useApp();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const workspaceType = state.user ? normalizeWorkspaceType(state.user.accountType) : "brand";
  const activeWorkspace = state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId);
  const activeMembership = state.memberships.find(
    (membership) => membership.workspaceId === state.activeWorkspaceId
  );
  const primaryNav = getWorkspaceNav(workspaceType, activeMembership?.permissions ?? []);
  const workspaceName = activeWorkspace?.name || "Acme Corp";
  const userEmail = state.user?.email || "john@acme.com";
  const initials = getInitials(workspaceName);

  useEffect(() => {
    const closeAccountMenu = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", closeAccountMenu);

    return () => document.removeEventListener("mousedown", closeAccountMenu);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/quickbooks/disconnect", { method: "POST" });
    } catch (error) {
      console.warn("QuickBooks disconnect failed during logout; clearing local session anyway.", error);
    } finally {
      await logoutUser();
      setIsAccountOpen(false);
      router.push("/auth/login");
    }
  };

  const handleWorkspaceSwitch = (workspaceId: string) => {
    switchWorkspace(workspaceId);
    setIsAccountOpen(false);
    router.push("/dashboard");
  };

  const renderItem = (item: DashboardNavItem) => {
    const Icon = item.icon;
    const isActive = isNavActive(pathname, item);

    return (
      <Link
        key={item.label}
        href={item.path}
        className={cn(
          "flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-all duration-150",
          isActive
            ? "bg-slate-100 text-slate-950 font-bold shadow-2xs"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 stroke-[2] transition-colors",
            isActive ? "text-slate-950" : "text-slate-500"
          )}
        />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden h-screen w-[280px] shrink-0 overflow-y-auto border-r border-slate-200/90 bg-white lg:flex lg:flex-col justify-between">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-6">
        <Link href="/dashboard" aria-label="AgncyPay dashboard" className="flex items-center gap-2">
          <img
            src="/agncypaybrand.png"
            alt="AgncyPay"
            className="h-8 w-auto object-contain object-left [filter:invert(1)_brightness(0.2)]"
          />
        </Link>
        {(workspaceType === "brand" || workspaceType === "agency") && (
          <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {workspaceType === "brand" ? "Brand" : "Agency"}
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        <div>
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Menu</p>
          <div className="space-y-1">{primaryNav.map(renderItem)}</div>
        </div>

        <div>
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Preferences</p>
          <div className="space-y-1">
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.activePath || pathname.startsWith(`${item.activePath}/`);

              return (
                <Link
                  key={item.label}
                  href={item.path}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-all duration-150",
                    isActive
                      ? "bg-slate-100 text-slate-950 font-bold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 stroke-[2] transition-colors",
                      isActive ? "text-slate-950" : "text-slate-500"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div ref={accountMenuRef} className="relative shrink-0 border-t border-slate-100 p-4">
        {isAccountOpen && (
          <div className="absolute bottom-[76px] left-3 right-3 z-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            <div className="border-b border-slate-100 px-3 py-2.5">
              <p className="truncate text-sm font-bold text-slate-900 leading-tight">
                {workspaceName}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {userEmail}
              </p>
            </div>

            {state.workspaces.length > 0 && (
              <div className="border-b border-slate-100 px-2 py-2">
                <p className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Workspaces
                </p>
                <div className="max-h-[174px] space-y-1 overflow-y-auto pr-1">
                  {state.workspaces.map((workspace) => {
                    const isActive = workspace.id === state.activeWorkspaceId;

                    return (
                      <button
                        key={workspace.id}
                        type="button"
                        onClick={() => handleWorkspaceSwitch(workspace.id)}
                        className={cn(
                          "flex w-full flex-col rounded-lg border px-3 py-2 text-left transition-colors cursor-pointer",
                          isActive
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <span className="truncate text-xs font-semibold">
                          {workspace.name}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 truncate text-[11px]",
                            isActive ? "text-slate-300" : "text-slate-400"
                          )}
                        >
                          {workspace.agncyId}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Link
              href="/dashboard/settings"
              onClick={() => setIsAccountOpen(false)}
              className="mt-1 flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <UserRound className="h-4 w-4 text-slate-400" />
              Account Settings
            </Link>
            <Link
              href="/dashboard/verification"
              onClick={() => setIsAccountOpen(false)}
              className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              Security & Verification
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 flex h-9 w-full items-center gap-2.5 rounded-lg border-t border-slate-100 px-2.5 text-left text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4 text-rose-500" />
              Logout
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsAccountOpen((open) => !open)}
          aria-expanded={isAccountOpen}
          aria-label="Open account menu"
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 text-left transition-colors hover:bg-slate-100/80 cursor-pointer shadow-2xs"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-2xs">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight text-slate-900">
                {workspaceName}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {userEmail}
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-slate-400 transition-transform",
              isAccountOpen && "rotate-180"
            )}
          />
        </button>
      </div>
    </aside>
  );
}

export function MobileDashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, logoutUser, switchWorkspace } = useApp();
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const workspaceType = state.user ? normalizeWorkspaceType(state.user.accountType) : "brand";
  const activeWorkspace = state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId);
  const activeMembership = state.memberships.find(
    (membership) => membership.workspaceId === state.activeWorkspaceId
  );
  const primaryNav = getWorkspaceNav(workspaceType, activeMembership?.permissions ?? []);
  const workspaceName = activeWorkspace?.name || "Acme Corp";
  const userEmail = state.user?.email || "john@acme.com";
  const initials = getInitials(workspaceName);

  const handleMobileWorkspaceSwitch = (workspaceId: string) => {
    switchWorkspace(workspaceId);
    setIsWorkspaceOpen(false);
    router.push("/dashboard");
  };

  const handleMobileLogout = async () => {
    try {
      await fetch("/api/quickbooks/disconnect", { method: "POST" });
    } catch (error) {
      console.warn("QuickBooks disconnect failed during logout; clearing local session anyway.", error);
    } finally {
      await logoutUser();
      setIsWorkspaceOpen(false);
      router.push("/auth/login");
    }
  };

  return (
    <div className="border-b border-slate-200 bg-white lg:hidden">
      <div className="relative px-4 py-3">
        <button
          type="button"
          onClick={() => setIsWorkspaceOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-left cursor-pointer"
          aria-expanded={isWorkspaceOpen}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-2xs">
              {initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-bold leading-tight text-slate-900">
                {workspaceName}
              </span>
              <span className="block truncate text-[11px] text-slate-500">
                {userEmail}
              </span>
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-slate-400 transition-transform",
              isWorkspaceOpen && "rotate-180"
            )}
          />
        </button>

        {isWorkspaceOpen && (
          <div className="absolute left-4 right-4 top-[58px] z-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
            {state.workspaces.length > 0 && (
              <div className="max-h-[210px] space-y-1 overflow-y-auto pr-1">
                {state.workspaces.map((workspace) => {
                  const isActive = workspace.id === state.activeWorkspaceId;

                  return (
                    <button
                      key={workspace.id}
                      type="button"
                      onClick={() => handleMobileWorkspaceSwitch(workspace.id)}
                      className={cn(
                        "flex w-full flex-col rounded-lg border px-3 py-2 text-left transition-colors cursor-pointer",
                        isActive
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <span className="truncate text-xs font-semibold">
                        {workspace.name}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 truncate text-[10px]",
                          isActive ? "text-slate-300" : "text-slate-400"
                        )}
                      >
                        {workspace.agncyId}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">
              <Link
                href="/dashboard/settings"
                onClick={() => setIsWorkspaceOpen(false)}
                className="flex h-9 items-center justify-center rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={handleMobileLogout}
                className="flex h-9 items-center justify-center rounded-lg border border-slate-200 text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      <nav className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = isNavActive(pathname, item);

            return (
              <Link
                key={item.label}
                href={item.path}
                className={cn(
                  "flex h-9 shrink-0 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition-colors",
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
