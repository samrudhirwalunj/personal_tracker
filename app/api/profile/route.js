import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth-helpers";
import { findUserById, updateUserProfile } from "@/lib/users";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await findUserById(userId);
    return NextResponse.json({ user });
  } catch {
    // Supabase not reachable/configured yet (e.g. local dev preview) —
    // report "no profile" rather than a 500.
    return NextResponse.json({ user: null });
  }
}

export async function PATCH(request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const user = await updateUserProfile(userId, body);
  return NextResponse.json({ user });
}
