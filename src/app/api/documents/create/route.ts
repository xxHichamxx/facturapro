import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateDocumentNumber } from "@/lib/numbering";
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
  const { company_id, type, client_id, issue_date, due_date, currency, lines, subtotal_ht, tva_amount, total_ttc, notes, payment_terms } = body;

  const number = await generateDocumentNumber(company_id, type);

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
      return NextResponse.json({ error: linesError.message }, { status: 500 });
    }
  }

  return NextResponse.json(document);
}
