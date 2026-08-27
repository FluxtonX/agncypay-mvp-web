import { apiClient } from './client';

export async function runReconciliation() {
  return apiClient('/reconciliation/run', {
    method: 'POST',
  });
}

export async function getReconciliationIssues() {
  return apiClient('/reconciliation/issues');
}

export async function resolveReconciliationIssue(id: string, notes: string) {
  return apiClient(`/reconciliation/resolve/${id}`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
}
