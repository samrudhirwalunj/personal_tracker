import { sendOtp as twilioSendOtp, verifyOtp as twilioVerifyOtp } from "./twilio";

const FAKE_OTP_CODE = "123456";

function isTwilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID
  );
}

// Only ever true outside production, and only when Twilio isn't configured —
// never a silent bypass in a real deployment. If Twilio env vars are missing
// in production, OTP calls fail loudly instead of falling back to this.
function useFakeOtp() {
  return process.env.NODE_ENV !== "production" && !isTwilioConfigured();
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
