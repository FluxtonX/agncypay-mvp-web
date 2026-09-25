"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";
import { useApp } from "../../context/AppContext";

export interface AppTopbarProps {
  onOpenCommandPalette: () => void;
  onToggleMobileMenu: () => void;
}

export function AppTopbar({
  onOpenCommandPalette,
  onToggleMobileMenu,
}: AppTopbarProps) {
  const { state } = useApp();
  const [isDark, setIsDark] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      root.classList.add("light");
      setIsDark(false);
      localStorage.setItem("agncypay_theme_agency", "light");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
      setIsDark(true);
      localStorage.setItem("agncypay_theme_agency", "dark");
    }
  };

  return (
    <header className="h-16 shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Left: Mobile hamburger + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Breadcrumbs />
      </div>

      {/* Right: Search / Command trigger + Network pill + Notifications + Theme */}
      <div className="flex items-center gap-3">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs cursor-pointer group shadow-2xs"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
          <span className="group-hover:text-slate-600 dark:group-hover:text-slate-300">
            Search or command...
          </span>
          <kbd className="ml-3 px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-500">
            ⌘K
          </kbd>
        </button>


        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative shadow-2xs"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-900 dark:bg-white ring-2 ring-white dark:ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Notifications
                </span>
                <span className="text-[10px] text-slate-400 font-mono">3 unread</span>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    Invoice Paid ($14,500.00)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Adidas Campaign Net-30 settled via ACH.
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">10m ago</div>
                </div>
                <div className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs transition-colors">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    KYB Verification In Review
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Federal EIN documents submitted to FinCEN gateway.
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">2h ago</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
