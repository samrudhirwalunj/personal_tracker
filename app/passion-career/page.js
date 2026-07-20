import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppShell from "@/components/shell/AppShell";
import ComingSoonPanel from "@/components/shared/ComingSoonPanel";

export default async function PassionCareerPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  return (
    <AppShell>
      <ComingSoonPanel
        title="Passion/Career"
        description="Career goals and passion projects tracking are on the way."
      />
    </AppShell>
  );
}
