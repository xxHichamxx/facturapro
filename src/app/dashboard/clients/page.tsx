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
import { Plus, Pencil, Mail, Phone, Users } from "lucide-react";
import { ClientAddDialog } from "@/components/clients/client-add-dialog";
import { ClientDeleteButton } from "@/components/clients/client-delete-button";

export default async function ClientsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user?.id ?? "")
    .limit(1).maybeSingle();

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("company_id", company?.id)
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Gérez votre carnet d&apos;adresses clients
          </p>
        </div>
        <ClientAddDialog companyId={company?.id ?? ""}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nouveau Client
          </Button>
        </ClientAddDialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {clients && clients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>ICE</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      {client.email && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" /> {client.email}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {client.phone && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" /> {client.phone}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {client.ice_client || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ClientAddDialog
                          companyId={company?.id ?? ""}
                          client={client}
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </ClientAddDialog>
                        <ClientDeleteButton clientId={client.id} clientName={client.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-30" />
              <p>Aucun client enregistré.</p>
              <p className="text-sm">
                Ajoutez votre premier client pour commencer à facturer.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
