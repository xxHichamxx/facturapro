import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateDocumentNumberWithRetry } from "@/lib/numbering";
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

  if (!quoteId) {
    return NextResponse.json({ error: "quoteId requis" }, { status: 400 });
  }

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

  if (quote.status !== "accepted") {
    return NextResponse.json({ error: "Le devis doit être accepté avant conversion" }, { status: 400 });
  }

  let number: string;
  try {
    number = await generateDocumentNumberWithRetry(quote.company_id, "invoice");
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to generate document number" }, { status: 500 });
  }

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
    if (error.code === "23505") {
      return NextResponse.json({ error: "Ce numéro de facture existe déjà. Veuillez réessayer." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

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

    const { error: linesError } = await supabase.from("document_lines").insert(lineInserts);

    if (linesError) {
      await supabase.from("documents").delete().eq("id", newDoc.id);
      return NextResponse.json({ error: "Erreur lors de la copie des lignes" }, { status: 500 });
    }
  }

  const { error: updateError } = await supabase
    .from("documents")
    .update({ status: "accepted" })
    .eq("id", quoteId);

  if (updateError) {
    return NextResponse.json(newDoc);
  }

  return NextResponse.json(newDoc);
}
