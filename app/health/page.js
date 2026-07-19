import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppShell from "@/components/shell/AppShell";

export default async function HealthPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  return (
    <AppShell>
      <div className="page-title">Health</div>

      <a href="/health/weight" className="card" style={{ display: "block", padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>⚖️ Weight tracker</div>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>
          Log weight and body measurements month by month.
        </div>
      </a>

      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>🚧 More coming soon</div>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>
          Workout logging and other health tracking are on the way.
        </div>
      </div>
    </AppShell>
  );
}
