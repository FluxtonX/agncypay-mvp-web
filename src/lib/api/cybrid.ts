import { apiClient } from './client';

export async function getLedgerAgencyBalance(): Promise<{
  accountCode: string;
  debitTotal: number;
  creditTotal: number;
  balance: number;
  currency: string;
}> {
  return apiClient('/ledger/agency-balance');
}

export async function getLedgerAccountBalance(accountCode: string) {
  return apiClient(`/ledger/balance/${encodeURIComponent(accountCode)}`);
}

export async function getJournalHistory(accountCode?: string, limit = 50) {
  const query = accountCode ? `?accountCode=${encodeURIComponent(accountCode)}&limit=${limit}` : `?limit=${limit}`;
  return apiClient(`/ledger/journal${query}`);
}
