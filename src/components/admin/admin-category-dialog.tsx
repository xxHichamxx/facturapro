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

export function AdminCategoryDialog({ category, children }: { category?: any; children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [companyId, setCompanyId] = useState(category?.company_id ?? "");
  const [companies, setCompanies] = useState<any[]>([]);

  const loadCompanies = async () => {
    const { data } = await supabase.from("companies").select("id, name").order("name");
    setCompanies(data ?? []);
  };

  const handleSave = async () => {
    if (!name || !companyId) { toast.error("Nom et entreprise requis"); return; }
    setLoading(true);
    const payload = { name, description, company_id: companyId };
    if (category) {
      await supabase.from("product_categories").update(payload).eq("id", category.id);
      toast.success("Catégorie mise à jour");
    } else {
      await supabase.from("product_categories").insert(payload);
      toast.success("Catégorie créée");
    }
    setOpen(false); router.refresh(); setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) loadCompanies(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{category ? "Modifier la catégorie" : "Nouvelle Catégorie"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Entreprise *</Label>
            <Select value={companyId} onValueChange={setCompanyId} disabled={!!category}>
              <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
              <SelectContent>{companies.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Nom *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <Button onClick={handleSave} disabled={loading} className="w-full">{loading ? "..." : "Enregistrer"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
