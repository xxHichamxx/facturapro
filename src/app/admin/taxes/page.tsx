import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";
import { AdminTaxDialog } from "@/components/admin/admin-tax-dialog";
import { AdminTaxDelete } from "@/components/admin/admin-tax-delete";

export const dynamic = "force-dynamic";

export default async function TaxesAdminPage() {
  const supabase = await createServerSupabaseClient();

  const { data: taxRates } = await supabase
    .from("tax_rates")
    .select("*, company:company_id(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Taux de TVA</h1>
          <p className="text-sm text-muted-foreground">Configuration fiscale (Loi Marocaine)</p>
        </div>
        <AdminTaxDialog>
          <Button><Plus className="mr-2 h-4 w-4" /> Nouveau Taux</Button>
        </AdminTaxDialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Taux</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>S&apos;applique &agrave;</TableHead>
                <TableHead>Défaut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxRates?.map((t: any) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell><Badge>{t.rate}%</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.company?.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {t.applies_to === "all" ? "Tout" : t.applies_to === "products" ? "Produits" : "Services"}
                  </Badge>
                </TableCell>
                <TableCell>{t.is_default ? "&check;" : ""}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <AdminTaxDialog taxRate={t}>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                      </AdminTaxDialog>
                      <AdminTaxDelete taxId={t.id} taxName={t.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm text-muted-foreground">Taux légaux au Maroc</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            {[{ rate: "20%", label: "Taux normal" }, { rate: "14%", label: "Taux réduit" }, { rate: "10%", label: "Taux réduit" }, { rate: "7%", label: "Super-réduit" }, { rate: "0%", label: "Exonéré" }].map((t) => (
              <div key={t.rate} className="rounded-lg border p-3 text-center">
                <p className="text-xl font-bold">{t.rate}</p>
                <p className="text-xs text-muted-foreground">{t.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
