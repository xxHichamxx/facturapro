import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Quote } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusLabels: Record<string, { label: string; className: string }> = {
  draft: { label: "Brouillon", className: "bg-gray-100 text-gray-700" },
  sent: { label: "Envoyé", className: "bg-blue-100 text-blue-700" },
  viewed: { label: "Vu", className: "bg-purple-100 text-purple-700" },
  accepted: { label: "Accepté", className: "bg-green-100 text-green-700" },
  paid: { label: "Payé", className: "bg-emerald-100 text-emerald-700" },
  overdue: { label: "En retard", className: "bg-red-100 text-red-700" },
};

export default async function QuotesPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: company } = await supabase
    .from("companies")
    .select("id, default_currency")
    .eq("owner_id", user!.id)
    .limit(1).maybeSingle();

  const { data: quotes } = await supabase
    .from("documents")
    .select("*, client:clients(name)")
    .eq("company_id", company?.id)
    .eq("type", "quote")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Devis</h1>
          <p className="text-sm text-muted-foreground">
            Tous vos devis
          </p>
        </div>
        <Link href="/dashboard/new-quote">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nouveau Devis
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {quotes && quotes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Devis</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total TTC</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((q: any) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.number}</TableCell>
                    <TableCell>{q.client?.name ?? "—"}</TableCell>
                    <TableCell>{formatDate(q.issue_date)}</TableCell>
                    <TableCell>
                      {formatCurrency(Number(q.total_ttc), q.currency)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusLabels[q.status]?.className ?? "bg-gray-100"
                        }`}
                      >
                        {statusLabels[q.status]?.label ?? q.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/quotes/${q.id}`}>
                        <Button variant="ghost" size="sm">
                          Voir
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Quote className="mx-auto h-12 w-12 mb-4 opacity-30" />
              <p>Aucun devis pour le moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
