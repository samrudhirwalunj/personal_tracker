import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppShell from "@/components/shell/AppShell";
import SettingsClient from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  return (
    <AppShell>
      <SettingsClient userId={session.userId} />
    </AppShell>
  );
}
