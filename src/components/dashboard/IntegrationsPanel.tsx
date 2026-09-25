"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Check, AlertCircle, Plug, X, Link2, Link2Off } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiGetIntegrationsStatus, apiGetQuickBooksStatus, apiConnectQuickBooks, apiDisconnectProvider } from "../../lib/api/integrations";




export interface IntegrationsPanelProps {
  onSync?: (providerId: string) => void;
  onDisconnect?: (providerId: string) => void;
  title?: string;
  subtitle?: string;
}

interface IntegrationApp {
  id: string;
  name: string;
  fullName: string;
  desc: string;
  logo: string;
  path: string;
  category: string;
}

const INTEGRATIONS_LIST: IntegrationApp[] = [
  {
    id: "quickbooks",
    name: "QuickBooks",
    fullName: "QuickBooks Online & Desktop",
    desc: "Import & sync invoices, bills, and vendor ledgers directly from QuickBooks company.",
    logo: "/quickbook.png",
    path: "/api/auth/quickbooks/connect",
    category: "Accounting & ERP",
  },
  {
    id: "xero",
    name: "Xero",
    fullName: "Xero Accounting & Invoicing",
    desc: "Sync invoices, disbursements, and reconciliation feeds from Xero organisation.",
    logo: "/xero.png",
    path: "/api/auth/xero/connect",
    category: "Accounting & ERP",
  },
  {
    id: "sage",
    name: "Sage Intacct",
    fullName: "Sage Business Cloud & Intacct",
    desc: "Pull enterprise ledgers, vendor bills, and real-time cash flow from Sage.",
    logo: "/sage.png",
    path: "/api/auth/sage/connect",
    category: "Accounting & ERP",
  },
  {
    id: "netsuite",
    name: "NetSuite",
    fullName: "Oracle NetSuite ERP & CRM",
    desc: "Enterprise financial synchronization, vendor bills, and multi-currency ledgers.",
    logo: "/netsuite.png",
    path: "/api/auth/netsuite/connect",
    category: "Enterprise ERP & CRM",
  },
  {
    id: "oracle",
    name: "Oracle Cloud",
    fullName: "Oracle Cloud Financials & CRM",
    desc: "Direct integration with Oracle Cloud ERP treasury and vendor approval queues.",
    logo: "/oracle.png",
    path: "/api/auth/oracle/connect",
    category: "Enterprise ERP & CRM",
  },
];

export function IntegrationsPanel({
  onSync,
  onDisconnect,
  title = "Integrations",
  subtitle = "Connect accounting tools to sync invoices automatically.",
}: IntegrationsPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"loading" | "success" | "error" | null>(null);


  // 1. Restore real backend OAuth status checking and URL callback handling
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const qbConnected = searchParams.get("qb_connected");
      const qbError = searchParams.get("qb_error");
      const xeroConnected = searchParams.get("xero_connected");
      const xeroError = searchParams.get("xero_error");

      if (qbConnected === "true") {
        setConnectedIds((prev) => {
          const updated = Array.from(new Set([...prev, "quickbooks"]));
          localStorage.setItem("agncypay_connected_apps", JSON.stringify(updated));
          return updated;
        });
        setStatusType("success");
        setStatusMessage("QuickBooks connected successfully! Syncing invoice ledger...");
        if (onSync) onSync("quickbooks");
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (qbError) {
        setStatusType("error");
        setStatusMessage(`QuickBooks connection error: ${qbError.replace(/_/g, " ")}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (xeroConnected === "true") {
        setConnectedIds((prev) => {
          const updated = Array.from(new Set([...prev, "xero"]));
          localStorage.setItem("agncypay_connected_apps", JSON.stringify(updated));
          return updated;
        });
        setStatusType("success");
        setStatusMessage("Xero connected successfully! Syncing invoice ledger...");
        if (onSync) onSync("xero");
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (xeroError) {
        setStatusType("error");
        setStatusMessage(`Xero connection error: ${xeroError.replace(/_/g, " ")}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // Check backend QuickBooks & Integrations status
    apiGetQuickBooksStatus()
      .then((qbData) => {
        if (qbData && qbData.connected) {
          setConnectedIds((prev) => Array.from(new Set([...prev, "quickbooks"])));
        }
      })
      .catch(() => {});

    apiGetIntegrationsStatus()
      .then((data: any) => {
        setConnectedIds((prev) => {
          const backendList = [...prev];
          let changed = false;
          if (data.qboConnected && !backendList.includes("quickbooks")) {
            backendList.push("quickbooks");
            changed = true;
            if (onSync) onSync("quickbooks");
          }
          if (changed) {
            localStorage.setItem("agncypay_connected_apps", JSON.stringify(backendList));
          }
          return backendList;
        });
      })
      .catch(() => {
        // Fallback to local storage if API check is unavailable
      });



    // Load saved preferences from localStorage
    const saved = localStorage.getItem("agncypay_connected_apps");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConnectedIds((prev) => Array.from(new Set([...prev, ...parsed])));
        }
      } catch (e) {
        console.error("Error parsing saved connected apps", e);
      }
    }
  }, [onSync]);

  const saveConnectedApps = (ids: string[]) => {
    setConnectedIds(ids);
    localStorage.setItem("agncypay_connected_apps", JSON.stringify(ids));
  };

  // 2. Real browser redirect for OAuth connection & API invoice fetching
  const handleConnect = useCallback(
    (app: IntegrationApp) => {
      // Execute real browser navigation to backend OAuth endpoints (QuickBooks sandbox, Xero, etc.)
      if (app.id === "quickbooks") {
        setConnectingId(app.id);
        setStatusType("loading");
        setStatusMessage(`Redirecting to ${app.fullName} authentication portal...`);
        apiConnectQuickBooks()
          .then((res: any) => {
            window.location.href = res.url || "http://localhost:3001/api/v1/quickbooks/connect";
          })

          .catch(() => {
            window.location.href = "http://localhost:3001/api/v1/quickbooks/connect";
          });
        return;
      }

      if (app.id === "xero" || app.path.startsWith("/api/auth/")) {
        setConnectingId(app.id);
        setStatusType("loading");
        setStatusMessage(`Redirecting to ${app.fullName} authentication portal...`);
        window.location.href = app.path;
        return;
      }

      // Fallback for tools without live OAuth keys in current dev environment
      setConnectingId(app.id);
      setTimeout(() => {
        const updated = Array.from(new Set([...connectedIds, app.id]));
        saveConnectedApps(updated);
        setConnectingId(null);
        setStatusType("success");
        setStatusMessage(`Connected ${app.name} ledger.`);
        if (onSync) onSync(app.id);
      }, 600);
    },
    [connectedIds, onSync]
  );

  // 3. Real backend disconnect call
  const handleDisconnectApp = useCallback(
    async (app: IntegrationApp) => {
      if (app.id === "quickbooks") {
        try {
          await fetch("/api/auth/quickbooks/disconnect", { method: "POST" });
        } catch (e) {
          console.error("QB disconnect error", e);
        }
      } else if (app.id === "xero") {
        try {
          await fetch("/api/auth/xero/disconnect", { method: "POST" });
        } catch (e) {
          console.error("Xero disconnect error", e);
        }
      }

      const updated = connectedIds.filter((id) => id !== app.id);
      saveConnectedApps(updated);
      setStatusType("success");
      setStatusMessage(`${app.name} integration disconnected.`);
      if (onDisconnect) onDisconnect(app.id);

      setTimeout(() => {
        setStatusType(null);
        setStatusMessage(null);
      }, 3000);
    },
    [connectedIds, onDisconnect]
  );

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs relative text-left transition-all overflow-hidden">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Plug className="h-5 w-5 text-slate-900" />
            {title}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="text-xs font-bold text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>All Integrations</span>
          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">5</span>
        </button>
      </div>

      {/* Status Alert Banner */}
      <AnimatePresence>
        {statusMessage && statusType && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mt-4 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-xs ${
              statusType === "loading"
                ? "bg-slate-100 text-slate-800 border border-slate-200"
                : statusType === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {statusType === "loading" && <RefreshCw className="h-4 w-4 animate-spin shrink-0 text-slate-700" />}
            {statusType === "success" && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
            {statusType === "error" && <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />}
            <span>{statusMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5 Horizontal Tiles with Visible Logos & + Badges */}
      <div className="mt-6 pt-1 flex items-start gap-4 sm:gap-5 overflow-x-auto pb-2 scrollbar-none">
        {INTEGRATIONS_LIST.map((app) => {
          const isConn = connectedIds.includes(app.id);

          return (
            <motion.div
              key={app.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsModalOpen(true)}
              className="flex flex-col items-center cursor-pointer group shrink-0 w-20 sm:w-22"
            >
              {/* Tile Box with Badge */}
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border transition-all duration-200 flex items-center justify-center shadow-xs overflow-hidden relative ${
                  isConn
                    ? "bg-emerald-50/40 border-emerald-300 group-hover:border-emerald-500 p-2 sm:p-2.5"
                    : "bg-slate-50 border-slate-200 group-hover:border-slate-400 group-hover:shadow-md p-2.5 sm:p-3"
                }`}
              >
                {/* Official Brand Logo */}
                <img 
                  src={app.logo} 
                  alt={app.name} 
                  className={`w-full h-full object-contain filter drop-shadow-xs transition-transform duration-200 group-hover:scale-110 ${!isConn ? "opacity-85 group-hover:opacity-100" : ""}`} 
                />

                {/* Status Badge (Checkmark when connected) */}
                {isConn && (
                  <div className="absolute top-1 right-1">
                    <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                  </div>
                )}
              </div>

              {/* Tile Label */}
              <span className="text-xs font-bold mt-2 text-slate-800 group-hover:text-slate-950 transition-colors text-center truncate w-full">
                {app.name}
              </span>

              {/* Sub-label */}
              {isConn ? (
                <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Synced
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 group-hover:text-slate-800 font-semibold mt-0.5 text-center truncate w-full flex items-center justify-center gap-0.5">
                  Connect
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* CRM Dialogue Box (Modal) */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/85 px-4 py-8 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-[620px] rounded-2xl border border-slate-200 dark:border-white/20 bg-white dark:bg-[#0A0A0A] shadow-2xl overflow-hidden text-left flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 px-6 py-5 bg-slate-50/70 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 shadow-xs">
                    <Plug className="h-5 w-5 text-slate-800 dark:text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">Connect Accounting & CRM Tools</h2>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                      Select software to sync invoice ledgers automatically into AgncyPay treasury.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.08] hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal App List */}
              <div className="p-6 space-y-3.5 overflow-y-auto flex-1">
                {INTEGRATIONS_LIST.map((app) => {
                  const isConn = connectedIds.includes(app.id);
                  const isConnLoading = connectingId === app.id;

                  return (
                    <div
                      key={app.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 sm:p-5 transition-all ${
                        isConn
                          ? "border-slate-300 dark:border-white/25 bg-slate-50/70 dark:bg-white/[0.05] shadow-xs"
                          : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.015] hover:border-slate-300 dark:hover:border-white/25 hover:bg-slate-50/50 dark:hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-50 border border-slate-200 dark:border-white/15 p-0 overflow-hidden flex items-center justify-center shadow-xs">
                          <img src={app.logo} alt={app.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{app.fullName}</p>
                            {isConn && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Connected
                              </span>
                            )}
                            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-white/10">
                              {app.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                            {app.desc}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="shrink-0 self-end sm:self-center">
                        {isConnLoading ? (
                          <button
                            type="button"
                            disabled
                            className="flex items-center gap-2 h-9 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/10 px-4 text-xs font-bold text-slate-400 dark:text-neutral-500 cursor-not-allowed"
                          >
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-600 dark:text-white" />
                            Connecting...
                          </button>
                        ) : isConn ? (
                          <button
                            type="button"
                            onClick={() => handleDisconnectApp(app)}
                            className="flex items-center gap-2 h-9 rounded-xl border border-slate-200 dark:border-white/20 bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white px-4 text-xs font-bold text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-xs group"
                          >
                            <Link2Off className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                            Disconnect
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleConnect(app)}
                            className="flex items-center gap-2 h-9 rounded-xl border border-slate-900 dark:border-white bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-neutral-200 px-4.5 text-xs font-bold text-white dark:text-slate-900 transition-all cursor-pointer shadow-xs active:scale-95 group"
                          >
                            <Link2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-200 dark:border-white/10 px-6 py-4 bg-slate-50/70 dark:bg-white/[0.01] flex items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500 dark:text-neutral-500 leading-snug">
                  Connecting an accounting tool imports your invoices into AgncyPay for instant automated settlements.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer shrink-0"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default IntegrationsPanel;
