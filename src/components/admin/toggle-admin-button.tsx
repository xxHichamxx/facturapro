"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, ShieldOff } from "lucide-react";
import { toast } from "sonner";

export function ToggleAdminButton({ userId, isSuperAdmin }: { userId: string; isSuperAdmin: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const { error } = await supabase.from("user_profiles").update({ is_super_admin: !isSuperAdmin }).eq("id", userId);
    if (error) { toast.error(error.message); } else { toast.success(isSuperAdmin ? "Admin revoque" : "Admin accorde"); router.refresh(); }
    setLoading(false);
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggle} disabled={loading}>
      {isSuperAdmin ? <><ShieldOff className="mr-1 h-4 w-4 text-alert" /> Retirer</> : <><Shield className="mr-1 h-4 w-4" /> Promouvoir</>}
    </Button>
  );
}
