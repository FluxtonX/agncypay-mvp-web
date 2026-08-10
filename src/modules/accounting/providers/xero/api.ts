import { AccountingProviderAdapter, ConnectionStatus, NormalizedInvoice, NormalizedPayout, NormalizedVendor } from "../../types";
import { mapXeroInvoice, mapXeroStatus } from "./mapper";
import { apiClient } from "../../../../lib/api/client";

export class XeroAdapter implements AccountingProviderAdapter {
  readonly providerType = "xero";

  async getStatus(): Promise<ConnectionStatus> {
    try {
      const data = await apiClient("/integrations/status");
      return mapXeroStatus({ connected: data.xeroConnected || false, environment: "sandbox" });
    } catch (_) {
      return mapXeroStatus({ connected: false, environment: "sandbox" });
    }
  }

  async getInvoices(): Promise<NormalizedInvoice[]> {
    try {
      const data = await apiClient("/integrations/xero/invoices");
      const list = Array.isArray(data) ? data : data.invoices || [];
      return list.map((inv: any) => ({
        id: inv.id,
        docNumber: inv.docNumber || inv.id,
        name: inv.name || "Xero Client",
        detail: "Synced from Xero Accounting",
        date: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
        amount: inv.amount || 0,
        status: inv.status === "paid" ? "Paid" : "Pending",
        daysText: inv.dueDate ? `Due ${inv.dueDate}` : "Net-30",
      }));
    } catch (_) {
      return [];
    }
  }

  async getPayouts(): Promise<NormalizedPayout[]> {
    return [
      {
        id: "xero-pay-1",
        name: "Karlos Talent (Xero)",
        detail: "Xero processed royalty payout",
        date: "Today, 2:15 PM",
        amount: "$14,800.00",
        fallback: "KT",
        method: "ACH",
        status: "Paid",
      },
    ];
  }

  async getVendors(): Promise<NormalizedVendor[]> {
    return [
      { id: "xero-ven-1", name: "Warner Music Group", email: "billing@warnermusic.com" },
      { id: "xero-ven-2", name: "Universal Music Global", email: "finance@universalmusic.com" },
    ];
  }

  async sync(): Promise<boolean> {
    try {
      await apiClient("/integrations/xero/invoices");
      return true;
    } catch (_) {
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      await apiClient("/integrations/xero/disconnect", { method: "POST" });
      return true;
    } catch (_) {
      return false;
    }
  }
}
export default XeroAdapter;
