import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppShell from "@/components/shell/AppShell";
import TasksClient from "@/components/tasks/TasksClient";

export default async function TasksPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  return (
    <AppShell>
      <TasksClient userId={session.userId} />
    </AppShell>
  );
}
