import { createServerSupabaseClient } from "./supabase/server";

export async function generateDocumentNumber(
  companyId: string,
  type: "invoice" | "quote",
): Promise<string> {
  const supabase = await createServerSupabaseClient();

  const { data: company } = await supabase
    .from("companies")
    .select("invoice_prefix")
    .eq("id", companyId)
    .single();

  const prefix = company?.invoice_prefix || (type === "invoice" ? "FAC" : "DEV");
  const year = new Date().getFullYear();

  const { data: lastDoc } = await supabase
    .from("documents")
    .select("number")
    .eq("company_id", companyId)
    .eq("type", type)
    .like("number", `%${year}%`)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let nextNumber = 1;
  if (lastDoc?.number) {
    const match = lastDoc.number.match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  return `${prefix}-${year}-${String(nextNumber).padStart(3, "0")}`;
}
