import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DocumentEditor } from "@/components/documents/document-editor";
import { redirect, notFound } from "next/navigation";

export default async function EditInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", user!.id)
    .single();

  if (!company) redirect("/onboarding");

  const { data: document } = await supabase
    .from("documents")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!document) notFound();

  const { data: lines } = await supabase
    .from("document_lines")
    .select("*")
    .eq("document_id", document.id)
    .order("position");

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("company_id", company.id)
    .order("name");

  return (
    <DocumentEditor
      company={company}
      clients={clients ?? []}
      type="invoice"
      initialData={{
        ...document,
        lines: lines ?? [],
      }}
      documentId={document.id}
    />
  );
}
