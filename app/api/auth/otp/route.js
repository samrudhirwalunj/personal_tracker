import { NextResponse } from "next/server";
import { sendOtp, verifyOtp } from "@/lib/otp";
import { findUserByPhone } from "@/lib/users";
import { createUserSession, createPendingPhoneCookie } from "@/lib/session";

export async function POST(request) {
  const body = await request.json();
  const { action, phone, code } = body;

  if (!phone) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  try {
    if (action === "send") {
      const result = await sendOtp(phone);
      return NextResponse.json({ success: true, status: result.status, devCode: result.devCode });
    }

    if (action === "verify") {
      if (!code) {
        return NextResponse.json({ error: "Code is required" }, { status: 400 });
      }
      const approved = await verifyOtp(phone, code);
      if (!approved) {
        return NextResponse.json({ error: "Incorrect or expired code" }, { status: 400 });
      }

      const user = await findUserByPhone(phone);
      if (user) {
        await createUserSession(user.id);
        return NextResponse.json({ success: true, status: "existing", redirect: "/dashboard" });
      }

      await createPendingPhoneCookie(phone);
      return NextResponse.json({ success: true, status: "new", redirect: "/onboarding" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message || "OTP request failed" }, { status: 500 });
  }
}
