import { apiClient } from './client';

export interface TalentRecord {
  id: string;
  agencyId: string;
  fullName: string;
  email?: string;
  phone?: string;
  country: string;
  isInternational: boolean;
  status: string;
  createdAt: string;
  counterparties?: any[];
}

export interface CreateTalentDto {
  fullName: string;
  email?: string;
  phone?: string;
  country?: string;
  isInternational?: boolean;
  metadata?: Record<string, any>;
}

export async function createTalent(data: CreateTalentDto): Promise<{ talent: TalentRecord; counterparty: any }> {
  return apiClient('/talents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getTalents(): Promise<TalentRecord[]> {
  return apiClient('/talents');
}

export async function getTalentById(id: string): Promise<TalentRecord> {
  return apiClient(`/talents/${id}`);
}

export async function updateTalent(id: string, data: Partial<CreateTalentDto>): Promise<TalentRecord> {
  return apiClient(`/talents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTalent(id: string): Promise<{ success: boolean }> {
  return apiClient(`/talents/${id}`, {
    method: 'DELETE',
  });
}
