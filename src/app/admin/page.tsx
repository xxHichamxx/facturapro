import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Building2, Users, FileText, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const { count: companiesCount } = await supabase
    .from("companies")
    .select("*", { count: "exact", head: true });

  const { count: usersCount } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true });

  const { count: invoicesCount } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("type", "invoice");

  const { data: recentCompanies } = await supabase
    .from("companies")
    .select("*, owner:owner_id(email)")
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: allInvoices } = await supabase
    .from("documents")
    .select("total_ttc, currency, type")
    .eq("type", "invoice")
    .eq("status", "paid");

  const totalRevenue = allInvoices?.reduce((sum, d) => sum + Number(d.total_ttc), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">Administration</h1>
        <p className="text-sm text-muted-foreground">Super Admin — Vue d&apos;ensemble</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entreprises</p>
                <p className="text-2xl font-bold">{companiesCount ?? 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs</p>
                <p className="text-2xl font-bold">{usersCount ?? 0}</p>
              </div>
              <Users className="h-8 w-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Factures</p>
                <p className="text-2xl font-bold">{invoicesCount ?? 0}</p>
              </div>
              <FileText className="h-8 w-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CA Total (payé)</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-success/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Entreprises récentes</CardTitle>
          <Link href="/admin/companies">
            <Button variant="outline" size="sm">Gérer les entreprises</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>ICE</TableHead>
                <TableHead>Propriétaire</TableHead>
                <TableHead>Créée le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCompanies?.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.city}</TableCell>
                  <TableCell>{c.ice}</TableCell>
                  <TableCell>{c.owner?.email ?? "—"}</TableCell>
                  <TableCell>{new Date(c.created_at).toLocaleDateString("fr-FR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
