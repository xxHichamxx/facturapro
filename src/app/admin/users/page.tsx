import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Shield } from "lucide-react";
import { ToggleAdminButton } from "@/components/admin/toggle-admin-button";

export const dynamic = "force-dynamic";

export default async function UsersAdminPage() {
  const supabase = await createServerSupabaseClient();

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: members } = await supabase
    .from("company_members")
    .select("*, company:companies(name)");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground">Tous les utilisateurs de la plateforme</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Super Admin</TableHead>
                <TableHead>Entreprises</TableHead>
                <TableHead>Inscrit le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles?.map((p: any) => {
                const userMembers = members?.filter((m: any) => m.user_id === p.id) ?? [];
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.id?.substring(0, 8)}...</TableCell>
                    <TableCell>{p.full_name || "—"}</TableCell>
                    <TableCell>
                      {p.is_super_admin
                        ? <Badge variant="destructive"><Shield className="mr-1 h-3 w-3" /> Admin</Badge>
                        : <Badge variant="secondary">Utilisateur</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {userMembers.map((m: any) => (
                          <Badge key={m.id} variant="outline" className="text-xs">
                            {m.company?.name}: {m.role}
                          </Badge>
                        ))}
                        {userMembers.length === 0 && <span className="text-xs text-muted-foreground">Aucune</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                    <TableCell>
                      <ToggleAdminButton userId={p.id} isSuperAdmin={p.is_super_admin} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
