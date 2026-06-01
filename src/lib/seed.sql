-- FacturaPro Seed Data
-- Run AFTER database.sql in Supabase SQL Editor
-- Replace 'YOUR_USER_ID' with your actual auth.users id first!

DO $$ 
DECLARE
  v_user_id UUID;
  v_company_id UUID;
  v_category_id UUID;
  v_product_id UUID;
  v_client1_id UUID;
  v_client2_id UUID;
  v_client3_id UUID;
  v_quote_id UUID;
  v_invoice_id UUID;
BEGIN
  -- Get the first user (or replace with specific ID)
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please sign up first at https://facturapro-ten.vercel.app/signup';
  END IF;

  -- Make user super admin
  UPDATE user_profiles SET is_super_admin = true, full_name = 'Admin FacturaPro' WHERE id = v_user_id;

  -- Create Company
  INSERT INTO companies (id, name, address, city, country, ice, if_fiscal, rc, patente, default_currency, default_tva_rate, invoice_prefix, owner_id)
  VALUES (uuid_generate_v4(), 'SARL BTP Construction', '123 Avenue Hassan II, 4ème étage', 'Casablanca', 'Maroc', '001122334455667', '12345678', '987654', '11223344', 'MAD', 20, 'FAC', v_user_id)
  RETURNING id INTO v_company_id;

  -- Create default tax rates (trigger handles this, but making sure)
  INSERT INTO tax_rates (company_id, name, rate, is_default, applies_to, description) VALUES
    (v_company_id, 'TVA 20%', 20, true, 'all', 'Taux normal'),
    (v_company_id, 'TVA 14%', 14, false, 'all', 'Taux réduit'),
    (v_company_id, 'TVA 10%', 10, false, 'all', 'Taux réduit'),
    (v_company_id, 'TVA 7%', 7, false, 'services', 'Taux super-réduit'),
    (v_company_id, 'Exonéré', 0, false, 'all', 'Exonération de TVA')
  ON CONFLICT DO NOTHING;

  -- Create product categories
  INSERT INTO product_categories (company_id, name, description) VALUES
    (v_company_id, 'Matériaux de construction', 'Ciment, briques, acier, etc.'),
    (v_company_id, 'Main d''œuvre', 'Prestations de services'),
    (v_company_id, 'Location matériel', 'Location d''engins et équipements');

  -- Get category IDs
  SELECT id INTO v_category_id FROM product_categories WHERE company_id = v_company_id AND name = 'Matériaux de construction' LIMIT 1;

  -- Create products
  INSERT INTO products (company_id, category_id, name, description, unit_price, default_tva_rate, unit, sku, is_active) VALUES
    (v_company_id, v_category_id, 'Ciment CPJ45 (sac 50kg)', 'Ciment Portland composé', 95.00, 20, 'sac', 'CIM-001', true),
    (v_company_id, v_category_id, 'Brique rouge 20x10x5', 'Brique terre cuite standard', 2.50, 20, 'unité', 'BRQ-001', true),
    (v_company_id, v_category_id, 'Fer à béton 12mm (6m)', 'Acier HA FeE500', 85.00, 20, 'barre', 'FER-012', true),
    (v_company_id, v_category_id, 'Sable de construction (m³)', 'Sable gros 0/5', 180.00, 20, 'm³', 'SAB-001', true),
    (v_company_id, v_category_id, 'Gravier 15/25 (m³)', 'Gravier concassé', 220.00, 20, 'm³', 'GRV-001', true);

  -- Get service category
  SELECT id INTO v_category_id FROM product_categories WHERE company_id = v_company_id AND name = 'Main d''œuvre' LIMIT 1;
  
  INSERT INTO products (company_id, category_id, name, description, unit_price, default_tva_rate, unit, sku, is_active) VALUES
    (v_company_id, v_category_id, 'Main d''œuvre maçon', 'Taux horaire maçon qualifié', 120.00, 14, 'heure', 'MO-MAC', true),
    (v_company_id, v_category_id, 'Main d''œuvre manœuvre', 'Taux horaire manœuvre', 70.00, 14, 'heure', 'MO-MAN', true),
    (v_company_id, v_category_id, 'Étude technique', 'Forfait étude et plan', 5000.00, 20, 'forfait', 'SVC-ETU', true);

  -- Create clients
  INSERT INTO clients (company_id, name, email, phone, address, ice_client) VALUES
    (v_company_id, 'Résidence Al Manar', 'contact@almanar.ma', '+212 522 123 456', '45 Rue Al Qods, Casablanca', '998877665544332'),
    (v_company_id, 'Groupe Scolaire Al Irfane', 'direction@alirfane.ma', '+212 537 654 321', '12 Avenue Moulay Ismail, Rabat', NULL),
    (v_company_id, 'Clinique Les Lilas', 'admin@lilas.ma', '+212 528 987 654', '78 Bd Zerktouni, Marrakech', '112233445566778')
  RETURNING id INTO v_client1_id;

  -- Get client IDs
  SELECT id INTO v_client2_id FROM clients WHERE company_id = v_company_id AND name = 'Groupe Scolaire Al Irfane' LIMIT 1;
  SELECT id INTO v_client3_id FROM clients WHERE company_id = v_company_id AND name = 'Clinique Les Lilas' LIMIT 1;

  -- Create a quote (Devis)
  INSERT INTO documents (company_id, client_id, type, number, status, issue_date, due_date, subtotal_ht, tva_amount, total_ttc, currency, notes, payment_terms, view_token)
  VALUES (v_company_id, v_client1_id, 'quote', 'DEV-2026-001', 'sent', '2026-05-15', '2026-06-15', 89500.00, 17560.00, 107060.00, 'MAD', 'Devis valable 30 jours. Prix révisables selon fluctuation des matériaux.', 'Acompte 30% à la commande, solde à la livraison.', 'dev-sample-token-001')
  RETURNING id INTO v_quote_id;

  -- Quote lines
  INSERT INTO document_lines (document_id, position, description, quantity, unit_price, tva_rate, total_ht) VALUES
    (v_quote_id, 0, 'Ciment CPJ45 (sac 50kg)', 200, 95.00, 20, 19000.00),
    (v_quote_id, 1, 'Fer à béton 12mm (6m)', 150, 85.00, 20, 12750.00),
    (v_quote_id, 2, 'Brique rouge 20x10x5', 5000, 2.50, 20, 12500.00),
    (v_quote_id, 3, 'Sable de construction (m³)', 25, 180.00, 20, 4500.00),
    (v_quote_id, 4, 'Gravier 15/25 (m³)', 30, 220.00, 20, 6600.00),
    (v_quote_id, 5, 'Main d''œuvre maçon', 200, 120.00, 14, 24000.00),
    (v_quote_id, 6, 'Main d''œuvre manœuvre', 150, 70.00, 14, 10500.00);

  -- Create an invoice (Facture)
  INSERT INTO documents (company_id, client_id, type, number, status, issue_date, due_date, subtotal_ht, tva_amount, total_ttc, currency, notes, payment_terms, view_token)
  VALUES (v_company_id, v_client2_id, 'invoice', 'FAC-2026-001', 'sent', '2026-05-20', '2026-06-20', 32000.00, 6160.00, 38160.00, 'MAD', 'Facture pour travaux de rénovation salle de classe.', 'Paiement à 30 jours par virement bancaire.', 'fac-sample-token-001')
  RETURNING id INTO v_invoice_id;

  -- Invoice lines
  INSERT INTO document_lines (document_id, position, description, quantity, unit_price, tva_rate, total_ht) VALUES
    (v_invoice_id, 0, 'Ciment CPJ45 (sac 50kg)', 50, 95.00, 20, 4750.00),
    (v_invoice_id, 1, 'Brique rouge 20x10x5', 2000, 2.50, 20, 5000.00),
    (v_invoice_id, 2, 'Main d''œuvre maçon', 100, 120.00, 14, 12000.00),
    (v_invoice_id, 3, 'Étude technique', 1, 5000.00, 20, 5000.00);

  -- Create another invoice (paid)
  INSERT INTO documents (company_id, client_id, type, number, status, issue_date, due_date, subtotal_ht, tva_amount, total_ttc, currency, notes, view_token)
  VALUES (v_company_id, v_client3_id, 'invoice', 'FAC-2026-002', 'paid', '2026-04-01', '2026-05-01', 28750.00, 5750.00, 34500.00, 'MAD', 'Travaux de réfection mur d''enceinte.', 'fac-sample-token-002')
  RETURNING id INTO v_invoice_id;

  INSERT INTO document_lines (document_id, position, description, quantity, unit_price, tva_rate, total_ht) VALUES
    (v_invoice_id, 0, 'Brique rouge 20x10x5', 3000, 2.50, 20, 7500.00),
    (v_invoice_id, 1, 'Ciment CPJ45 (sac 50kg)', 100, 95.00, 20, 9500.00),
    (v_invoice_id, 2, 'Sable de construction (m³)', 15, 180.00, 20, 2700.00),
    (v_invoice_id, 3, 'Main d''œuvre maçon', 80, 120.00, 14, 9600.00);

  -- Create overdue invoice
  INSERT INTO documents (company_id, client_id, type, number, status, issue_date, due_date, subtotal_ht, tva_amount, total_ttc, currency, notes, view_token)
  VALUES (v_company_id, v_client1_id, 'invoice', 'FAC-2026-003', 'overdue', '2026-03-15', '2026-04-15', 15000.00, 3000.00, 18000.00, 'MAD', 'Travaux supplémentaires non prévus au devis initial.', 'fac-sample-token-003');

  INSERT INTO document_lines (document_id, position, description, quantity, unit_price, tva_rate, total_ht) VALUES
    (v_invoice_id, 0, 'Main d''œuvre manœuvre', 100, 70.00, 14, 7000.00),
    (v_invoice_id, 1, 'Location matériel', 5, 800.00, 20, 4000.00);

END $$;
