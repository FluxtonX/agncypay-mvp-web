import { apiClient } from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    accountType: "brand" | "agency" | "talent";
    agncyId: string;
    kybStatus?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export async function apiAcceptInvitation(payload: {
  token: string;
  password: string;
  fullName: string;
}): Promise<AuthResponse> {
  const data = await apiClient<AuthResponse>("/auth/invitations/accept", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (typeof window !== "undefined" && data.user.accountType !== "talent") {
    localStorage.setItem("agncypay_token", data.accessToken);
    localStorage.setItem("agncypay_refresh_token", data.refreshToken);
  }
  return data;
}

export function apiCreateInvitation(payload: {
  organizationId: string;
  email: string;
  accountType: "brand" | "agency" | "talent";
  relationshipType: string;
}) {
  return apiClient<{ invitationId: string; token: string; expiresAt: string }>("/auth/invitations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiLogin(payload: LoginPayload): Promise<AuthResponse> {
  const data = await apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (typeof window !== "undefined") {
    localStorage.setItem("agncypay_token", data.accessToken);
    localStorage.setItem("agncypay_refresh_token", data.refreshToken);
  }

  return data;
}

export async function apiForgotPassword(email: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
  return apiClient("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function apiResetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  return apiClient("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function apiLogout(): Promise<void> {
  try {
    await apiClient("/auth/logout", { method: "POST" });
  } catch {}

  if (typeof window !== "undefined") {
    localStorage.removeItem("agncypay_token");
    localStorage.removeItem("agncypay_refresh_token");
  }
}
