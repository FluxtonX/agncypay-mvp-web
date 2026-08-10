import { apiClient } from "./client";

export async function apiGetFeatureFlags(): Promise<Record<string, boolean>> {
  try {
    return await apiClient<Record<string, boolean>>("/feature-flags");
  } catch (_) {
    return {
      wire_enabled: false,
      rtp_enabled: false,
      ach_enabled: true,
      plaid_enabled: true,
      qbo_sync_enabled: true,
    };
  }
}
