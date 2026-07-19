import { sendOtp as twilioSendOtp, verifyOtp as twilioVerifyOtp } from "./twilio";

const FAKE_OTP_CODE = "123456";

function isTwilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID
  );
}

// Dummy OTP only ever runs when Twilio isn't configured, and only when
// something explicitly allows it: automatically outside production (local
// dev), or in production only if ALLOW_DUMMY_OTP=true is deliberately set.
// That second path exists for staging/preview deploys that don't have Twilio
// yet — it must be an intentional opt-in, never something that happens just
// because someone forgot to set Twilio env vars on a real deployment (that
// would let anyone log in as anyone with a fixed code).
function useFakeOtp() {
  const isDev = process.env.NODE_ENV !== "production";
  const explicitlyAllowed = process.env.ALLOW_DUMMY_OTP === "true";
  return (isDev || explicitlyAllowed) && !isTwilioConfigured();
}

export async function sendOtp(phone) {
  if (useFakeOtp()) {
    return { status: "pending", devCode: FAKE_OTP_CODE };
  }
  const status = await twilioSendOtp(phone);
  return { status };
}

export async function verifyOtp(phone, code) {
  if (useFakeOtp()) {
    return code === FAKE_OTP_CODE;
  }
  return twilioVerifyOtp(phone, code);
}
