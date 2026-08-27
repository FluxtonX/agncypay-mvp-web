import { apiClient } from './client';

export interface CreatePaymentDto {
  agencyId: string;
  amount: number;
  currency?: string;
  invoiceId?: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
}

export interface PaymentRecord {
  id: string;
  paymentNumber: string;
  brandId: string;
  agencyId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  cybridDepositRef?: string;
  createdAt: string;
  brand?: { fullName: string; email: string };
  agency?: { fullName: string; email: string };
}

export interface FundingInstructions {
  beneficiaryName: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: string;
  memoOrReference: string;
  acceptedRails: string[];
  instructions: string;
}

export async function createPayment(data: CreatePaymentDto): Promise<{ payment: PaymentRecord; fundingInstructions: FundingInstructions }> {
  return apiClient('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPayments(): Promise<PaymentRecord[]> {
  return apiClient('/payments');
}

export async function getPaymentById(id: string): Promise<PaymentRecord> {
  return apiClient(`/payments/${id}`);
}

export async function getFundingInstructions(paymentId: string): Promise<FundingInstructions> {
  return apiClient(`/payments/${paymentId}/funding-instructions`);
}
