import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateDocumentNumberWithRetry } from "@/lib/numbering";
import { documentSchema } from "@/lib/validations";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();

  const parsed = documentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { client_id, type, issue_date, due_date, currency, lines, notes, payment_terms } = parsed.data;
  const company_id = body.company_id;
  const subtotal_ht = body.subtotal_ht;
  const tva_amount = body.tva_amount;
  const total_ttc = body.total_ttc;

  let number: string;
  try {
    number = await generateDocumentNumberWithRetry(company_id, type);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to generate document number" }, { status: 500 });
  }

  const viewToken = uuidv4();

  const { data: document, error: docError } = await supabase
    .from("documents")
    .insert({
      company_id,
      client_id,
      type,
      number,
      status: "draft",
      issue_date,
      due_date,
      currency,
      subtotal_ht,
      tva_amount,
      total_ttc,
      notes,
      payment_terms,
      view_token: viewToken,
    })
    .select()
    .single();

  if (docError) {
    if (docError.code === "23505") {
      return NextResponse.json({ error: "Ce numéro de document existe déjà. Veuillez réessayer." }, { status: 409 });
    }
    return NextResponse.json({ error: docError.message }, { status: 500 });
  }

  if (lines && lines.length > 0) {
    const lineInserts = lines.map((line: any, i: number) => ({
      document_id: document.id,
      position: i,
      description: line.description,
      quantity: line.quantity,
      unit_price: line.unit_price,
      tva_rate: line.tva_rate,
      total_ht: (line.quantity || 0) * (line.unit_price || 0),
    }));

    const { error: linesError } = await supabase.from("document_lines").insert(lineInserts);

    if (linesError) {
      await supabase.from("documents").delete().eq("id", document.id);
      return NextResponse.json({ error: "Erreur lors de l'enregistrement des lignes" }, { status: 500 });
    }
  }

  return NextResponse.json(document);
}
