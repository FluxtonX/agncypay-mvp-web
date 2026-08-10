import { apiClient } from "./client";

export async function apiGetMe() {
  return apiClient("/users/me");
}

export async function apiUpdateMe(data: { fullName?: string }) {
  return apiClient("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
