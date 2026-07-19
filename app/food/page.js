import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppShell from "@/components/shell/AppShell";
import ComingSoonPanel from "@/components/shared/ComingSoonPanel";

export default async function FoodPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  return (
    <AppShell>
      <ComingSoonPanel
        title="Food"
        description="Meal planning and nutrition tracking are on the way."
      />
    </AppShell>
  );
}
