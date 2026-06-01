import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  address: z.string().min(5, "L'adresse est requise"),
  city: z.string().min(2, "La ville est requise"),
  country: z.string(),
  ice: z.string().min(6, "ICE requis (format: 15 chiffres)"),
  if_fiscal: z.string().min(6, "IF requis"),
  rc: z.string().min(1, "RC requis"),
  patente: z.string().min(1, "Patente requise"),
  default_currency: z.enum(["MAD", "EUR", "USD"]),
  default_tva_rate: z.number().min(0).max(20),
  invoice_prefix: z.string(),
});

export const clientSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide").or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  ice_client: z.string().optional(),
  notes: z.string().optional(),
});

export const documentLineSchema = z.object({
  description: z.string().min(1, "Description requise"),
  quantity: z.number().min(0.01, "Quantité minimale: 0.01"),
  unit_price: z.number().min(0, "Prix unitaire requis"),
  tva_rate: z.number().min(0).max(20),
});

export const documentSchema = z.object({
  client_id: z.string().min(1, "Client requis"),
  type: z.enum(["invoice", "quote"]),
  issue_date: z.string().min(1, "Date requise"),
  due_date: z.string().min(1, "Date d'échéance requise"),
  currency: z.enum(["MAD", "EUR", "USD"]),
  lines: z.array(documentLineSchema).min(1, "Au moins une ligne requise"),
  notes: z.string().optional(),
  payment_terms: z.string().optional(),
  acompte: z.number().min(0).optional(),
});

export type CompanyFormData = z.infer<typeof companySchema>;
export type ClientFormData = z.infer<typeof clientSchema>;
export type DocumentFormData = z.infer<typeof documentSchema>;
