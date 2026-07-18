import { NextResponse } from "next/server";
import { sendOtp, verifyOtp } from "@/lib/otp";
import { isAdminPhone } from "@/lib/admin";
import { createAdminSession } from "@/lib/session";

export async function POST(request) {
  const body = await request.json();
  const { action, phone, code } = body;

  if (!phone) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  if (!isAdminPhone(phone)) {
    return NextResponse.json({ error: "This number is not authorized for admin access" }, { status: 403 });
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
      await createAdminSession(phone);
      return NextResponse.json({ success: true, redirect: "/admin" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message || "OTP request failed" }, { status: 500 });
  }
}
