import { SignupForm } from "@/components/auth/signup-form";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral px-4">
      <div className="mb-8 flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-primary-dark">FacturaPro</h1>
      </div>
      <SignupForm />
    </div>
  );
}
