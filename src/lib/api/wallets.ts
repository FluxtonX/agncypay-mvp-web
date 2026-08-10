import { apiClient } from "./client";

export interface WalletProfile {
  id: string;
  walletId: string;
  userId: string;
  accountType: "agency" | "brand";
  balance: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface WalletLedgerEntry {
  id: string;
  walletId: string;
  type: "credit" | "debit";
  amount: number;
  balanceAfter: number;
  referenceType: string;
  referenceId?: string;
  description: string;
  createdAt: string;
}

export async function apiGetMyWallet(): Promise<WalletProfile> {
  return apiClient<WalletProfile>("/wallets/me");
}

export async function apiGetWalletLedger(walletId: string): Promise<{ wallet: WalletProfile; ledger: WalletLedgerEntry[] }> {
  return apiClient<{ wallet: WalletProfile; ledger: WalletLedgerEntry[] }>(`/wallets/${walletId}/ledger`);
}
