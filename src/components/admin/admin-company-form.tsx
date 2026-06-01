"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companySchema, type CompanyFormData } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function AdminCompanyForm({ company }: { company?: any }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name ?? "",
      address: company?.address ?? "",
      city: company?.city ?? "",
      country: company?.country ?? "Maroc",
      ice: company?.ice ?? "",
      if_fiscal: company?.if_fiscal ?? "",
      rc: company?.rc ?? "",
      patente: company?.patente ?? "",
      default_currency: company?.default_currency ?? "MAD",
      default_tva_rate: company?.default_tva_rate ?? 20,
      invoice_prefix: company?.invoice_prefix ?? "FAC",
    },
  });

  const { register, setValue, formState: { errors } } = form;

  const onSubmit = async (data: CompanyFormData) => {
    setLoading(true);

    if (company) {
      const { error } = await supabase.from("companies").update(data).eq("id", company.id);
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success("Entreprise mise à jour !");
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("companies").insert({ ...data, owner_id: user?.id });
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success("Entreprise créée !");
    }

    router.push("/admin/companies");
    router.refresh();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-alert">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville *</Label>
              <Input id="city" {...register("city")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresse *</Label>
            <Input id="address" {...register("address")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Input id="country" {...register("country")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_prefix">Préfixe facture</Label>
              <Input id="invoice_prefix" {...register("invoice_prefix")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ice">ICE *</Label>
              <Input id="ice" {...register("ice")} placeholder="001122334455667" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="if_fiscal">IF *</Label>
              <Input id="if_fiscal" {...register("if_fiscal")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rc">RC *</Label>
              <Input id="rc" {...register("rc")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patente">Patente *</Label>
              <Input id="patente" {...register("patente")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Devise</Label>
              <Select defaultValue={company?.default_currency ?? "MAD"} onValueChange={(v) => setValue("default_currency", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAD">MAD (DH)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>TVA par défaut (%)</Label>
              <Select defaultValue={String(company?.default_tva_rate ?? 20)} onValueChange={(v) => setValue("default_tva_rate", Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20%</SelectItem>
                  <SelectItem value="14">14%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="7">7%</SelectItem>
                  <SelectItem value="0">0%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/companies")}>Annuler</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : company ? "Mettre à jour" : "Créer l'entreprise"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
