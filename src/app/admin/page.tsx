import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Building2, Users, FileText, DollarSign, UserPlus, Activity } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const { count: companiesCount } = await supabase.from("companies").select("*", { count: "exact", head: true });
  const { count: usersCount } = await supabase.from("user_profiles").select("*", { count: "exact", head: true });
  const { count: invoicesCount } = await supabase.from("documents").select("*", { count: "exact", head: true }).eq("type", "invoice");
  const { count: quotesCount } = await supabase.from("documents").select("*", { count: "exact", head: true }).eq("type", "quote");
  const { count: paidCount } = await supabase.from("documents").select("*", { count: "exact", head: true }).eq("status", "paid");
  const { count: overdueCount } = await supabase.from("documents").select("*", { count: "exact", head: true }).eq("status", "overdue");
  const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true });
  const { count: membersCount } = await supabase.from("company_members").select("*", { count: "exact", head: true });

  const { data: allPaid } = await supabase.from("documents").select("total_ttc").eq("type", "invoice").eq("status", "paid");
  const totalRevenue = allPaid?.reduce((s, d) => s + Number(d.total_ttc), 0) ?? 0;

  const { data: recentUsers } = await supabase.from("user_profiles").select("*, auth_user:auth.users(email, created_at)").order("created_at", { ascending: false }).limit(8);
  const { data: recentDocs } = await supabase.from("documents").select("number, type, status, company:companies(name), client:clients(name), total_ttc, currency, created_at").order("created_at", { ascending: false }).limit(8);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">Administration</h1>
        <p className="text-sm text-muted-foreground">Super Admin — Plateforme FacturaPro</p>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Entreprises</p><p className="text-2xl font-bold">{companiesCount ?? 0}</p></div><Building2 className="h-8 w-8 text-primary/20" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Utilisateurs</p><p className="text-2xl font-bold">{usersCount ?? 0}</p></div><Users className="h-8 w-8 text-primary/20" /></div><p className="text-xs text-muted-foreground mt-1">{membersCount ?? 0} membres entreprise</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Documents</p><p className="text-2xl font-bold">{(invoicesCount ?? 0) + (quotesCount ?? 0)}</p></div><FileText className="h-8 w-8 text-primary/20" /></div><p className="text-xs text-muted-foreground mt-1">{invoicesCount} factures, {quotesCount} devis</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">CA payé</p><p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p></div><DollarSign className="h-8 w-8 text-success/30" /></div><p className="text-xs text-muted-foreground mt-1">{paidCount} factures payées</p></CardContent></Card>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Produits en catalogue</p><p className="text-2xl font-bold">{productsCount ?? 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Factures payées</p><p className="text-2xl font-bold">{paidCount ?? 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Retards</p><p className="text-2xl font-bold text-alert">{overdueCount ?? 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Taux conversion devis</p><p className="text-2xl font-bold">{quotesCount ? Math.round(((invoicesCount ?? 0) / (quotesCount ?? 1)) * 100) : 0}%</p></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Utilisateurs recents</CardTitle>
            <Link href="/admin/users"><Button variant="outline" size="sm"><UserPlus className="mr-1 h-3 w-3" /> Tous</Button></Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Nom</TableHead><TableHead>Admin</TableHead><TableHead>Inscrit</TableHead></TableRow></TableHeader>
              <TableBody>
                {recentUsers?.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="text-sm">{u.auth_user?.email ?? u.id}</TableCell>
                    <TableCell>{u.full_name || "—"}</TableCell>
                    <TableCell>{u.is_super_admin ? <Badge variant="destructive">Admin</Badge> : <Badge variant="secondary">User</Badge>}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(u.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Documents recents</CardTitle>
            <Link href="/admin/documents"><Button variant="outline" size="sm">Tous</Button></Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>N°</TableHead><TableHead>Entreprise</TableHead><TableHead>Type</TableHead><TableHead>Total</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
              <TableBody>
                {recentDocs?.map((d: any) => (
                  <TableRow key={d.number + d.created_at}>
                    <TableCell className="font-mono text-xs">{d.number}</TableCell>
                    <TableCell className="text-xs">{d.company?.name ?? "—"}</TableCell>
                    <TableCell>{d.type === "invoice" ? <Badge variant="default">Facture</Badge> : <Badge variant="outline">Devis</Badge>}</TableCell>
                    <TableCell>{formatCurrency(Number(d.total_ttc), d.currency)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${d.status === "paid" ? "bg-emerald-100 text-emerald-700" : d.status === "overdue" ? "bg-red-100 text-red-700" : d.status === "sent" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>{d.status}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Liens rapides</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/admin/companies"><Button variant="outline" className="w-full"><Building2 className="mr-2 h-4 w-4" /> Entreprises</Button></Link>
            <Link href="/admin/users"><Button variant="outline" className="w-full"><Users className="mr-2 h-4 w-4" /> Utilisateurs</Button></Link>
            <Link href="/admin/products"><Button variant="outline" className="w-full"><FileText className="mr-2 h-4 w-4" /> Produits</Button></Link>
            <Link href="/admin/taxes"><Button variant="outline" className="w-full"><Activity className="mr-2 h-4 w-4" /> Taxes</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
