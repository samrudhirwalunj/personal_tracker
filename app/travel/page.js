import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppShell from "@/components/shell/AppShell";
import ComingSoonPanel from "@/components/shared/ComingSoonPanel";

export default async function TravelPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  return (
    <AppShell>
      <ComingSoonPanel
        title="Travel"
        description="Trip planning and travel logs are on the way."
      />
    </AppShell>
  );
}
