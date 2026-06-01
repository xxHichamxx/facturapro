"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type ClientFormData } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ClientData {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  ice_client?: string;
  notes?: string;
}

interface Props {
  companyId: string;
  client?: ClientData;
  children: React.ReactNode;
}

export function ClientAddDialog({ companyId, client, children }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name ?? "",
      email: client?.email ?? "",
      phone: client?.phone ?? "",
      address: client?.address ?? "",
      ice_client: client?.ice_client ?? "",
      notes: client?.notes ?? "",
    },
  });

  const { register, formState: { errors } } = form;

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true);

    if (client) {
      const { error } = await supabase
        .from("clients")
        .update(data)
        .eq("id", client.id);

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      toast.success("Client mis à jour !");
    } else {
      const { error } = await supabase.from("clients").insert({
        ...data,
        company_id: companyId,
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      toast.success("Client ajouté !");
    }

    setOpen(false);
    router.refresh();
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {client ? "Modifier le client" : "Nouveau Client"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom / Raison sociale *</Label>
            <Input id="name" {...register("name")} placeholder="Nom du client" />
            {errors.name && <p className="text-xs text-alert">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" {...register("email")} placeholder="client@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" {...register("phone")} placeholder="+212..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" {...register("address")} placeholder="Adresse" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ice_client">ICE Client (optionnel)</Label>
            <Input id="ice_client" {...register("ice_client")} placeholder="ICE" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enregistrement..." : client ? "Mettre à jour" : "Ajouter le client"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
