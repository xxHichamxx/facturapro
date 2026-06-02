import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Package } from "lucide-react";
import { ProductDialog } from "@/components/products/product-dialog";
import { ProductDelete } from "@/components/products/product-delete";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase.from("companies").select("id").eq("owner_id", user.id).limit(1).maybeSingle();
  if (!company) redirect("/dashboard");

  const { data: products } = await supabase.from("products").select("*, category:category_id(name)").eq("company_id", company.id).order("name");
  const { data: categories } = await supabase.from("product_categories").select("*").eq("company_id", company.id).order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Produits & Services</h1>
          <p className="text-sm text-muted-foreground">Votre catalogue</p>
        </div>
        <div className="flex gap-2">
          <ProductDialog companyId={company.id} categories={categories ?? []}>
            <Button><Plus className="mr-2 h-4 w-4" /> Nouveau</Button>
          </ProductDialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {products && products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Nom</TableHead><TableHead>Categorie</TableHead><TableHead>Prix</TableHead><TableHead>TVA</TableHead><TableHead>Unite</TableHead><TableHead>SKU</TableHead><TableHead></TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.category?.name || "—"}</TableCell>
                    <TableCell>{Number(p.unit_price).toFixed(2)}</TableCell>
                    <TableCell><Badge variant="secondary">{p.default_tva_rate}%</Badge></TableCell>
                    <TableCell>{p.unit}</TableCell>
                    <TableCell className="font-mono text-xs">{p.sku || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <ProductDialog companyId={company.id} categories={categories ?? []} product={p}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                        </ProductDialog>
                        <ProductDelete productId={p.id} productName={p.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-4 opacity-30" />
              <p>Aucun produit. Ajoutez votre premier produit.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
