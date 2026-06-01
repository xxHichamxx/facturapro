export type DocumentType = "invoice" | "quote";

export type DocumentStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "paid"
  | "overdue";

export type Currency = "MAD" | "EUR" | "USD";

export interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  address: string;
  city: string;
  country: string;
  ice: string;
  if_fiscal: string;
  rc: string;
  patente: string;
  default_currency: Currency;
  default_tva_rate: number;
  invoice_prefix: string;
  created_at: string;
  owner_id: string;
}

export interface Client {
  id: string;
  company_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  ice_client: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  company_id: string;
  client_id: string;
  type: DocumentType;
  number: string;
  status: DocumentStatus;
  issue_date: string;
  due_date: string;
  converted_from_quote_id: string | null;
  subtotal_ht: number;
  tva_amount: number;
  total_ttc: number;
  currency: Currency;
  notes: string | null;
  payment_terms: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentLine {
  id: string;
  document_id: string;
  position: number;
  description: string;
  quantity: number;
  unit_price: number;
  tva_rate: number;
  total_ht: number;
}

export interface DocumentWithDetails extends Document {
  client: Client;
  lines: DocumentLine[];
  company: Company;
}

export interface KPIData {
  revenue_current_month: number;
  pending_invoices: number;
  active_quotes: number;
  overdue_count: number;
}
