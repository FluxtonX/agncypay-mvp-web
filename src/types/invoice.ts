export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  brandName?: string;
  agency?: string;
  campaign?: string;
  invoiceDate?: string;
  dueDate: string;
  amount: number;
  currency?: string;
  status: "pending" | "paid" | "overdue" | "processing" | "awaiting_approval" | "settled" | "talent_disbursed" | "rejected";
  items?: InvoiceItem[];
  vendorFee?: any;
  splitPool?: any;
}
