import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  DollarSign,
  FileText,
  Quote as QuoteIcon,
  AlertTriangle,
  Plus,
} from "lucide-react";
import Link from "next/link";

const statusLabels: Record<string, { label: string; className: string }> = {
  draft: { label: "Brouillon", className: "bg-gray-100 text-gray-700" },
  sent: { label: "Envoyé", className: "bg-blue-100 text-blue-700" },
  viewed: { label: "Vu", className: "bg-purple-100 text-purple-700" },
  accepted: { label: "Accepté", className: "bg-green-100 text-green-700" },
  paid: { label: "Payé", className: "bg-emerald-100 text-emerald-700" },
  overdue: { label: "En retard", className: "bg-red-100 text-red-700" },
};

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", user!.id)
    .limit(1)
    .maybeSingle();

  const { data: documents } = company ? await supabase
    .from("documents")
    .select("*, client:clients(name)")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
    .limit(10) : { data: null };

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

  const { data: monthlyDocs } = company ? await supabase
    .from("documents")
    .select("total_ttc, status")
    .eq("company_id", company.id)
    .eq("type", "invoice")
    .gte("issue_date", currentMonthStart) : { data: null };

  const monthlyRevenue =
    monthlyDocs
      ?.filter((d) => d.status === "paid")
      .reduce((sum, d) => sum + Number(d.total_ttc), 0) ?? 0;

  const { data: pendingInvoices } = company ? await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("company_id", company.id)
    .eq("type", "invoice")
    .in("status", ["sent", "viewed"]) : { data: null };

  const pendingCount = pendingInvoices?.length ?? 0;

  const { count: overdueCount } = company ? await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company.id)
    .eq("status", "overdue") : { count: 0 };

  const overdueValue = overdueCount ?? 0;

  const { count: quotesCount } = company ? await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company.id)
    .eq("type", "quote")
    .in("status", ["draft", "sent"]) : { count: 0 };

  const kpis = [
    {
      title: "CA du mois",
      value: formatCurrency(monthlyRevenue, company?.default_currency ?? "MAD"),
      icon: DollarSign,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Factures en attente",
      value: pendingCount.toString(),
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Devis en cours",
      value: (quotesCount ?? 0).toString(),
      icon: QuoteIcon,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      title: "Retards",
      value: overdueValue.toString(),
      icon: AlertTriangle,
      color: "text-alert",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            {company?.name ?? "Tableau de bord"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Tableau de bord
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/new-invoice">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nouvelle Facture
            </Button>
          </Link>
          <Link href="/dashboard/new-quote">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Nouveau Devis
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <div className={`rounded-full p-3 ${kpi.bg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Documents récents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents && documents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total TTC</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.number}</TableCell>
                    <TableCell>{doc.client?.name ?? "—"}</TableCell>
                    <TableCell>
                      {doc.type === "invoice" ? "Facture" : "Devis"}
                    </TableCell>
                    <TableCell>{formatDate(doc.issue_date)}</TableCell>
                    <TableCell>
                      {formatCurrency(Number(doc.total_ttc), doc.currency)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusLabels[doc.status]?.className ?? "bg-gray-100"
                        }`}
                      >
                        {statusLabels[doc.status]?.label ?? doc.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={
                          doc.type === "invoice"
                            ? `/dashboard/invoices/${doc.id}`
                            : `/dashboard/quotes/${doc.id}`
                        }
                      >
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
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-30" />
              <p>Aucun document pour le moment.</p>
              <p className="text-sm">
                Créez votre première facture ou votre premier devis !
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
