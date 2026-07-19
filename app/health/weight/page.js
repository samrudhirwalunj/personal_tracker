import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppShell from "@/components/shell/AppShell";
import WeightTrackerClient from "@/components/health/WeightTrackerClient";

export default async function WeightPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  return (
    <AppShell>
      <WeightTrackerClient userId={session.userId} />
    </AppShell>
  );
}
