import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppShell from "@/components/shell/AppShell";
import SleepClient from "@/components/sleep/SleepClient";

export default async function SleepPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  return (
    <AppShell>
      <SleepClient userId={session.userId} />
    </AppShell>
  );
}
