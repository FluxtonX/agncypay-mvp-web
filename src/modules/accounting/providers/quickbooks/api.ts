import { AccountingProviderAdapter, ConnectionStatus, NormalizedInvoice, NormalizedPayout, NormalizedVendor } from "../../types";
import { mapQBInvoice, mapQBPayout, mapQBStatus, mapQBVendor } from "./mapper";
import { apiClient } from "../../../../lib/api/client";

export class QuickBooksAdapter implements AccountingProviderAdapter {
  readonly providerType = "quickbooks";

  async getStatus(): Promise<ConnectionStatus> {
    try {
      const data = await apiClient("/quickbooks/status");
      return mapQBStatus({ connected: data.connected || false, realmId: data.realmId, environment: "sandbox" });
    } catch (_) {
      return mapQBStatus({ connected: false, environment: "sandbox" });
    }
  }



  async getInvoices(): Promise<NormalizedInvoice[]> {
    try {
      const data = await apiClient("/quickbooks/invoices");
      const list = Array.isArray(data) ? data : data.invoices || [];
      return list.map(mapQBInvoice);
    } catch (_) {
      return [];
    }
  }

  async getPayouts(): Promise<NormalizedPayout[]> {
    return [];
  }

  async getVendors(): Promise<NormalizedVendor[]> {
    return [];
  }

  async sync(): Promise<boolean> {
    try {
      await apiClient("/quickbooks/fetch-invoices", { method: "POST" });
      return true;
    } catch (_) {
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      await apiClient("/quickbooks/disconnect", { method: "POST" });
      return true;
    } catch (_) {
      return false;
    }
  }
}

