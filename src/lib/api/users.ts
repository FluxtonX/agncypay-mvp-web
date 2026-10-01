import { apiClient } from "./client";

export async function apiGetMe() {
  return apiClient<{
    id: string;
    email: string;
    fullName: string;
    accountType: "brand" | "agency" | "talent";
    agncyId: string;
    kybStatus?: string;
    organizations: Array<{ id: string; name: string; type: "brand" | "agency" | "platform"; status: string }>;
  }>("/users/me");
}

export async function apiUpdateMe(data: { fullName?: string }) {
  return apiClient("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
