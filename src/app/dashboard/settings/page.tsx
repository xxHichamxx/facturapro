import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CompanySettingsForm } from "@/components/company/company-settings-form";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase.from("companies").select("*").eq("owner_id", user.id).single();
  if (!company) redirect("/onboarding");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-primary-dark">Paramètres entreprise</h1>
      <CompanySettingsForm company={company} />
    </div>
  );
}
