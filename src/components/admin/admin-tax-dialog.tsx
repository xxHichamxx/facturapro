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

export function AdminTaxDialog({ taxRate, children }: { taxRate?: any; children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(taxRate?.name ?? "");
  const [rate, setRate] = useState(taxRate?.rate ?? 20);
  const [appliesTo, setAppliesTo] = useState(taxRate?.applies_to ?? "all");
  const [isDefault, setIsDefault] = useState(taxRate?.is_default ?? false);
  const [companyId, setCompanyId] = useState(taxRate?.company_id ?? "");
  const [companies, setCompanies] = useState<any[]>([]);

  const loadCompanies = async () => {
    const { data } = await supabase.from("companies").select("id, name").order("name");
    setCompanies(data ?? []);
  };

  const handleSave = async () => {
    if (!name || !companyId) { toast.error("Nom et entreprise requis"); return; }
    setLoading(true);
    const payload = { name, rate: Number(rate), applies_to: appliesTo, is_default: isDefault, company_id: companyId };
    if (taxRate) {
      await supabase.from("tax_rates").update(payload).eq("id", taxRate.id);
      toast.success("Taux mis à jour");
    } else {
      await supabase.from("tax_rates").insert(payload);
      toast.success("Taux créé");
    }
    setOpen(false); router.refresh(); setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) loadCompanies(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{taxRate ? "Modifier le taux" : "Nouveau Taux de TVA"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Entreprise *</Label>
            <Select value={companyId} onValueChange={setCompanyId} disabled={!!taxRate}>
              <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
              <SelectContent>{companies.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Nom *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="TVA 20%" /></div>
          <div className="space-y-2"><Label>Taux (%) *</Label><Input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} min={0} max={100} /></div>
          <div className="space-y-2">
            <Label>S&apos;applique &agrave;</Label>
            <Select value={appliesTo} onValueChange={setAppliesTo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tout</SelectItem>
                <SelectItem value="products">Produits</SelectItem>
                <SelectItem value="services">Services</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Défaut</Label>
            <Select value={isDefault ? "true" : "false"} onValueChange={(v) => setIsDefault(v === "true")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="true">Oui</SelectItem><SelectItem value="false">Non</SelectItem></SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full">{loading ? "..." : "Enregistrer"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
