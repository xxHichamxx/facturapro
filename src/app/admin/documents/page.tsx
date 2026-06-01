import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AllDocumentsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: documents } = await supabase
    .from("documents")
    .select("*, company:companies(name), client:clients(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  const statusStyles: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    viewed: "bg-purple-100 text-purple-700",
    accepted: "bg-green-100 text-green-700",
    paid: "bg-emerald-100 text-emerald-700",
    overdue: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">Tous les documents</h1>
        <p className="text-sm text-muted-foreground">Factures et devis toutes entreprises confondues</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>N°</TableHead><TableHead>Entreprise</TableHead><TableHead>Client</TableHead><TableHead>Type</TableHead><TableHead>Total TTC</TableHead><TableHead>Statut</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {documents?.map((d: any) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs">{d.number}</TableCell>
                  <TableCell className="text-xs">{d.company?.name}</TableCell>
                  <TableCell>{d.client?.name}</TableCell>
                  <TableCell>{d.type === "invoice" ? <Badge variant="default">Facture</Badge> : <Badge variant="outline">Devis</Badge>}</TableCell>
                  <TableCell>{formatCurrency(Number(d.total_ttc), d.currency)}</TableCell>
                  <TableCell><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[d.status] || "bg-gray-100"}`}>{d.status}</span></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(d.issue_date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
