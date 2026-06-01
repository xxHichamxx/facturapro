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

  const { quoteId } = await request.json();

  const { data: quote } = await supabase
    .from("documents")
    .select("*")
    .eq("id", quoteId)
    .single();

  if (!quote) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  if (quote.type !== "quote") {
    return NextResponse.json({ error: "Ce document n'est pas un devis" }, { status: 400 });
  }

  const number = await generateDocumentNumber(quote.company_id, "invoice");

  const { data: newDoc, error } = await supabase
    .from("documents")
    .insert({
      company_id: quote.company_id,
      client_id: quote.client_id,
      type: "invoice",
      number,
      status: "draft",
      issue_date: new Date().toISOString().split("T")[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      converted_from_quote_id: quote.id,
      subtotal_ht: quote.subtotal_ht,
      tva_amount: quote.tva_amount,
      total_ttc: quote.total_ttc,
      currency: quote.currency,
      notes: quote.notes,
      payment_terms: quote.payment_terms,
      view_token: uuidv4(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Copy lines
  const { data: quoteLines } = await supabase
    .from("document_lines")
    .select("*")
    .eq("document_id", quoteId)
    .order("position");

  if (quoteLines && quoteLines.length > 0) {
    const lineInserts = quoteLines.map((line: any) => ({
      document_id: newDoc.id,
      position: line.position,
      description: line.description,
      quantity: line.quantity,
      unit_price: line.unit_price,
      tva_rate: line.tva_rate,
      total_ht: line.total_ht,
    }));

    await supabase.from("document_lines").insert(lineInserts);
  }

  // Update original quote status
  await supabase
    .from("documents")
    .update({ status: "accepted" })
    .eq("id", quoteId);

  return NextResponse.json(newDoc);
}
