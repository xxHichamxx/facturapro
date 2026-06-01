import { createServerSupabaseClient } from "./supabase/server";

export async function generateDocumentNumber(
  companyId: string,
  type: "invoice" | "quote",
): Promise<string> {
  const supabase = await createServerSupabaseClient();

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("invoice_prefix")
    .eq("id", companyId)
    .single();

  if (companyError) {
    throw new Error(`Failed to fetch company: ${companyError.message}`);
  }

  const prefix = company?.invoice_prefix || (type === "invoice" ? "FAC" : "DEV");
  const year = new Date().getFullYear();

  const { data: lastDoc, error: docError } = await supabase
    .from("documents")
    .select("number")
    .eq("company_id", companyId)
    .eq("type", type)
    .like("number", `%${year}%`)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (docError && docError.code !== "PGRST116") {
    throw new Error(`Failed to fetch last document: ${docError.message}`);
  }

  let nextNumber = 1;
  if (lastDoc?.number) {
    const match = lastDoc.number.match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  return `${prefix}-${year}-${String(nextNumber).padStart(3, "0")}`;
}

export async function generateDocumentNumberWithRetry(
  companyId: string,
  type: "invoice" | "quote",
  maxRetries: number = 3,
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await generateDocumentNumber(companyId, type);
    } catch {
      if (attempt === maxRetries - 1) throw new Error("Failed to generate unique document number");
      await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
    }
  }
  throw new Error("Failed to generate unique document number");
}
