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

export function AdminProductDialog({ product, children }: { product?: any; children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [unitPrice, setUnitPrice] = useState(product?.unit_price ?? 0);
  const [tvaRate, setTvaRate] = useState(product?.default_tva_rate ?? 20);
  const [unit, setUnit] = useState(product?.unit ?? "unité");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [companyId, setCompanyId] = useState(product?.company_id ?? "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [companies, setCompanies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const loadCompanies = async () => {
    const { data } = await supabase.from("companies").select("id, name").order("name");
    setCompanies(data ?? []);
  };

  const loadCategories = async () => {
    const { data } = await supabase.from("product_categories").select("id, name").order("name");
    setCategories(data ?? []);
  };

  const handleSave = async () => {
    if (!name || !companyId) { toast.error("Nom et entreprise requis"); return; }
    setLoading(true);

    const payload = { name, description, unit_price: Number(unitPrice), default_tva_rate: Number(tvaRate), unit, sku, category_id: categoryId || null, company_id: companyId, is_active: isActive };

    if (product) {
      const { error } = await supabase.from("products").update(payload).eq("id", product.id);
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success("Produit mis à jour");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success("Produit créé");
    }
    setOpen(false); router.refresh(); setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) { loadCompanies(); loadCategories(); } }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{product ? "Modifier le produit" : "Nouveau Produit"}</DialogTitle></DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label>Entreprise *</Label>
            <Select value={companyId} onValueChange={setCompanyId} disabled={!!product}>
              <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
              <SelectContent>{companies.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Nom *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Prix unitaire</Label><Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} /></div>
            <div className="space-y-2"><Label>TVA %</Label>
              <Select value={String(tvaRate)} onValueChange={(v) => setTvaRate(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20%</SelectItem><SelectItem value="14">14%</SelectItem><SelectItem value="10">10%</SelectItem><SelectItem value="7">7%</SelectItem><SelectItem value="0">0%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Unité</Label><Input value={unit} onChange={(e) => setUnit(e.target.value)} /></div>
            <div className="space-y-2"><Label>SKU</Label><Input value={sku} onChange={(e) => setSku(e.target.value)} /></div>
          </div>
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Aucune" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucune</SelectItem>
                {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Actif</Label>
            <Select value={isActive ? "true" : "false"} onValueChange={(v) => setIsActive(v === "true")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="true">Oui</SelectItem><SelectItem value="false">Non</SelectItem></SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full">{loading ? "Enregistrement..." : product ? "Mettre à jour" : "Créer"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
