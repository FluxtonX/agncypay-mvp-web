"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Receipt,
  Users,
  Wallet,
  Settings,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  Building2,
  FileText,
  X,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { state, switchWorkspace } = useApp();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open if parent listens
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      category: "Quick Actions",
      items: [
        {
          id: "new-invoice",
          title: "Create New Invoice",
          description: "Generate and send a client invoice with custom splits",
          icon: Plus,
          href: "/invoices",
        },
        {
          id: "send-payment",
          title: "Send Instant Payment",
          description: "Disburse payout via ACH, Wire, or USDC",
          icon: ArrowUpRight,
          href: "/payments",
        },
      ],
    },
    {
      category: "Navigation",
      items: [
        {
          id: "nav-dash",
          title: "Dashboard Overview",
          description: "Return to primary financial command center",
          icon: Building2,
          href: state.user?.accountType === "agency" ? "/agencydashboard" : "/branddashboard",
        },
        {
          id: "nav-invoices",
          title: "Payables & Invoices",
          description: "View pending approvals and incoming billings",
          icon: Receipt,
          href: "/invoices",
        },
        {
          id: "nav-creators",
          title: "Vendors & Talent Roster",
          description: "Manage payees, 1099 contracts, and bank accounts",
          icon: Users,
          href: "/creators",
        },
        {
          id: "nav-wallet",
          title: "Treasury & Wallets",
          description: "Check balances, deposit USD, manage crypto vaults",
          icon: Wallet,
          href: "/wallet",
        },
        {
          id: "nav-settings",
          title: "Workspace Settings",
          description: "KYB verification, banking integrations, and team",
          icon: Settings,
          href: "/settings",
        },
      ],
    },
    {
      category: "Workspaces",
      items: (state.workspaces || []).map((w) => ({
        id: `ws-${w.id}`,
        title: `Switch to ${w.name}`,
        description: `${w.type.toUpperCase()} • ${w.agncyId}`,
        icon: Building2,
        action: () => {
          switchWorkspace(w.id);
          onClose();
        },
      })),
    },
  ];

  const filtered = actions
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  const handleSelect = (item: any) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching commands or destinations found.
            </div>
          ) : (
            filtered.map((group) => (
              <div key={group.category} className="space-y-1">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {group.category}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-left transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {item.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                ↑↓
              </kbd>{" "}
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                ↵
              </kbd>{" "}
              Select
            </span>
          </div>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
              ESC
            </kbd>{" "}
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
