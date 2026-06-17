"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { documentSchema, type DocumentFormData } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import type { Company, Client } from "@/lib/types";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Package,
} from "lucide-react";
import Link from "next/link";

interface LineData {
  description: string;
  quantity: number;
  unit_price: number;
  tva_rate: number;
}

interface InitialData {
  client_id?: string;
  issue_date?: string;
  due_date?: string;
  currency?: string;
  lines?: LineData[];
  notes?: string;
  payment_terms?: string;
  at_number?: string;
  at_date?: string;
  at_bureau?: string;
}

interface Props {
  company: Company;
  clients: Client[];
  type: "invoice" | "quote";
  initialData?: InitialData;
  documentId?: string;
}

export function DocumentEditor({ company, clients, type, initialData, documentId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const form = useForm<DocumentFormData>({
    defaultValues: {
      client_id: initialData?.client_id ?? "",
      type,
      issue_date: initialData?.issue_date ?? new Date().toISOString().split("T")[0],
      due_date:
        initialData?.due_date ??
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      currency: (initialData?.currency as "MAD" | "EUR" | "USD" | undefined) ?? company.default_currency,
      lines: initialData?.lines ?? [
        { description: "", quantity: 1, unit_price: 0, tva_rate: company.default_tva_rate },
      ],
      notes: initialData?.notes ?? "",
      payment_terms: initialData?.payment_terms ?? "",
      at_number: initialData?.at_number ?? "",
      at_date: initialData?.at_date ?? "",
      at_bureau: initialData?.at_bureau ?? "",
    },
  });

  const { register, control, watch, setValue, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });

  const watchLines = watch("lines");
  const watchCurrency = watch("currency");

  const subtotalHT = watchLines.reduce(
    (sum, line) => sum + (line.quantity || 0) * (line.unit_price || 0),
    0,
  );
  const totalTVA = watchLines.reduce(
    (sum, line) =>
      sum + (line.quantity || 0) * (line.unit_price || 0) * ((line.tva_rate || 0) / 100),
    0,
  );
  const totalTTC = subtotalHT + totalTVA;

  const onSubmit = async (data: DocumentFormData) => {
    setLoading(true);

    if (documentId) {
      // Update existing
      const { error: docError } = await supabase
        .from("documents")
        .update({
          client_id: data.client_id,
          issue_date: data.issue_date,
          due_date: data.due_date,
          currency: data.currency,
          subtotal_ht: subtotalHT,
          tva_amount: totalTVA,
          total_ttc: totalTTC,
          notes: data.notes,
          payment_terms: data.payment_terms,
          at_number: data.at_number || null,
          at_date: data.at_date || null,
          at_bureau: data.at_bureau || null,
        })
        .eq("id", documentId);

      if (docError) {
        toast.error(docError.message);
        setLoading(false);
        return;
      }

      await supabase.from("document_lines").delete().eq("document_id", documentId);

      const lineInserts = data.lines.map((line, i) => ({
        document_id: documentId,
        position: i,
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unit_price,
        tva_rate: line.tva_rate,
        total_ht: line.quantity * line.unit_price,
      }));

      const { error: linesError } = await supabase
        .from("document_lines")
        .insert(lineInserts);

      if (linesError) {
        toast.error("Erreur lors de la mise à jour des lignes");
        setLoading(false);
        return;
      }

      toast.success("Document mis à jour !");
      router.push("/dashboard");
      router.refresh();
    } else {
      // Create new
      const response = await fetch("/api/documents/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          company_id: company.id,
          subtotal_ht: subtotalHT,
          tva_amount: totalTVA,
          total_ttc: totalTTC,
          at_number: data.at_number || null,
          at_date: data.at_date || null,
          at_bureau: data.at_bureau || null,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        toast.error(err.error || "Erreur lors de la création");
        setLoading(false);
        return;
      }

      const result = await response.json();
      toast.success("Document créé avec succès !");
      router.push(`/dashboard/${type === "invoice" ? "invoices" : "quotes"}/${result.id}`);
      router.refresh();
    }
  };

  const [products, setProducts] = useState<any[]>([]);
  const [showProductPicker, setShowProductPicker] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      const supabase = createClient();
      const { data } = await supabase.from("products").select("*").eq("company_id", company.id).eq("is_active", true).order("name");
      setProducts(data ?? []);
    }
    loadProducts();
  }, [company.id]);

  const addLine = () => {
    append({ description: "", quantity: 1, unit_price: 0, tva_rate: company.default_tva_rate });
  };

  const addProductLine = (product: any) => {
    append({
      description: product.name,
      quantity: 1,
      unit_price: product.unit_price,
      tva_rate: product.default_tva_rate,
    });
    setShowProductPicker(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={type === "invoice" ? "/dashboard/invoices" : "/dashboard/quotes"}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-primary-dark">
          {documentId ? "Modifier" : "Nouvelle"} {type === "invoice" ? "Facture" : "Devis"}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client *</Label>
                  <Select
                    value={watch("client_id")}
                    onValueChange={(v) => setValue("client_id", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.client_id && (
                    <p className="text-xs text-alert">{errors.client_id.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Select
                    value={watchCurrency}
                    onValueChange={(v) => setValue("currency", v as "MAD" | "EUR" | "USD")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAD">MAD (DH)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issue_date">Date d&apos;émission</Label>
                  <Input id="issue_date" type="date" {...register("issue_date")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Date d&apos;échéance</Label>
                  <Input id="due_date" type="date" {...register("due_date")} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {type === "invoice" ? "Produits / Services" : "Prestations"}
              </CardTitle>
              <div className="flex gap-2">
                {products.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => setShowProductPicker(!showProductPicker)} type="button">
                    <Package className="mr-2 h-4 w-4" /> Du catalogue
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={addLine} type="button">
                  <Plus className="mr-2 h-4 w-4" /> Ligne libre
                </Button>
              </div>
            </CardHeader>
            {showProductPicker && (
              <div className="px-6 pb-3">
                <div className="rounded-lg border p-3 space-y-2 max-h-48 overflow-y-auto">
                  {products.map((p: any) => (
                    <button key={p.id} type="button" onClick={() => addProductLine(p)} className="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors text-left">
                      <div>
                        <span className="font-medium">{p.name}</span>
                        {p.unit && <span className="text-xs text-muted-foreground ml-2">/ {p.unit}</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{Number(p.unit_price).toFixed(2)} MAD</span>
                        <span className="bg-muted px-1.5 py-0.5 rounded">{p.default_tva_rate}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <CardContent className="space-y-3">
              {fields.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Ajoutez au moins une ligne
                </p>
              )}
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-2 rounded-lg border p-3"
                >
                  <div className="col-span-5 space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Input
                      {...register(`lines.${index}.description`)}
                      placeholder="Produit ou service"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Quantité</Label>
                    <Input
                      {...register(`lines.${index}.quantity`, { valueAsNumber: true })}
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Prix unitaire</Label>
                    <Input
                      {...register(`lines.${index}.unit_price`, { valueAsNumber: true })}
                      type="number"
                      min="0"
                      step="0.01"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">TVA %</Label>
                    <Select
                      value={String(watchLines[index]?.tva_rate ?? company.default_tva_rate)}
                      onValueChange={(v) =>
                        setValue(`lines.${index}.tva_rate`, Number(v))
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20%</SelectItem>
                        <SelectItem value="14">14%</SelectItem>
                        <SelectItem value="10">10%</SelectItem>
                        <SelectItem value="7">7%</SelectItem>
                        <SelectItem value="0">0%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1 flex items-end justify-center pb-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-alert"
                      onClick={() => remove(index)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" {...register("notes")} placeholder="Notes visibles sur le document..." rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_terms">Conditions de paiement</Label>
                <Input
                  id="payment_terms"
                  {...register("payment_terms")}
                  placeholder="Paiement à réception, virement bancaire..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Admission Temporaire (AT)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Remplissez cette section si le document est lié à une admission temporaire.
              </p>
              <div className="space-y-2">
                <Label htmlFor="at_number">Numéro AT</Label>
                <Input
                  id="at_number"
                  {...register("at_number")}
                  placeholder="Ex: AT/2026/001234"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="at_date">Date AT</Label>
                <Input id="at_date" type="date" {...register("at_date")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="at_bureau">Bureau de douane</Label>
                <Input
                  id="at_bureau"
                  {...register("at_bureau")}
                  placeholder="Ex: Casablanca Port"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total HT</span>
                <span className="font-medium">{formatCurrency(subtotalHT, watchCurrency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA</span>
                <span className="font-medium">{formatCurrency(totalTVA, watchCurrency)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total TTC</span>
                <span>{formatCurrency(totalTTC, watchCurrency)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Entreprise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-semibold">{company.name}</p>
              <p className="text-muted-foreground">{company.address}</p>
              <p className="text-muted-foreground">{company.city}</p>
              <p className="text-muted-foreground">ICE: {company.ice}</p>
              <p className="text-muted-foreground">IF: {company.if_fiscal}</p>
              <p className="text-muted-foreground">RC: {company.rc}</p>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={form.handleSubmit(onSubmit)}
              disabled={loading}
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Enregistrement..." : documentId ? "Mettre à jour" : "Enregistrer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
