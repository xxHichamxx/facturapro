import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ReactPDF from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/documents/invoice-pdf";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: document } = await supabase
    .from("documents")
    .select("*, client:clients(*), company:companies(*)")
    .eq("id", params.id)
    .single();

  if (!document) {
    return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  }

  const { data: lines } = await supabase
    .from("document_lines")
    .select("*")
    .eq("document_id", document.id)
    .order("position");

  try {
    const buffer = await ReactPDF.renderToBuffer(
      <InvoicePDF document={document} lines={lines ?? []} />,
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${document.number}.pdf"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : "";
    console.error("PDF generation error:", message);
    console.error("PDF generation stack:", stack);
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF", details: message },
      { status: 500 },
    );
  }
}
