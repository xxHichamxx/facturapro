"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Image from "next/image";

const settingsSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  country: z.string(),
  ice: z.string().min(6),
  if_fiscal: z.string().min(6),
  rc: z.string().min(1),
  patente: z.string().min(1),
  default_currency: z.enum(["MAD", "EUR", "USD"]),
  default_tva_rate: z.number().min(0).max(20),
  invoice_prefix: z.string().min(1),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export function CompanySettingsForm({ company }: { company: any }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { register, setValue, watch, handleSubmit } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: company.name,
      address: company.address,
      city: company.city,
      country: company.country || "Maroc",
      ice: company.ice,
      if_fiscal: company.if_fiscal,
      rc: company.rc,
      patente: company.patente,
      default_currency: company.default_currency,
      default_tva_rate: company.default_tva_rate,
      invoice_prefix: company.invoice_prefix,
    },
  });

  const handleLogoUpload = async () => {
    if (!logo) return;
    setUploading(true);
    const fileName = `logos/${company.id}/${Date.now()}-${logo.name}`;
    const { error } = await supabase.storage.from("company-assets").upload(fileName, logo, { upsert: true });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("company-assets").getPublicUrl(fileName);
    await supabase.from("companies").update({ logo_url: publicUrl }).eq("id", company.id);
    toast.success("Logo mis a jour");
    setUploading(false);
    router.refresh();
  };

  const onSubmit = async (data: SettingsForm) => {
    setLoading(true);
    const { error } = await supabase.from("companies").update(data).eq("id", company.id);
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("Parametres mis a jour");
    router.refresh();
    setLoading(false);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Logo</h3>
            <div className="flex items-center gap-4">
              {company.logo_url && <Image src={company.logo_url} alt="Logo" width={64} height={64} className="rounded-lg object-cover border" />}
              <Input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
              <Button type="button" variant="outline" onClick={handleLogoUpload} disabled={!logo || uploading}>{uploading ? "..." : "Upload"}</Button>
            </div>
          </div>
          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Informations generales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nom *</Label><Input {...register("name")} /></div>
              <div className="space-y-2"><Label>Ville *</Label><Input {...register("city")} /></div>
              <div className="space-y-2 col-span-2"><Label>Adresse *</Label><Input {...register("address")} /></div>
              <div className="space-y-2"><Label>Pays</Label><Input {...register("country")} /></div>
              <div className="space-y-2"><Label>Prefixe facture</Label><Input {...register("invoice_prefix")} /></div>
            </div>
          </div>
          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Mentions legales (Maroc)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>ICE *</Label><Input {...register("ice")} maxLength={15} /></div>
              <div className="space-y-2"><Label>IF *</Label><Input {...register("if_fiscal")} /></div>
              <div className="space-y-2"><Label>RC *</Label><Input {...register("rc")} /></div>
              <div className="space-y-2"><Label>Patente *</Label><Input {...register("patente")} /></div>
            </div>
          </div>
          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Preferences</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Devise par defaut</Label>
                <Select value={watch("default_currency")} onValueChange={(v) => setValue("default_currency", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAD">MAD (DH)</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>TVA par defaut (%)</Label>
                <Select value={String(watch("default_tva_rate") ?? 20)} onValueChange={(v) => setValue("default_tva_rate", Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20%</SelectItem><SelectItem value="14">14%</SelectItem>
                    <SelectItem value="10">10%</SelectItem><SelectItem value="7">7%</SelectItem>
                    <SelectItem value="0">0%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">{loading ? "Enregistrement..." : "Enregistrer les parametres"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
