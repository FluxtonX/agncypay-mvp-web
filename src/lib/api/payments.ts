import { apiClient } from './client';

export interface CreatePaymentDto {
  agencyOrganizationId: string;
  amount: number;
  currency: string;
  commercialDocumentVersionId: string;
  purpose?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey: string;
}

export interface PaymentRecord {
  id: string;
  instructionType: string;
  sourceOrganizationId: string;
  destinationOrganizationId: string;
  commercialDocumentVersionId?: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  attempts?: Array<{ id: string; status: string; operationType: string; externalReference?: string }>;
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
  const { idempotencyKey, ...body } = data;
  const result = await apiClient<{ instruction: PaymentRecord; fundingInstructions: FundingInstructions }>('/payments', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(body),
  });
  return { payment: result.instruction, fundingInstructions: result.fundingInstructions };
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

export function provisionAgencyRails(data: {
  accountName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  currency: string;
}) {
  return apiClient<{
    agencyOrganizationId: string;
    destinationAccount: Record<string, string>;
    collectionAccount: Record<string, unknown>;
  }>("/payments/agency/rails", { method: "POST", body: JSON.stringify(data) });
}
