export type DocumentType = "invoice" | "quote";

export type DocumentStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "paid"
  | "overdue";

export type Currency = "MAD" | "EUR" | "USD";

export type CompanyRole = "owner" | "admin" | "employee" | "accountant" | "viewer";

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_super_admin: boolean;
  created_at: string;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: CompanyRole;
  invited_at: string;
  joined_at: string | null;
}

export interface ProductCategory {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  company_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  unit_price: number;
  default_tva_rate: number;
  unit: string;
  sku: string | null;
  reference: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaxRate {
  id: string;
  company_id: string;
  name: string;
  rate: number;
  is_default: boolean;
  applies_to: "all" | "products" | "services";
  description: string | null;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  type: "invoice" | "quote" | "both";
  description: string | null;
  thumbnail_url: string | null;
  is_default: boolean;
  is_system: boolean;
  config: Record<string, unknown>;
  created_at: string;
}

export interface CompanyTemplate {
  id: string;
  company_id: string;
  template_id: string;
  is_active: boolean;
}

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
  email: string | null;
  phone: string | null;
  address: string | null;
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
  view_token: string | null;
  at_number: string | null;
  at_date: string | null;
  at_bureau: string | null;
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
