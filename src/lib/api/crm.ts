import { apiClient } from "./client";

export interface CrmConnection {
  id: string;
  connectorKey: string;
  displayName: string;
  status: string;
  externalTenantId: string;
  lastSyncAt?: string;
}

export function getCrmConfig() {
  return apiClient<{
    connections: CrmConnection[];
    webhookUrl: string;
    supportedEvents: string[];
    documentation: Record<string, unknown>;
  }>("/crm/config");
}

export function createCrmConnection(displayName: string) {
  return apiClient<{
    connectionId: string;
    displayName: string;
    webhookUrl: string;
    apiKey: string;
  }>("/crm/config", { method: "POST", body: JSON.stringify({ displayName }) });
}
