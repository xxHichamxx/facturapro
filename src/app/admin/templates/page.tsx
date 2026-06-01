import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Check } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TemplatesAdminPage() {
  const supabase = await createServerSupabaseClient();

  const { data: templates } = await supabase
    .from("templates")
    .select("*")
    .order("name");

  const { data: companyTemplates } = await supabase
    .from("company_templates")
    .select("*, company:company_id(name), template:template_id(name)");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Templates</h1>
          <p className="text-sm text-muted-foreground">Modèles de factures et devis</p>
        </div>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Nouveau Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {templates?.map((t: any) => (
          <Card key={t.id} className={t.is_default ? "ring-2 ring-primary" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t.name}</CardTitle>
                {t.is_default && <Check className="h-4 w-4 text-primary" />}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{t.description || t.type}</p>
              <div className="flex gap-1">
                {t.is_system && <Badge variant="secondary">Système</Badge>}
                <Badge variant="outline">{t.type === "both" ? "Facture + Devis" : t.type}</Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Pencil className="mr-1 h-3 w-3" /> Modifier
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Attributions aux entreprises</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entreprise</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Actif</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyTemplates?.map((ct: any) => (
                <TableRow key={ct.id}>
                  <TableCell>{ct.company?.name}</TableCell>
                  <TableCell>{ct.template?.name}</TableCell>
                  <TableCell><Badge variant={ct.is_active ? "success" : "destructive"}>{ct.is_active ? "Oui" : "Non"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
