import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Pencil } from "lucide-react";
import Link from "next/link";
import { AdminMemberDialog } from "@/components/admin/admin-member-dialog";
import { AdminMemberDelete } from "@/components/admin/admin-member-delete";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = {
  owner: "Propriétaire",
  admin: "Admin",
  employee: "Employé",
  accountant: "Comptable",
  viewer: "Visiteur",
};

export default async function CompanyMembersPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient();

  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", params.id)
    .single();
  if (!company) notFound();

  const { data: members } = await supabase
    .from("company_members")
    .select("*, user:user_id(email)")
    .eq("company_id", params.id)
    .order("role");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/companies">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">{company.name}</h1>
          <p className="text-sm text-muted-foreground">Gestion des membres</p>
        </div>
      </div>

      <div className="flex justify-end">
        <AdminMemberDialog companyId={params.id}>
          <Button><Plus className="mr-2 h-4 w-4" /> Ajouter un membre</Button>
        </AdminMemberDialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Ajouté le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell>{m.user?.email ?? m.user_id}</TableCell>
                  <TableCell>
                    <Badge variant={m.role === "owner" ? "default" : "secondary"}>
                      {roleLabels[m.role] ?? m.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(m.invited_at).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>
                    {m.role !== "owner" && (
                      <div className="flex gap-1">
                        <AdminMemberDialog companyId={params.id} member={m}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </AdminMemberDialog>
                        <AdminMemberDelete memberId={m.id} />
                      </div>
                    )}
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
