import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";
import { notFound } from "next/navigation";

export default async function PublicViewPage({
  params,
}: {
  params: { token: string };
}) {
  const supabase = await createServerSupabaseClient();

  const { data: document } = await supabase
    .from("documents")
    .select("*, client:clients(*), company:companies(*)")
    .eq("view_token", params.token)
    .single();

  if (!document) notFound();

  // Mark as viewed
  if (document.status === "sent") {
    await supabase
      .from("documents")
      .update({ status: "viewed" })
      .eq("id", document.id);
  }

  const { data: lines } = await supabase
    .from("document_lines")
    .select("*")
    .eq("document_id", document.id)
    .order("position");

  const company = document.company;
  const client = document.client;

  return (
    <div className="min-h-screen bg-neutral p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardContent className="p-8">
            <div className="mb-8 flex justify-between">
              <div>
                <h3 className="font-bold text-lg">{company?.name}</h3>
                <p className="text-sm text-muted-foreground">{company?.address}</p>
                <p className="text-sm text-muted-foreground">{company?.city}</p>
                <p className="text-sm text-muted-foreground">ICE: {company?.ice}</p>
                <p className="text-sm text-muted-foreground">IF: {company?.if_fiscal}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-primary-dark">
                  {document.type === "invoice" ? "FACTURE" : "DEVIS"}
                </h2>
                <p className="text-sm font-medium">{document.number}</p>
                <p className="text-sm text-muted-foreground">
                  Date: {formatDate(document.issue_date, "long")}
                </p>
                {document.due_date && (
                  <p className="text-sm text-muted-foreground">
                    Échéance: {formatDate(document.due_date, "long")}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-8 rounded-lg bg-muted p-4">
              <h4 className="font-semibold">Client</h4>
              <p>{client?.name}</p>
              <p className="text-sm text-muted-foreground">{client?.address}</p>
            </div>

            <table className="w-full mb-4">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left text-sm font-medium text-muted-foreground">
                    Description
                  </th>
                  <th className="py-2 text-right text-sm font-medium text-muted-foreground">
                    Qté
                  </th>
                  <th className="py-2 text-right text-sm font-medium text-muted-foreground">
                    Prix unitaire
                  </th>
                  <th className="py-2 text-right text-sm font-medium text-muted-foreground">
                    TVA
                  </th>
                  <th className="py-2 text-right text-sm font-medium text-muted-foreground">
                    Total HT
                  </th>
                </tr>
              </thead>
              <tbody>
                {lines?.map((line: any) => (
                  <tr key={line.id} className="border-b">
                    <td className="py-2">{line.description}</td>
                    <td className="py-2 text-right">{line.quantity}</td>
                    <td className="py-2 text-right">
                      {formatCurrency(Number(line.unit_price), document.currency)}
                    </td>
                    <td className="py-2 text-right">{line.tva_rate}%</td>
                    <td className="py-2 text-right">
                      {formatCurrency(Number(line.total_ht), document.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Separator className="my-4" />
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total HT</span>
                  <span>{formatCurrency(Number(document.subtotal_ht), document.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA</span>
                  <span>{formatCurrency(Number(document.tva_amount), document.currency)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total TTC</span>
                  <span>{formatCurrency(Number(document.total_ttc), document.currency)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-muted-foreground">
              <FileText className="mx-auto mb-2 h-4 w-4" />
              Document généré avec FacturaPro
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
