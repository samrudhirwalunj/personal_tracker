import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppShell from "@/components/shell/AppShell";
import ComingSoonPanel from "@/components/shared/ComingSoonPanel";

export default async function HealthPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  return (
    <AppShell>
      <ComingSoonPanel
        title="Health"
        description="Weight, measurements, and workout tracking are on the way."
      />
    </AppShell>
  );
}
