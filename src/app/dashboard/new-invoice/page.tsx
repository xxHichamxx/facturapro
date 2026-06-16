import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function NewInvoicePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Test Page</h1>
      <p>User: {user?.email ?? "not found"}</p>
      <p>If you see this, the page renders fine.</p>
    </div>
  );
}
