import { apiClient } from "./client";

export interface PlaidLinkTokenResponse {
  linkToken: string;
  expiration: string;
}

export interface PlaidAccountItem {
  id: string;
  name: string;
  mask: string;
  institutionName: string;
  type: string;
  subtype: string;
  availableBalance: number;
}

export async function apiCreatePlaidLinkToken(): Promise<PlaidLinkTokenResponse> {
  return apiClient<PlaidLinkTokenResponse>("/verification/plaid/link-token", {
    method: "POST",
  });
}

export async function apiExchangePlaidPublicToken(publicToken: string, institution?: any) {
  return apiClient<{ success: boolean; accounts: any[]; bankDetails: any }>("/verification/plaid/exchange-token", {
    method: "POST",
    body: JSON.stringify({ publicToken, institution }),
  });
}

export async function apiGetLinkedPlaidAccounts(): Promise<{ success: boolean; accounts: any[]; bankDetails: any }> {
  return apiClient("/verification/plaid/accounts", {
    method: "GET",
  });
}

export async function apiDisconnectPlaidAccount(accountId: string) {
  return apiClient(`/verification/plaid/accounts/${accountId}`, {
    method: "DELETE",
  });
}

export async function apiPlaidSandboxLink(institutionId = "ins_3") {
  return apiClient<{ success: boolean; accounts: any[]; bankDetails: any }>("/verification/plaid/sandbox-link", {
    method: "POST",
    body: JSON.stringify({ institutionId }),
  });
}

export async function apiSimulatePlaidWebhook(payload: {
  webhook_type?: string;
  webhook_code?: string;
  item_id?: string;
  new_transactions?: number;
}) {
  return apiClient("/webhooks/plaid/simulate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiGetPlaidWebhookEvents(limit = 20) {
  return apiClient<any[]>(`/webhooks/plaid/events?limit=${limit}`, {
    method: "GET",
  });
}
