import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate, amountToFrenchWords } from "@/lib/utils";
import { DocumentActions } from "@/components/documents/document-actions";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { notFound } from "next/navigation";

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  viewed: "Vu",
  accepted: "Accepté",
  paid: "Payé",
  overdue: "En retard",
};

export default async function QuoteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", user!.id)
    .limit(1).maybeSingle();

  const { data: document } = await supabase
    .from("documents")
    .select("*, client:clients(*)")
    .eq("id", params.id)
    .maybeSingle();

  if (!document) notFound();

  const { data: lines } = await supabase
    .from("document_lines")
    .select("*")
    .eq("document_id", document.id)
    .order("position");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/quotes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary-dark">
              Devis {document.number}
            </h1>
            <p className="text-sm text-muted-foreground">
              {statusLabels[document.status]}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/quotes/${document.id}/edit`}>
            <Button variant="outline">Modifier</Button>
          </Link>
          <Link href={`/api/documents/${document.id}/pdf`}>
            <Button>
              <Download className="mr-2 h-4 w-4" /> Télécharger PDF
            </Button>
          </Link>
        </div>
      </div>

      <DocumentActions document={document} company={company} />

      <Card>
        <CardContent className="p-8">
          <div className="mb-8 flex justify-between">
            <div>
              <h3 className="font-bold text-lg">{company?.name}</h3>
              <p className="text-sm text-muted-foreground">{company?.address}</p>
              <p className="text-sm text-muted-foreground">{company?.city}</p>
              <p className="text-sm text-muted-foreground">ICE: {company?.ice}</p>
              <p className="text-sm text-muted-foreground">IF: {company?.if_fiscal}</p>
              <p className="text-sm text-muted-foreground">RC: {company?.rc}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-primary-dark">DEVIS</h2>
              <p className="text-sm font-medium">{document.number}</p>
              <p className="text-sm text-muted-foreground">
                Date: {formatDate(document.issue_date, "long")}
              </p>
            </div>
          </div>

          <div className="mb-8 rounded-lg bg-muted p-4">
            <h4 className="font-semibold">Client</h4>
            <p>{(document as any).client?.name}</p>
            <p className="text-sm text-muted-foreground">
              {(document as any).client?.address}
            </p>
            <p className="text-sm text-muted-foreground">
              {(document as any).client?.email}
            </p>
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
                <span>
                  {formatCurrency(Number(document.subtotal_ht), document.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA</span>
                <span>
                  {formatCurrency(Number(document.tva_amount), document.currency)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total TTC</span>
                <span>
                  {formatCurrency(Number(document.total_ttc), document.currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium text-primary-dark">
              Arrêter le présent devis à la somme de :
            </p>
            <p className="text-base font-semibold italic">
              {amountToFrenchWords(Number(document.total_ttc), document.currency)}
            </p>
          </div>

          {(document.notes || document.payment_terms || document.at_number) && (
            <div className="mt-6 space-y-2">
              {document.notes && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{document.notes}</p>
                </div>
              )}
              {document.payment_terms && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">Conditions de paiement</p>
                  <p className="text-sm text-muted-foreground">{document.payment_terms}</p>
                </div>
              )}
              {document.at_number && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">Admission Temporaire</p>
                  <p className="text-sm text-muted-foreground">
                    AT N°: {document.at_number}{document.at_date ? ` — Date: ${document.at_date}` : ""}{document.at_bureau ? ` — Bureau: ${document.at_bureau}` : ""}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
