import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";
import { AdminProductDialog } from "@/components/admin/admin-product-dialog";
import { AdminProductDelete } from "@/components/admin/admin-product-delete";

export const dynamic = "force-dynamic";

export default async function ProductsAdminPage() {
  const supabase = await createServerSupabaseClient();

  const { data: products } = await supabase
    .from("products")
    .select("*, company:company_id(name), category:category_id(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Produits</h1>
          <p className="text-sm text-muted-foreground">Catalogue global</p>
        </div>
        <AdminProductDialog>
          <Button><Plus className="mr-2 h-4 w-4" /> Nouveau Produit</Button>
        </AdminProductDialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>TVA</TableHead>
                <TableHead>Actif</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category?.name ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.company?.name}</TableCell>
                  <TableCell>{Number(p.unit_price).toFixed(2)} MAD</TableCell>
                  <TableCell><Badge variant="secondary">{p.default_tva_rate}%</Badge></TableCell>
                  <TableCell>
                    <Badge variant={p.is_active ? "success" : "destructive"}>
                      {p.is_active ? "Oui" : "Non"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <AdminProductDialog product={p}>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                      </AdminProductDialog>
                      <AdminProductDelete productId={p.id} productName={p.name} />
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
