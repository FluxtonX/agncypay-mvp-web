import { apiClient } from "./client";

export interface ApiInvoice {
  id: string;
  invoiceNumber: string;
  campaign: string;
  agencyId: string;
  agencyEmail: string;
  brandId: string;
  brandName: string;
  brandEmail: string;
  amount: number;
  due: string;
  status: "pending" | "processing" | "paid" | "overdue";
  payoutStatus: "pending" | "disbursed";
  talentPayoutStatus?: "pending" | "disbursed";
  createdDate: string;
  payerId: string;
  payerEmail: string;
  payerAddress: string[];
  splits?: any[];
}

export async function apiGetInvoices(): Promise<ApiInvoice[]> {
  return apiClient<ApiInvoice[]>("/invoices");
}

export type SubscriptionCallback = (invoices: ApiInvoice[]) => void;

export function triggerInvoicesSync() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("syncInvoices"));
  }
}

export function subscribeInvoicesByBrand(email?: string | SubscriptionCallback, callback?: SubscriptionCallback): () => void {
  const cb = typeof email === "function" ? email : callback;
  
  const fetchAndNotify = () => {
    apiGetInvoices().then((invs) => {
      if (cb) cb(invs);
    }).catch(() => {
      if (cb) cb([]);
    });
  };

  fetchAndNotify();

  let intervalId: any = null;
  if (typeof window !== "undefined") {
    intervalId = setInterval(fetchAndNotify, 3000);
    window.addEventListener("syncInvoices", fetchAndNotify);
  }

  return () => {
    if (intervalId) clearInterval(intervalId);
    if (typeof window !== "undefined") {
      window.removeEventListener("syncInvoices", fetchAndNotify);
    }
  };
}

export function subscribeInvoicesByAgency(email?: string | SubscriptionCallback, callback?: SubscriptionCallback): () => void {
  const cb = typeof email === "function" ? email : callback;
  
  const fetchAndNotify = () => {
    apiGetInvoices().then((invs) => {
      if (cb) cb(invs);
    }).catch(() => {
      if (cb) cb([]);
    });
  };

  fetchAndNotify();

  let intervalId: any = null;
  if (typeof window !== "undefined") {
    intervalId = setInterval(fetchAndNotify, 3000);
    window.addEventListener("syncInvoices", fetchAndNotify);
  }

  return () => {
    if (intervalId) clearInterval(intervalId);
    if (typeof window !== "undefined") {
      window.removeEventListener("syncInvoices", fetchAndNotify);
    }
  };
}

export function subscribeInvoicesByTalent(email?: string | SubscriptionCallback, callback?: SubscriptionCallback): () => void {
  const cb = typeof email === "function" ? email : callback;
  
  const fetchAndNotify = () => {
    apiGetInvoices().then((invs) => {
      if (cb) cb(invs);
    }).catch(() => {
      if (cb) cb([]);
    });
  };

  fetchAndNotify();

  return () => {};
}

export async function apiGetSingleInvoice(id: string): Promise<ApiInvoice> {
  return apiClient<ApiInvoice>(`/invoices/${id}`);
}

export async function apiCreateInvoice(data: {
  campaign: string;
  agencyName?: string;
  agency?: string;
  agencyEmail: string;
  talent?: string;
  talentEmail?: string;
  brandName: string;
  brandEmail: string;
  amount: number;
  due: string;
  splits?: any[];
}): Promise<ApiInvoice> {
  const invoice = await apiClient<ApiInvoice>("/invoices", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      agencyName: data.agencyName || data.agency || "Agency Workspace",
      brandName: data.brandName || "Brand Partner",
    }),
  });

  triggerInvoicesSync();
  return invoice;
}

export async function apiUpdateInvoiceStatus(
  id: string,
  status: "pending" | "processing" | "paid" | "overdue",
  payoutStatus: "pending" | "disbursed" = "pending"
): Promise<ApiInvoice> {
  const invoice = await apiClient<ApiInvoice>(`/invoices/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, payoutStatus }),
  });

  triggerInvoicesSync();
  return invoice;
}

export async function apiGetBrands() {
  return apiClient("/invoices/brands");
}
