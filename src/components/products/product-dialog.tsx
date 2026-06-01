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

export function ProductDialog({ companyId, categories, product, children }: { companyId: string; categories: any[]; product?: any; children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(product?.name ?? "");
  const [desc, setDesc] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.unit_price ?? 0);
  const [tva, setTva] = useState(product?.default_tva_rate ?? 20);
  const [unit, setUnit] = useState(product?.unit ?? "unité");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [catId, setCatId] = useState(product?.category_id ?? "");

  const save = async () => {
    if (!name.trim()) { toast.error("Nom requis"); return; }
    setLoading(true);
    const payload = { name, description: desc, unit_price: Number(price), default_tva_rate: Number(tva), unit, sku, category_id: catId || null, company_id: companyId };
    if (product) {
      const { error } = await supabase.from("products").update(payload).eq("id", product.id);
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success("Produit mis a jour");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success("Produit cree");
    }
    setOpen(false); router.refresh(); setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{product ? "Modifier" : "Nouveau produit"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2"><Label>Nom *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Description</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Prix unitaire</Label><Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></div>
            <div className="space-y-2"><Label>TVA %</Label>
              <Select value={String(tva)} onValueChange={(v) => setTva(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20%</SelectItem><SelectItem value="14">14%</SelectItem><SelectItem value="10">10%</SelectItem><SelectItem value="7">7%</SelectItem><SelectItem value="0">0%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Unite</Label><Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="unité, heure, m²..." /></div>
            <div className="space-y-2"><Label>SKU</Label><Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="REF-001" /></div>
          </div>
          <div className="space-y-2">
            <Label>Categorie</Label>
            <Select value={catId} onValueChange={setCatId}>
              <SelectTrigger><SelectValue placeholder="Aucune" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucune</SelectItem>
                {categories?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={save} disabled={loading} className="w-full">{loading ? "..." : "Enregistrer"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
