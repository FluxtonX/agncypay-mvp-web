import { apiClient } from "./client";

export interface CommercialFinding {
  id: string;
  code: string;
  severity: "error" | "warning" | "info";
  message: string;
}

export interface CommercialAllocation {
  id: string;
  externalAllocationId: string;
  beneficiaryParticipantId?: string;
  amount: string;
  currency: string;
  status: string;
}

export interface CommercialVersion {
  id: string;
  versionNumber: number;
  currency: string;
  totalAmount: string;
  dueAt?: string;
  validationStatus: "pending" | "valid" | "invalid";
  approval?: { status: "pending" | "approved" | "rejected"; reason?: string };
  allocations?: CommercialAllocation[];
  findings: CommercialFinding[];
}

export interface CommercialDocument {
  id: string;
  externalDocumentId: string;
  documentType: "invoice" | "payable" | "credit_note";
  status: string;
  agencyOrganizationId: string;
  payerOrganizationId?: string;
  agencyOrganization?: { id: string; name: string };
  versions: CommercialVersion[];
}

export function getAgencyCommercialDocuments() {
  return apiClient<CommercialDocument[]>("/commercial-documents");
}

export function getBrandCommercialDocuments() {
  return apiClient<CommercialDocument[]>("/commercial-documents/brand");
}

export function decideCommercialVersion(versionId: string, decision: "approved" | "rejected", reason?: string) {
  return apiClient(`/commercial-documents/versions/${versionId}/decision`, {
    method: "POST",
    body: JSON.stringify({ decision, reason }),
  });
}

export function prepareTalentFunding(versionId: string) {
  return apiClient<{
    commercialDocumentVersionId: string;
    fundingInstructions: Record<string, string>;
    transferPolicy: string;
    instructions: Array<{
      instructionId: string;
      beneficiaryParticipantId: string;
      externalAllocationId: string;
      amount: string;
      currency: string;
      status: string;
    }>;
  }>(`/commercial-documents/versions/${versionId}/talent-funding`, { method: "POST" });
}
