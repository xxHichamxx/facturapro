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
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
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
  at_number TEXT,
  at_date DATE,
  at_bureau TEXT,
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

-- ============================================================
-- ADMIN SYSTEM: User Profiles, Company Members, Roles
-- ============================================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TABLE company_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('owner', 'admin', 'employee', 'accountant', 'viewer')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  UNIQUE(company_id, user_id)
);

-- Auto-add owner as company_member on company creation
CREATE OR REPLACE FUNCTION handle_new_company()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO company_members (company_id, user_id, role, joined_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_company_created ON companies;
CREATE TRIGGER on_company_created
  AFTER INSERT ON companies
  FOR EACH ROW EXECUTE FUNCTION handle_new_company();

-- ============================================================
-- PRODUCT CATALOG
-- ============================================================

CREATE TABLE product_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  unit_price NUMERIC DEFAULT 0,
  default_tva_rate NUMERIC DEFAULT 20 CHECK (default_tva_rate >= 0 AND default_tva_rate <= 100),
  unit TEXT DEFAULT 'unité',
  sku TEXT,
  reference TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TAX RATES (configurable per company / per product)
-- ============================================================

CREATE TABLE tax_rates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rate NUMERIC NOT NULL CHECK (rate >= 0 AND rate <= 100),
  is_default BOOLEAN DEFAULT false,
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'products', 'services')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default Moroccan tax rates
CREATE OR REPLACE FUNCTION create_default_tax_rates()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO tax_rates (company_id, name, rate, is_default, applies_to, description) VALUES
    (NEW.id, 'TVA 20%', 20, true, 'all', 'Taux normal'),
    (NEW.id, 'TVA 14%', 14, false, 'all', 'Taux réduit'),
    (NEW.id, 'TVA 10%', 10, false, 'all', 'Taux réduit'),
    (NEW.id, 'TVA 7%', 7, false, 'services', 'Taux super-réduit'),
    (NEW.id, 'Exonéré', 0, false, 'all', 'Exonération de TVA');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_company_created_taxes ON companies;
CREATE TRIGGER on_company_created_taxes
  AFTER INSERT ON companies
  FOR EACH ROW EXECUTE FUNCTION create_default_tax_rates();

-- ============================================================
-- TEMPLATES (invoice/quote design templates)
-- ============================================================

CREATE TABLE templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'both' CHECK (type IN ('invoice', 'quote', 'both')),
  description TEXT,
  thumbnail_url TEXT,
  is_default BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed system templates
INSERT INTO templates (name, type, description, is_system, is_default, config) VALUES
  ('Classique', 'both', 'Design professionnel classique avec en-tête bleu', true, true, '{"primaryColor":"#2E75B6","fontSize":10,"showLogo":true}'),
  ('Moderne', 'both', 'Design épuré et moderne', true, false, '{"primaryColor":"#1E3A5F","fontSize":11,"showLogo":true}'),
  ('Minimaliste', 'both', 'Design minimaliste sans fioritures', true, false, '{"primaryColor":"#333333","fontSize":9,"showLogo":false}')
ON CONFLICT DO NOTHING;

CREATE TABLE company_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(company_id, template_id)
);

-- Auto-assign all system templates to new companies
CREATE OR REPLACE FUNCTION assign_templates_to_company()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO company_templates (company_id, template_id)
  SELECT NEW.id, t.id FROM templates t WHERE t.is_system = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_company_created_templates ON companies;
CREATE TRIGGER on_company_created_templates
  AFTER INSERT ON companies
  FOR EACH ROW EXECUTE FUNCTION assign_templates_to_company();

-- ============================================================
-- INDEXES for new tables
-- ============================================================

CREATE INDEX idx_company_members_company ON company_members(company_id);
CREATE INDEX idx_company_members_user ON company_members(user_id);
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_product_categories_company ON product_categories(company_id);
CREATE INDEX idx_tax_rates_company ON tax_rates(company_id);
CREATE INDEX idx_company_templates_company ON company_templates(company_id);

-- ============================================================
-- SECURITY DEFINER helper functions (bypass RLS to avoid recursion)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_company_ids(check_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT company_id FROM public.company_members WHERE user_id = check_user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = uid AND is_super_admin = true);
$$;

CREATE OR REPLACE FUNCTION public.get_user_company_role(uid UUID, cid UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.company_members WHERE user_id = uid AND company_id = cid;
$$;

-- ============================================================
-- RLS POLICIES for new tables
-- ============================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_templates ENABLE ROW LEVEL SECURITY;

-- user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Super admins can view all profiles" ON user_profiles FOR SELECT USING (
  public.is_super_admin(auth.uid())
);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- company_members
CREATE POLICY "Company members visible to company users" ON company_members FOR SELECT USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  OR public.is_super_admin(auth.uid())
);
CREATE POLICY "Owner can manage members" ON company_members FOR INSERT WITH CHECK (
  public.get_user_company_role(auth.uid(), company_id) IN ('owner', 'admin')
  OR public.is_super_admin(auth.uid())
);
CREATE POLICY "Owner can update members" ON company_members FOR UPDATE USING (
  public.get_user_company_role(auth.uid(), company_id) IN ('owner', 'admin')
  OR public.is_super_admin(auth.uid())
);
CREATE POLICY "Owner can delete members" ON company_members FOR DELETE USING (
  public.get_user_company_role(auth.uid(), company_id) IN ('owner', 'admin')
  OR public.is_super_admin(auth.uid())
);

-- products & categories
CREATE POLICY "Company members can view products" ON products FOR SELECT USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = products.company_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
);
CREATE POLICY "Company members can manage products" ON products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = products.company_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'employee'))
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
);
CREATE POLICY "Company members can update products" ON products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = products.company_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'employee'))
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
);
CREATE POLICY "Company members can delete products" ON products FOR DELETE USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = products.company_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
);

CREATE POLICY "Company members can view categories" ON product_categories FOR SELECT USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = product_categories.company_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
);
CREATE POLICY "Company members can manage categories" ON product_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = product_categories.company_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'employee'))
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
);

-- tax_rates
CREATE POLICY "Company members can view tax rates" ON tax_rates FOR SELECT USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = tax_rates.company_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
);
CREATE POLICY "Company members can manage tax rates" ON tax_rates FOR ALL USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = tax_rates.company_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'accountant'))
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
);

-- templates (system-wide, readable by all)
CREATE POLICY "Anyone can view templates" ON templates FOR SELECT USING (true);
CREATE POLICY "Super admins can manage templates" ON templates FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
);

-- company_templates
CREATE POLICY "Company members can view templates" ON company_templates FOR SELECT USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = company_templates.company_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
);

-- ============================================================
-- UPDATE EXISTING RLS POLICIES to support company_members
-- ============================================================

-- Drop old company-member-based policies and recreate with company_members support
DROP POLICY IF EXISTS "Company members can view clients" ON clients;
CREATE POLICY "Company members can view clients" ON clients FOR SELECT USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = clients.company_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
  OR EXISTS (SELECT 1 FROM documents d WHERE d.client_id = clients.id AND d.view_token IS NOT NULL)
);

DROP POLICY IF EXISTS "Company members can insert clients" ON clients;
CREATE POLICY "Company members can insert clients" ON clients FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = clients.company_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'employee'))
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
);

DROP POLICY IF EXISTS "Company members can update clients" ON clients;
CREATE POLICY "Company members can update clients" ON clients FOR UPDATE USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = clients.company_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'employee'))
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
);

DROP POLICY IF EXISTS "Company members can delete clients" ON clients;
CREATE POLICY "Company members can delete clients" ON clients FOR DELETE USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = clients.company_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
);

-- Update documents policies
DROP POLICY IF EXISTS "Company members can view documents" ON documents;
CREATE POLICY "Company members can view documents" ON documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = documents.company_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
  OR view_token IS NOT NULL
);

DROP POLICY IF EXISTS "Company members can insert documents" ON documents;
CREATE POLICY "Company members can insert documents" ON documents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = documents.company_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'employee'))
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
);

DROP POLICY IF EXISTS "Company members can update documents" ON documents;
CREATE POLICY "Company members can update documents" ON documents FOR UPDATE USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = documents.company_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'employee'))
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
);

DROP POLICY IF EXISTS "Company members can delete documents" ON documents;
CREATE POLICY "Company members can delete documents" ON documents FOR DELETE USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = documents.company_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
);

-- Update companies policies
DROP POLICY IF EXISTS "Users can view own company" ON companies;
CREATE POLICY "Users can view own company" ON companies FOR SELECT USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = companies.id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
  OR owner_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can update own company" ON companies;
CREATE POLICY "Users can update own company" ON companies FOR UPDATE USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = companies.id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true)
  OR owner_id = auth.uid()
);

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW public.companies_view AS
SELECT c.*, u.email AS owner_email
FROM public.companies c
LEFT JOIN auth.users u ON u.id = c.owner_id;

-- Grant access to the view
GRANT SELECT ON public.companies_view TO authenticated, anon, service_role;
