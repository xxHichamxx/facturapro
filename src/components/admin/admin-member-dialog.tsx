"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const roles = [
  { value: "admin", label: "Admin" },
  { value: "employee", label: "Employé" },
  { value: "accountant", label: "Comptable" },
  { value: "viewer", label: "Visiteur" },
];

export function AdminMemberDialog({ companyId, member, children }: { companyId: string; member?: any; children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(member?.user?.email ?? "");
  const [role, setRole] = useState(member?.role ?? "employee");

  const handleSave = async () => {
    if (!email) { toast.error("Email requis"); return; }
    setLoading(true);

    const { data: profile } = await supabase.from("user_profiles").select("id").eq("id", email).single();
    let userId = profile?.id;

    if (!userId) {
      const { data: userData } = await supabase.rpc("lookup_user_by_email", { p_email: email });
      userId = userData;
    }

    if (member) {
      const { error } = await supabase.from("company_members").update({ role }).eq("id", member.id);
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success("Membre mis à jour");
    } else {
      const { error } = await supabase.from("company_members").insert({
        company_id: companyId, user_id: email, role, joined_at: new Date().toISOString(),
      });
      if (error) {
        if (error.code === "23503") {
          toast.error("Utilisateur introuvable. Vérifiez l&apos;email ou l&apos;ID.");
        } else if (error.code === "23505") {
          toast.error("Ce membre existe d&eacute;j&agrave;");
        } else {
          toast.error(error.message);
        }
        setLoading(false);
        return;
      }
      toast.success("Membre ajouté !");
    }

    setOpen(false);
    router.refresh();
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{member ? "Modifier le membre" : "Ajouter un membre"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email ou ID utilisateur</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!member} placeholder="user@email.com" />
          </div>
          <div className="space-y-2">
            <Label>Rôle</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {roles.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? "Enregistrement..." : member ? "Mettre à jour" : "Ajouter"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
