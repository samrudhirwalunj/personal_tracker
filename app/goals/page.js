import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppShell from "@/components/shell/AppShell";
import GoalsClient from "@/components/goals/GoalsClient";

export default async function GoalsPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  return (
    <AppShell>
      <GoalsClient userId={session.userId} />
    </AppShell>
  );
}
