import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/users";
import AppTopbar from "./AppTopbar";
import SyncPrompt from "./SyncPrompt";

export default async function AppShell({ children }) {
  const session = await getSession();

  // The topbar's display name is a nice-to-have from Supabase, not something
  // the rest of the shell (which is IndexedDB-backed) should ever depend on —
  // if Supabase is unreachable/unconfigured, fall back to no name instead of
  // breaking every authenticated page.
  let user = null;
  if (session?.userId) {
    try {
      user = await findUserById(session.userId);
    } catch {
      user = null;
    }
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <AppTopbar userName={user?.name} />
      <main className="page">{children}</main>
      {session?.userId && <SyncPrompt userId={session.userId} />}
    </div>
  );
}
