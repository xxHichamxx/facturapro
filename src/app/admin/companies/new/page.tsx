import { AdminCompanyForm } from "@/components/admin/admin-company-form";

export const dynamic = "force-dynamic";

export default function NewCompanyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-primary-dark">Nouvelle Entreprise</h1>
      <AdminCompanyForm />
    </div>
  );
}
