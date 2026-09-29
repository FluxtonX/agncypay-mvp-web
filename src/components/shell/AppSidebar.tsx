"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Wallet,
  Settings,
  CreditCard,
  BarChart3,
  ShieldCheck,
  Landmark,
  Layers,
  Network,
  PieChart,
  ArrowUpRight,
  ArrowLeftRight,
  FileText,
  LogOut,
  ChevronDown,
  Building2,
  Plus,
  ChevronsUpDown,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { NAVIGATION_CONFIG, NavItem } from "../../config/navigation.config";
import { normalizeWorkspaceType, WorkspaceType } from "../../types/workspace";
import { cn } from "../../lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Receipt,
  Users,
  Wallet,
  Settings,
  CreditCard,
  BarChart3,
  ShieldCheck,
  Landmark,
  Layers,
  Network,
  PieChart,
  ArrowUpRight,
  ArrowLeftRight,
  FileText,
};

export function AppSidebar({
  onOpenCommandPalette,
  className,
}: {
  onOpenCommandPalette?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, switchWorkspace, logoutUser } = useApp();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const workspaceType: WorkspaceType = state.user
    ? normalizeWorkspaceType(state.user.accountType)
    : "brand";

  const sections = NAVIGATION_CONFIG[workspaceType] || NAVIGATION_CONFIG.brand;

  const activeWorkspace = state.workspaces.find((w) => w.id === state.activeWorkspaceId) || {
    name: state.user?.fullName || "AgncyPay Account",
    agncyId: state.user?.agncyId || "AP-000000",
    type: workspaceType,
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push("/auth/login");
  };

  return (
    <aside
      className={cn(
        "w-64 shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between select-none h-screen sticky top-0 z-30 transition-all",
        className
      )}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand / Logo + Workspace Switcher */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
          <Link
            href={workspaceType === "agency" ? "/agencydashboard" : "/branddashboard"}
            className="flex items-center gap-2 mb-4 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-extrabold text-sm shadow-xs">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-slate-700 transition-colors">
                AgncyPay
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Financial Operating System
              </span>
            </div>
          </Link>

          {/* Active Workspace Selector */}
          <div className="relative">
            <button
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-left transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {activeWorkspace.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {activeWorkspace.type.toUpperCase()}
                  </div>
                </div>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Switcher Dropdown */}
            {showWorkspaceMenu && (
              <div className="absolute top-full left-0 right-0 mt-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Available Workspaces
                </div>
                {state.workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      switchWorkspace(ws.id);
                      setShowWorkspaceMenu(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors",
                      ws.id === state.activeWorkspaceId
                        ? "bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-100"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <span className="truncate">{ws.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{ws.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.title && (
                <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const IconComponent = ICON_MAP[item.iconName] || LayoutDashboard;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/branddashboard" &&
                    item.href !== "/agencydashboard" &&
                    item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group",
                      isActive
                        ? "bg-slate-900 text-white font-semibold shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom User Area */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center text-xs font-bold shrink-0">
                {(state.user?.fullName || "AP").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {state.user?.fullName || "Account"}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {state.user?.email || "user@agncypay.com"}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
