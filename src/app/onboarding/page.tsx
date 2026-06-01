import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral px-4 py-12">
      <OnboardingWizard />
    </div>
  );
}
