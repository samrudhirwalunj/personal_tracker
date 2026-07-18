import { NextResponse } from "next/server";
import { createUserSession } from "@/lib/session";

// Local-only shortcut to preview the app UI without configuring Twilio/Supabase
// yet. Guarded on NODE_ENV so a production build (Hostinger etc.) always 404s
// here regardless of any client-side conditional that might get bypassed.
const DEV_USER_ID = -1;

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await createUserSession(DEV_USER_ID);
  return NextResponse.json({ success: true, userId: DEV_USER_ID });
}
