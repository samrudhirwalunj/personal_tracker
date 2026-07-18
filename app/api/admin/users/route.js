import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { listUsersForAdmin, countUsers } from "@/lib/users";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [users, total] = await Promise.all([listUsersForAdmin(), countUsers()]);
  return NextResponse.json({ users, total });
}
