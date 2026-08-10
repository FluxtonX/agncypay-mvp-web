import { apiClient } from "./client";

export async function apiGetTransactions() {
  return apiClient("/transactions");
}

export async function apiCreateTransaction(data: {
  invoiceId: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  status: "success" | "failed" | "processing";
}) {
  return apiClient("/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
