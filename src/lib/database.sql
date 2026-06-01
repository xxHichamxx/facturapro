-- FacturaPro Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table (PME profile)
CREATE TABLE companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT DEFAULT 'Maroc',
  ice TEXT NOT NULL,
  if_fiscal TEXT NOT NULL,
  rc TEXT NOT NULL,
  patente TEXT NOT NULL,
  default_currency TEXT DEFAULT 'MAD' CHECK (default_currency IN ('MAD', 'EUR', 'USD')),
  default_tva_rate NUMERIC DEFAULT 20 CHECK (default_tva_rate >= 0 AND default_tva_rate <= 20),
  invoice_prefix TEXT DEFAULT 'FAC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(owner_id)
);

-- Clients table
CREATE TABLE clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  ice_client TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table (factures & devis)
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('invoice', 'quote')),
  number TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'paid', 'overdue')),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  converted_from_quote_id UUID REFERENCES documents(id),
  subtotal_ht NUMERIC NOT NULL DEFAULT 0,
  tva_amount NUMERIC NOT NULL DEFAULT 0,
  total_ttc NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'MAD' CHECK (currency IN ('MAD', 'EUR', 'USD')),
  notes TEXT,
  payment_terms TEXT,
  pdf_url TEXT,
  view_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document lines table
CREATE TABLE document_lines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  tva_rate NUMERIC NOT NULL DEFAULT 20,
  total_ht NUMERIC NOT NULL DEFAULT 0
);

-- Unique constraint on document numbers
ALTER TABLE documents ADD CONSTRAINT unique_document_number UNIQUE (company_id, type, number);

-- Indexes
CREATE INDEX idx_clients_company ON clients(company_id);
CREATE INDEX idx_documents_company ON documents(company_id);
CREATE INDEX idx_documents_client ON documents(client_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_number ON documents(number);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_document_lines_doc ON document_lines(document_id);

-- Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_lines ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Companies: user sees own company
CREATE POLICY "Users can view own company" ON companies
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own company" ON companies
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own company" ON companies
  FOR UPDATE USING (auth.uid() = owner_id);

-- Clients: company owner sees clients
CREATE POLICY "Company members can view clients" ON clients
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM companies WHERE companies.id = clients.company_id AND companies.owner_id = auth.uid())
  );

CREATE POLICY "Company members can insert clients" ON clients
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM companies WHERE companies.id = clients.company_id AND companies.owner_id = auth.uid())
  );

CREATE POLICY "Company members can update clients" ON clients
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM companies WHERE companies.id = clients.company_id AND companies.owner_id = auth.uid())
  );

CREATE POLICY "Company members can delete clients" ON clients
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM companies WHERE companies.id = clients.company_id AND companies.owner_id = auth.uid())
  );

-- Documents: company owner sees documents
CREATE POLICY "Company members can view documents" ON documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM companies WHERE companies.id = documents.company_id AND companies.owner_id = auth.uid())
  );

CREATE POLICY "Company members can insert documents" ON documents
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM companies WHERE companies.id = documents.company_id AND companies.owner_id = auth.uid())
  );

CREATE POLICY "Company members can update documents" ON documents
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM companies WHERE companies.id = documents.company_id AND companies.owner_id = auth.uid())
  );

CREATE POLICY "Company members can delete documents" ON documents
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM companies WHERE companies.id = documents.company_id AND companies.owner_id = auth.uid())
  );

-- Document lines: company owner sees lines
CREATE POLICY "Company members can view document lines" ON document_lines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN companies c ON c.id = d.company_id
      WHERE d.id = document_lines.document_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company members can insert document lines" ON document_lines
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN companies c ON c.id = d.company_id
      WHERE d.id = document_lines.document_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company members can update document lines" ON document_lines
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN companies c ON c.id = d.company_id
      WHERE d.id = document_lines.document_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company members can delete document lines" ON document_lines
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN companies c ON c.id = d.company_id
      WHERE d.id = document_lines.document_id AND c.owner_id = auth.uid()
    )
  );

-- Public access policy for shared document views (only documents with a view_token)
CREATE POLICY "Public can view shared document" ON documents
  FOR SELECT USING (view_token IS NOT NULL);

-- Allow public to read client/company data ONLY through the shared document
CREATE POLICY "Public can view client via shared doc" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.client_id = clients.id AND d.view_token IS NOT NULL
    )
  );

CREATE POLICY "Public can view company via shared doc" ON companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.company_id = companies.id AND d.view_token IS NOT NULL
    )
  );
