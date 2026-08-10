import { apiClient } from "./client";

export async function apiGetIntegrationsStatus() {
  return apiClient("/integrations/status");
}

export async function apiConnectProvider(provider: "quickbooks" | "xero" | "plaid", data: any) {
  return apiClient(`/integrations/${provider}/connect`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiDisconnectProvider(provider: "quickbooks" | "xero" | "plaid") {
  if (provider === "quickbooks") {
    return apiClient("/quickbooks/disconnect", { method: "POST" });
  }
  return apiClient(`/integrations/${provider}/disconnect`, {
    method: "POST",
  });
}

export async function apiGetQuickBooksStatus() {
  return apiClient<{ status: string; connected: boolean; realmId: string; lastSync: string; lastError: string }>("/quickbooks/status");
}

export async function apiConnectQuickBooks() {
  return apiClient<{ url: string }>("/quickbooks/connect");
}

export async function apiFetchQuickBooksInvoices() {
  return apiClient<{ success: boolean; count: number; invoices: any[] }>("/quickbooks/fetch-invoices", {
    method: "POST",
  });
}

export async function apiGetQuickBooksInvoices() {
  return apiClient<any[]>("/quickbooks/invoices");
}

