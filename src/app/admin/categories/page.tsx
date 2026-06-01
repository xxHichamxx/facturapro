import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";
import { AdminCategoryDialog } from "@/components/admin/admin-category-dialog";

export const dynamic = "force-dynamic";

export default async function CategoriesAdminPage() {
  const supabase = await createServerSupabaseClient();

  const { data: categories } = await supabase
    .from("product_categories")
    .select("*, company:company_id(name)")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Catégories de produits</h1>
          <p className="text-sm text-muted-foreground">Organisez le catalogue</p>
        </div>
        <AdminCategoryDialog>
          <Button><Plus className="mr-2 h-4 w-4" /> Nouvelle Catégorie</Button>
        </AdminCategoryDialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Nom</TableHead><TableHead>Description</TableHead><TableHead>Entreprise</TableHead><TableHead>Actions</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.description || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.company?.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <AdminCategoryDialog category={c}>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                      </AdminCategoryDialog>
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
