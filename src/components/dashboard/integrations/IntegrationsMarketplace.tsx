"use client";

import React, { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Loader2, Unplug } from "lucide-react";
import { erpProviders, ERPProvider } from "@/data/mock-integrations";
import { apiConnectQuickBooks } from "@/lib/api/integrations";

const mockConnectionStorageKey = "agncypay_mock_connected_integrations";

function readMockConnectedProviderIds() {
  if (typeof window === "undefined") return new Set<string>();

  try {
    return new Set(JSON.parse(window.localStorage.getItem(mockConnectionStorageKey) || "[]") as string[]);
  } catch {
    return new Set<string>();
  }
}

function writeMockConnectedProviderId(providerId: string, connected: boolean) {
  const connectedIds = readMockConnectedProviderIds();

  if (connected) {
    connectedIds.add(providerId);
  } else {
    connectedIds.delete(providerId);
  }

  window.localStorage.setItem(mockConnectionStorageKey, JSON.stringify([...connectedIds]));
}

function OAuthModal({
  provider,
  onClose,
  onSuccess,
}: {
  provider: ERPProvider;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<"auth" | "connecting" | "success">("auth");

  const handleConnect = () => {
    setStep("connecting");
    // Simulate API delay
    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-xs">
      <div className="relative w-full max-w-[460px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl text-slate-900">
        {/* 3rd Party Header */}
        <div 
          className="flex h-14 items-center px-6" 
          style={{ backgroundColor: provider.primaryColor }}
        >
          <div className="flex items-center gap-2.5 bg-white/20 px-3 py-1 rounded-lg backdrop-blur-md">
            <span className="text-sm font-bold text-white tracking-wide">{provider.name} Authorization</span>
          </div>
        </div>

        <div className="p-6">
          {step === "auth" && (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 p-3 shadow-xs border border-slate-200">
                <img src={provider.logoUrl} alt={provider.name} className="max-h-full max-w-full object-contain" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">Connect AgncyPay to {provider.name}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                AgncyPay requires secure authorization to synchronize invoices, vendor ledger records, and payout distributions.
              </p>
              
              <div className="mt-6 flex w-full flex-col gap-2.5">
                <button
                  onClick={handleConnect}
                  style={{ backgroundColor: provider.primaryColor }}
                  className="flex h-10 w-full items-center justify-center rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 shadow-xs cursor-pointer"
                >
                  Allow Access &amp; Connect
                </button>
                <button
                  onClick={onClose}
                  className="flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === "connecting" && (
            <div className="flex flex-col items-center py-8 text-center">
              <Loader2 className="h-10 w-10 animate-spin" style={{ color: provider.primaryColor }} />
              <h3 className="mt-4 text-base font-bold text-slate-900">Securing Connection...</h3>
              <p className="mt-1 text-xs text-slate-500">Exchanging secure encrypted tokens with {provider.name}</p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-900">Successfully Connected!</h3>
              <p className="mt-1 text-xs text-slate-500">Redirecting to integration settings...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function IntegrationsMarketplace() {
  const [providers, setProviders] = useState(erpProviders);
  const [activeOAuth, setActiveOAuth] = useState<ERPProvider | null>(null);
  const [checkingQuickBooks, setCheckingQuickBooks] = useState(true);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const connectQuickBooks = () => {
    apiConnectQuickBooks()
      .then((res) => {
        window.location.assign(res.url || "http://localhost:3001/api/v1/quickbooks/connect");
      })
      .catch(() => {
        window.location.assign("http://localhost:3001/api/v1/quickbooks/connect");
      });
  };

  const refreshQuickBooksStatus = useCallback(async () => {
    setCheckingQuickBooks(true);
    const mockConnectedIds = readMockConnectedProviderIds();

    try {
      const response = await fetch("/api/quickbooks/status", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setProviders(current => 
          current.map(p => 
            p.id === "quickbooks" 
              ? { ...p, status: data.connected ? "Connected" : "Not Connected" } 
              : { ...p, status: mockConnectedIds.has(p.id) ? "Connected" : "Not Connected" }
          )
        );
      }
    } catch (err) {
      console.error("Failed to fetch QuickBooks status:", err);
      setProviders(current =>
        current.map(p =>
          p.id === "quickbooks"
            ? p
            : { ...p, status: mockConnectedIds.has(p.id) ? "Connected" : "Not Connected" }
        )
      );
    } finally {
      setCheckingQuickBooks(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      refreshQuickBooksStatus();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [refreshQuickBooksStatus]);

  const handleConnectSuccess = (providerId: string) => {
    if (providerId !== "quickbooks") {
      writeMockConnectedProviderId(providerId, true);
    }

    setProviders(current =>
      current.map(p => p.id === providerId ? { ...p, status: "Connected" } : p)
    );
    setActiveOAuth(null);
  };

  const handleDisconnect = async (provider: ERPProvider) => {
    setDisconnectingId(provider.id);
    try {
      if (provider.id === "quickbooks") {
        const res = await fetch("/api/quickbooks/disconnect", { method: "POST" });
        if (!res.ok) throw new Error("Failed to disconnect QuickBooks.");
        await refreshQuickBooksStatus();
      } else {
        writeMockConnectedProviderId(provider.id, false);
        setProviders(current =>
          current.map(p => p.id === provider.id ? { ...p, status: "Not Connected" } : p)
        );
      }
    } catch (error) {
      console.error("Failed to disconnect integration:", error);
    } finally {
      setDisconnectingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 transition-all hover:border-slate-300 hover:bg-white hover:shadow-xs"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-2 border border-slate-200/80 shadow-2xs">
                  <img src={provider.logoUrl} alt={provider.name} className="max-h-full max-w-full object-contain" />
                </div>
                {provider.status === "Connected" ? (
                  <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Connected</span>
                  </div>
                ) : checkingQuickBooks && provider.id === "quickbooks" ? (
                  <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
                    <span>Checking</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    <span>Not Connected</span>
                  </div>
                )}
              </div>
              
              <h3 className="mt-4 text-base font-bold text-slate-900">
                {provider.name}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {provider.description}
              </p>
            </div>

            <div className="mt-5 flex items-center gap-2 pt-3 border-t border-slate-200/60">
              {provider.status === "Connected" ? (
                <>
                  <Link
                    href={`/dashboard/settings/integrations/${provider.id}`}
                    className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 shadow-2xs"
                  >
                    Configure Sync
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDisconnect(provider)}
                    disabled={disconnectingId === provider.id}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-60 cursor-pointer"
                    aria-label={`Disconnect ${provider.name}`}
                  >
                    {disconnectingId === provider.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Unplug className="h-3.5 w-3.5" />
                    )}
                  </button>
                </>
              ) : provider.id === "quickbooks" ? (
                <button
                  type="button"
                  onClick={connectQuickBooks}
                  className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 text-xs font-semibold text-white transition-colors hover:bg-slate-800 shadow-2xs cursor-pointer"
                >
                  {checkingQuickBooks ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  Connect
                </button>
              ) : (
                <button
                  onClick={() => setActiveOAuth(provider)}
                  className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 text-xs font-semibold text-white transition-colors hover:bg-slate-800 shadow-2xs cursor-pointer"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {activeOAuth && (
        <OAuthModal
          provider={activeOAuth}
          onClose={() => setActiveOAuth(null)}
          onSuccess={() => handleConnectSuccess(activeOAuth.id)}
        />
      )}
    </div>
  );
}
