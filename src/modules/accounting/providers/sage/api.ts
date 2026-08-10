import { AccountingProviderAdapter, ConnectionStatus, NormalizedInvoice, NormalizedPayout, NormalizedVendor } from "../../types";
import { mapSageStatus } from "./mapper";
import { apiClient } from "../../../../lib/api/client";

export class SageAdapter implements AccountingProviderAdapter {
  readonly providerType = "sage";

  async getStatus(): Promise<ConnectionStatus> {
    try {
      const data = await apiClient("/integrations/status");
      return mapSageStatus({
        connected: data.sageConnected || false,
        companyId: data.sageConnected ? "sage-company-987" : undefined,
        environment: "sandbox",
      });
    } catch (_) {
      return mapSageStatus({ connected: false, environment: "sandbox" });
    }
  }

  async getInvoices(): Promise<NormalizedInvoice[]> {
    try {
      const data = await apiClient("/integrations/sage/invoices");
      const list = Array.isArray(data) ? data : data.invoices || [];
      return list.map((inv: any) => ({
        id: inv.id,
        docNumber: inv.docNumber || inv.id,
        name: inv.name || "Sage Customer",
        detail: "Synced from Sage Accounting",
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
    try {
      const data = await apiClient("/integrations/sage/invoices");
      const list = data.payouts || [];
      return list.map((p: any) => ({
        id: p.id || "sage-pay-1",
        name: p.vendorName || "Karlos Talent (Sage)",
        detail: p.description || "Sage processed split royalty",
        date: p.dateCreated || "Today, 2:15 PM",
        amount: p.amount || "$8,400.00",
        fallback: "KT",
        method: p.paymentMethod || "ACH",
        status: p.status === "Paid" ? "Paid" : "Pending",
      }));
    } catch (_) {
      return [];
    }
  }

  async getVendors(): Promise<NormalizedVendor[]> {
    try {
      const data = await apiClient("/integrations/sage/invoices");
      const list = data.vendors || [];
      return list.map((v: any) => ({
        id: v.id || "sage-ven-1",
        name: v.name || "Universal Music France",
        email: v.email || "billing@universalmusic.fr",
      }));
    } catch (_) {
      return [];
    }
  }

  async sync(): Promise<boolean> {
    try {
      await apiClient("/integrations/sage/invoices");
      return true;
    } catch (_) {
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      await apiClient("/integrations/sage/disconnect", { method: "POST" });
      return true;
    } catch (_) {
      return false;
    }
  }
}
