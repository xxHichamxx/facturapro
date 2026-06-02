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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Users } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CompaniesManagePage() {
  const supabase = await createServerSupabaseClient();

  const { data: companies } = await supabase
    .from("companies_view")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: companyMemberCounts } = await supabase
    .from("company_members")
    .select("company_id");

  const memberCounts: Record<string, number> = {};
  companyMemberCounts?.forEach((row: any) => {
    memberCounts[row.company_id] = (memberCounts[row.company_id] ?? 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Entreprises</h1>
          <p className="text-sm text-muted-foreground">
            Gérez toutes les entreprises de la plateforme
          </p>
        </div>
        <Link href="/admin/companies/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nouvelle Entreprise
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>ICE</TableHead>
                <TableHead>Propriétaire</TableHead>
                <TableHead>Membres</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies?.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.city}</TableCell>
                  <TableCell className="font-mono text-xs">{c.ice}</TableCell>
                  <TableCell>{c.owner_email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{memberCounts[c.id] ?? 0}</Badge>
                  </TableCell>
                  <TableCell>{new Date(c.created_at).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/companies/${c.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/companies/${c.id}/members`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Users className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
