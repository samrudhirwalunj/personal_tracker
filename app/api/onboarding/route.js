import { NextResponse } from "next/server";
import { getPendingPhone, createUserSession, clearPendingPhoneCookie } from "@/lib/session";
import { createUser, findUserByPhone } from "@/lib/users";

export async function POST(request) {
  const phone = await getPendingPhone();
  if (!phone) {
    return NextResponse.json({ error: "Your verification expired. Please log in again." }, { status: 401 });
  }

  const profile = await request.json();

  let user = await findUserByPhone(phone);
  if (!user) {
    user = await createUser(phone, profile);
  }

  await createUserSession(user.id);
  await clearPendingPhoneCookie();

  return NextResponse.json({ success: true, redirect: "/dashboard" });
}
