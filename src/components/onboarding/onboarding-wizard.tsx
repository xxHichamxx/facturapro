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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Check } from "lucide-react";

export function OnboardingWizard() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    shouldUnregister: false,
    defaultValues: {
      name: "",
      address: "",
      city: "",
      country: "Maroc",
      ice: "",
      if_fiscal: "",
      rc: "",
      patente: "",
      default_currency: "MAD",
      default_tva_rate: 20,
      invoice_prefix: "FAC",
    },
  });

  const { register, setValue, watch, handleSubmit, formState: { errors } } = form;

  const skipOnboarding = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { error } = await supabase.from("companies").insert({
      name: "Mon Entreprise",
      address: "A completer",
      city: "A completer",
      country: "Maroc",
      ice: "A_COMPLETER",
      if_fiscal: "A_COMPLETER",
      rc: "A_COMPLETER",
      patente: "A_COMPLETER",
      default_currency: "MAD",
      default_tva_rate: 20,
      invoice_prefix: "FAC",
      owner_id: user.id,
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("Vous pouvez completer vos informations dans Parametres.");
    window.location.href = "/dashboard";
  };

  const onSubmit = async (data: CompanyFormData) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Session expiree. Reconnectez-vous.");
      router.push("/login");
      return;
    }
    const { error } = await supabase.from("companies").insert({ ...data, owner_id: user.id });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("Entreprise configuree !");
    window.location.href = "/dashboard";
  };

  const isStep1Valid = watch("name") && watch("address") && watch("city");
  const isStep2Valid = watch("ice") && watch("if_fiscal") && watch("rc") && watch("patente");

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl">Configuration entreprise</CardTitle>
        <CardDescription>Etape {step}/3</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center gap-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${n <= step ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                {n < step ? <Check className="h-4 w-4" /> : n}
              </div>
              {n < 3 && <div className={`h-px w-6 ${n < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input {...register("name")} placeholder="SARL BTP Construction" />
                {errors.name && <p className="text-xs text-alert">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Adresse *</Label>
                <Input {...register("address")} placeholder="123 Avenue Hassan II" />
                {errors.address && <p className="text-xs text-alert">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ville *</Label>
                  <Input {...register("city")} placeholder="Casablanca" />
                  {errors.city && <p className="text-xs text-alert">{errors.city.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Pays</Label>
                  <Input {...register("country")} />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>ICE * (15 chiffres)</Label>
                <Input {...register("ice")} placeholder="001122334455667" maxLength={15} />
                {errors.ice && <p className="text-xs text-alert">{errors.ice.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>IF * (Identifiant Fiscal)</Label>
                <Input {...register("if_fiscal")} placeholder="12345678" />
                {errors.if_fiscal && <p className="text-xs text-alert">{errors.if_fiscal.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>RC *</Label>
                  <Input {...register("rc")} placeholder="123456" />
                  {errors.rc && <p className="text-xs text-alert">{errors.rc.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Patente *</Label>
                  <Input {...register("patente")} placeholder="7890123" />
                  {errors.patente && <p className="text-xs text-alert">{errors.patente.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Select value={watch("default_currency")} onValueChange={(v) => setValue("default_currency", v as "MAD" | "EUR" | "USD")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAD">MAD (DH)</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>TVA (%)</Label>
                  <Select value={String(watch("default_tva_rate") ?? 20)} onValueChange={(v) => setValue("default_tva_rate", Number(v))}>
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
              <div className="space-y-2">
                <Label>Prefixe facture</Label>
                <Input {...register("invoice_prefix")} />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="font-semibold">{watch("name") || "—"}</h4>
              <p className="text-sm text-muted-foreground">{watch("address")}, {watch("city")}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2">
                <span className="text-muted-foreground">ICE:</span><span>{watch("ice")}</span>
                <span className="text-muted-foreground">IF:</span><span>{watch("if_fiscal")}</span>
                <span className="text-muted-foreground">RC:</span><span>{watch("rc")}</span>
                <span className="text-muted-foreground">Patente:</span><span>{watch("patente")}</span>
                <span className="text-muted-foreground">Devise:</span><span>{watch("default_currency")}</span>
                <span className="text-muted-foreground">TVA:</span><span>{watch("default_tva_rate")}%</span>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                ← Retour
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              {step === 1 && (
                <Button type="button" variant="ghost" className="text-muted-foreground" onClick={skipOnboarding} disabled={loading}>
                  Passer → Completer plus tard
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={() => setStep(step + 1)} disabled={step === 1 ? !isStep1Valid : !isStep2Valid}>
                  Suivant →
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? "Enregistrement..." : "Terminer"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
