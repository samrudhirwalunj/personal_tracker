import { getSession, getAdminSession } from "./session";

export async function requireUserId() {
  const session = await getSession();
  return session?.userId || null;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  return Boolean(session?.role === "admin");
}
