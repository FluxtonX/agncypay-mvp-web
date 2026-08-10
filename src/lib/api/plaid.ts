import { apiClient } from "./client";

export async function apiCreatePlaidLinkToken(): Promise<{ linkToken: string; expiration: string }> {
  return apiClient<{ linkToken: string; expiration: string }>("/verification/plaid/link-token", {
    method: "POST",
  });
}

export async function apiExchangePlaidPublicToken(publicToken: string) {
  return apiClient("/verification/plaid/exchange-token", {
    method: "POST",
    body: JSON.stringify({ publicToken }),
  });
}
