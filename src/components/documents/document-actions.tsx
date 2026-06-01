"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

interface Props {
  document: {
    id: string;
    type: string;
    status: string;
  };
  company: Record<string, unknown>;
}

export function DocumentActions({ document }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);

  const updateStatus = async (status: string) => {
    setLoading(status);
    const { error } = await supabase
      .from("documents")
      .update({ status })
      .eq("id", document.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Statut mis à jour");
      router.refresh();
    }
    setLoading(null);
  };

  const convertToInvoice = async () => {
    setLoading("convert");
    const response = await fetch("/api/documents/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId: document.id }),
    });

    if (!response.ok) {
      const err = await response.json();
      toast.error(err.error || "Erreur de conversion");
      setLoading(null);
      return;
    }

    const result = await response.json();
    toast.success("Devis converti en facture !");
    router.push(`/dashboard/invoices/${result.id}`);
    router.refresh();
    setLoading(null);
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-3">
        <span className="text-sm font-medium">Actions:</span>

        <Select
          value={document.status}
          onValueChange={updateStatus}
          disabled={loading !== null}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="sent">Envoyé</SelectItem>
            <SelectItem value="viewed">Vu</SelectItem>
            <SelectItem value="accepted">Accepté</SelectItem>
            <SelectItem value="paid">Payé</SelectItem>
            <SelectItem value="overdue">En retard</SelectItem>
          </SelectContent>
        </Select>

        {document.type === "quote" && document.status === "accepted" && (
          <Button
            variant="outline"
            onClick={convertToInvoice}
            disabled={loading === "convert"}
          >
            {loading === "convert" ? (
              "Conversion..."
            ) : (
              <>
                <ArrowRight className="mr-2 h-4 w-4" /> Convertir en Facture
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
