import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppShell from "@/components/shell/AppShell";
import WaterClient from "@/components/water/WaterClient";

export default async function WaterPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  return (
    <AppShell>
      <WaterClient userId={session.userId} />
    </AppShell>
  );
}
