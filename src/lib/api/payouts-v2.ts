import { apiClient } from './client';

export interface DomesticPayoutDto {
  talentId: string;
  amount: number;
  currency?: string;
  paymentId?: string;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

export interface InternationalPayoutDto {
  talentId: string;
  amount: number;
  destinationCurrency?: string;
  paymentId?: string;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

export interface AgencyWithdrawalDto {
  amount: number;
  destinationExternalAccountId: string;
  paymentType?: 'ach' | 'wire' | 'rtp';
}

export async function requestDomesticTalentPayout(data: DomesticPayoutDto) {
  return apiClient('/payouts/talent/domestic', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function requestInternationalTalentPayout(data: InternationalPayoutDto) {
  return apiClient('/payouts/talent/international', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function requestAgencyWithdrawal(data: AgencyWithdrawalDto) {
  return apiClient('/payouts/request', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPayoutHistory() {
  return apiClient('/payouts/history');
}

export async function getExternalAccounts() {
  return apiClient('/payouts/external-accounts');
}
