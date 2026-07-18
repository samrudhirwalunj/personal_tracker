import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const USER_COOKIE = "session";
const ADMIN_COOKIE = "admin_session";
const PENDING_COOKIE = "pending_phone";

const USER_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const ADMIN_MAX_AGE = 60 * 60 * 12; // 12 hours
const PENDING_MAX_AGE = 60 * 15; // 15 minutes

function secretKey(name) {
  const secret = process.env[name];
  if (!secret) throw new Error(`Missing env var ${name}`);
  return new TextEncoder().encode(secret);
}

async function sign(payload, secretName, maxAgeSeconds) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(secretKey(secretName));
}

async function verify(token, secretName) {
  try {
    const { payload } = await jwtVerify(token, secretKey(secretName));
    return payload;
  } catch {
    return null;
  }
}

export async function createUserSession(userId) {
  const token = await sign({ userId }, "SESSION_SECRET", USER_MAX_AGE);
  const store = await cookies();
  store.set(USER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: USER_MAX_AGE,
  });
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(USER_COOKIE)?.value;
  if (!token) return null;
  return verify(token, "SESSION_SECRET");
}

export async function clearUserSession() {
  const store = await cookies();
  store.delete(USER_COOKIE);
}

export async function createAdminSession(phone) {
  const token = await sign({ phone, role: "admin" }, "ADMIN_SESSION_SECRET", ADMIN_MAX_AGE);
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  });
}

export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verify(token, "ADMIN_SESSION_SECRET");
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

// Short-lived cookie used only to remember "this phone passed OTP" between
// /login's verify step and /onboarding's submit step, for brand-new users.
export async function createPendingPhoneCookie(phone) {
  const token = await sign({ phone }, "SESSION_SECRET", PENDING_MAX_AGE);
  const store = await cookies();
  store.set(PENDING_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_MAX_AGE,
  });
}

export async function getPendingPhone() {
  const store = await cookies();
  const token = store.get(PENDING_COOKIE)?.value;
  if (!token) return null;
  const payload = await verify(token, "SESSION_SECRET");
  return payload?.phone || null;
}

export async function clearPendingPhoneCookie() {
  const store = await cookies();
  store.delete(PENDING_COOKIE);
}

export const COOKIE_NAMES = { USER_COOKIE, ADMIN_COOKIE, PENDING_COOKIE };
