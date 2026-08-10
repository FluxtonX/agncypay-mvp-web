import { apiClient } from "./client";

export async function apiGetTreasuryBalance(): Promise<{ balance: number }> {
  return apiClient("/treasury/balance");
}

export function subscribeFirestoreDepositBalance(email?: string | ((bal: number) => void), callback?: (bal: number) => void): () => void {
  const cb = typeof email === "function" ? email : callback;
  apiGetTreasuryBalance()
    .then((res) => {
      if (cb) cb(res.balance || 0);
    })
    .catch(() => {
      if (cb) cb(0);
    });
  return () => {};
}

export async function apiRecordDeposit(amount: number, paymentMethod: string = "Card") {
  return apiClient("/treasury/deposit", {
    method: "POST",
    body: JSON.stringify({ amount, paymentMethod }),
  });
}
