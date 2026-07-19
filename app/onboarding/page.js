import { redirect } from "next/navigation";
import { getSession, getPendingPhone } from "@/lib/session";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export default async function OnboardingPage() {
  const session = await getSession();
  if (session?.userId) redirect("/dashboard");

  const pendingPhone = await getPendingPhone();
  if (!pendingPhone) redirect("/login");

  return <OnboardingForm />;
}
