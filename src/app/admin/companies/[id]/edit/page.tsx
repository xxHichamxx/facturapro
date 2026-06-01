import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminCompanyForm } from "@/components/admin/admin-company-form";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditCompanyPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: company } = await supabase.from("companies").select("*").eq("id", params.id).single();
  if (!company) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-primary-dark">Modifier l&apos;entreprise</h1>
      <AdminCompanyForm company={company} />
    </div>
  );
}
