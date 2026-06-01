import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DocumentEditor } from "@/components/documents/document-editor";
import { redirect } from "next/navigation";

export default async function NewInvoicePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", user!.id)
    .single();

  if (!company) {
    redirect("/onboarding");
  }

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
    />
  );
}
