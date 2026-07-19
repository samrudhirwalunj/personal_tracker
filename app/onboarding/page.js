import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import GettingStartedFlow from "@/components/onboarding/GettingStartedFlow";
import DevPreviewButton from "@/components/auth/DevPreviewButton";

export default async function OnboardingPage() {
  const session = await getSession();
  if (session?.userId) redirect("/dashboard");

  return (
    <div>
      <GettingStartedFlow />
      <DevPreviewButton />
    </div>
  );
}
