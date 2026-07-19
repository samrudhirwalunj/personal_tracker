import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppShell from "@/components/shell/AppShell";
import BooksClient from "@/components/books/BooksClient";

export default async function BooksPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  return (
    <AppShell>
      <BooksClient userId={session.userId} />
    </AppShell>
  );
}
