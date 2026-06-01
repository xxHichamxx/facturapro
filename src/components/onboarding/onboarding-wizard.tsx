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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Check, FileText, Building2, ArrowRight, ArrowLeft } from "lucide-react";

const steps = [
  { id: 1, title: "Informations entreprise", icon: Building2 },
  { id: 2, title: "Mentions légales (Maroc)", icon: FileText },
  { id: 3, title: "Résumé", icon: Check },
];

export function OnboardingWizard() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
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

  const { register, setValue, watch, formState: { errors } } = form;

  const onSubmit = async (data: CompanyFormData) => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Session expirée. Veuillez vous reconnecter.");
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("companies").insert({
      ...data,
      owner_id: user.id,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Votre entreprise a été configurée !");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl">Configuration de votre entreprise</CardTitle>
        <CardDescription>
          Étape {step}/3 — {
            step === 1 ? "Informations générales" :
            step === 2 ? "Mentions légales Maroc" :
            "Vérification"
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-6 flex items-center justify-center gap-2">
          {steps.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  s.id <= step
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.id < step ? <Check className="h-4 w-4" /> : s.id}
              </div>
              {s.id < 3 && (
                <div
                  className={`h-px w-8 ${
                    s.id < step ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l&apos;entreprise *</Label>
                <Input id="name" {...register("name")} placeholder="SARL BTP Construction" />
                {errors.name && <p className="text-xs text-alert">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse *</Label>
                <Input id="address" {...register("address")} placeholder="123 Avenue Hassan II" />
                {errors.address && <p className="text-xs text-alert">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  <Input id="city" {...register("city")} placeholder="Casablanca" />
                  {errors.city && <p className="text-xs text-alert">{errors.city.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input id="country" {...register("country")} defaultValue="Maroc" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ice">ICE * (Identifiant Commun de l&apos;Entreprise)</Label>
                <Input id="ice" {...register("ice")} placeholder="001122334455667" maxLength={15} />
                {errors.ice && <p className="text-xs text-alert">{errors.ice.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="if_fiscal">IF * (Identifiant Fiscal)</Label>
                <Input id="if_fiscal" {...register("if_fiscal")} placeholder="12345678" />
                {errors.if_fiscal && <p className="text-xs text-alert">{errors.if_fiscal.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rc">RC * (Registre de Commerce)</Label>
                  <Input id="rc" {...register("rc")} placeholder="123456" />
                  {errors.rc && <p className="text-xs text-alert">{errors.rc.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patente">Patente *</Label>
                  <Input id="patente" {...register("patente")} placeholder="7890123" />
                  {errors.patente && <p className="text-xs text-alert">{errors.patente.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Devise par défaut</Label>
                  <Select
                    defaultValue="MAD"
                    onValueChange={(v) => setValue("default_currency", v as "MAD" | "EUR" | "USD")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAD">MAD (Dirham)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      <SelectItem value="USD">USD (Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>TVA par défaut (%)</Label>
                  <Select
                    defaultValue="20"
                    onValueChange={(v) => setValue("default_tva_rate", Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20%</SelectItem>
                      <SelectItem value="14">14%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="7">7%</SelectItem>
                      <SelectItem value="0">0% (Exonéré)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice_prefix">Préfixe de facture</Label>
                <Input id="invoice_prefix" {...register("invoice_prefix")} placeholder="FAC" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <h4 className="font-semibold">{watch("name") || "—"}</h4>
                <p className="text-sm text-muted-foreground">{watch("address")}, {watch("city")}</p>
                <div className="text-sm space-y-1">
                  <p><strong>ICE:</strong> {watch("ice") || "—"}</p>
                  <p><strong>IF:</strong> {watch("if_fiscal") || "—"}</p>
                  <p><strong>RC:</strong> {watch("rc") || "—"}</p>
                  <p><strong>Patente:</strong> {watch("patente") || "—"}</p>
                  <p><strong>Devise:</strong> {watch("default_currency")}</p>
                  <p><strong>TVA:</strong> {watch("default_tva_rate")}%</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
              </Button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <Button type="button" onClick={() => setStep(step + 1)}>
                Suivant <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                {loading ? "Enregistrement..." : "Terminer la configuration"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
