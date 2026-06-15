import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { pdf } from "@react-pdf/renderer";
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
    const instance = pdf(
      <InvoicePDF document={document} lines={lines ?? []} />,
    );
    const nodeStream = await instance.toBuffer();
    const chunks: Buffer[] = [];

    for await (const chunk of nodeStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${document.number}.pdf"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("PDF generation error:", message);
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF", details: message },
      { status: 500 },
    );
  }
}
