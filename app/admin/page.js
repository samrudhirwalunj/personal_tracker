import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import { listUsersForAdmin, countUsers } from "@/lib/users";
import AdminTopbar from "@/components/admin/AdminTopbar";
import UserTable from "@/components/admin/UserTable";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (session?.role !== "admin") redirect("/admin/login");

  let users = [];
  let total = 0;
  let unavailable = false;
  try {
    [users, total] = await Promise.all([listUsersForAdmin(), countUsers()]);
  } catch {
    unavailable = true;
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <AdminTopbar />
      <main className="page">
        <div className="page-title">Users · {total}</div>
        {unavailable ? (
          <div className="muted" style={{ fontSize: 12 }}>
            Supabase isn&apos;t configured in this environment yet.
          </div>
        ) : (
          <UserTable users={users} />
        )}
      </main>
    </div>
  );
}
