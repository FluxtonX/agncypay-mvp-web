import { apiClient } from "./client";

export async function apiGetVerificationState() {
  return apiClient("/verification");
}

export async function apiUpdateBusinessProfile(data: any) {
  return apiClient("/verification/business", {
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

export async function apiUpdateBrandVerification(data: any) {
  return apiClient("/verification/brand", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function apiSendDomainCode(email: string) {
  return apiClient("/verification/domain/send-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function apiVerifyDomainCode(code: string) {
  return apiClient("/verification/domain/verify", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function apiUpdateBankDetails(data: any) {
  return apiClient("/verification/bank-details", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function apiSubmitForVerification() {
  return apiClient("/verification/submit", {
    method: "POST",
  });
}
