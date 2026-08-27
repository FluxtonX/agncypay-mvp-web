import { apiClient } from "./client";

export async function apiGetVerificationState() {
  return apiClient("/verification/state");
}

export async function apiUpdateBusinessProfile(data: any) {
  return apiClient("/verification/business-profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function apiUpdateRepresentative(data: any) {
  return apiClient("/verification/representative", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function apiUpdateAuthorization(data: any) {
  return apiClient("/verification/authorization", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function apiUpdateBankDetails(data: any) {
  return apiClient("/verification/bank-details", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function apiSubmitLegalEntity(): Promise<{
  success: boolean;
  legalEntityId: string;
  kybStatus: string;
  depositAccount?: {
    routingNumber: string;
    accountNumber: string;
    uniqueMemoId: string;
    bankName: string;
  };
}> {
  return apiClient("/verification/legal-entity", {
    method: "POST",
  });
}

export async function apiCreatePlaidLinkToken(): Promise<{ linkToken: string }> {
  return apiClient("/verification/plaid/link-token", {
    method: "POST",
  });
}

export async function apiExchangePlaidToken(publicToken: string) {
  return apiClient("/verification/plaid/exchange-token", {
    method: "POST",
    body: JSON.stringify({ publicToken }),
  });
}
