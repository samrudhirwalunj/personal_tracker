import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/session";

// Same local-only preview shortcut as /api/dev/login, for the admin side.
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await createAdminSession("+91DEVPREVIEW");
  return NextResponse.json({ success: true });
}
