const TWILIO_API = "https://verify.twilio.com/v2";

function authHeader() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const encoded = Buffer.from(`${sid}:${token}`).toString("base64");
  return `Basic ${encoded}`;
}

export async function sendOtp(phone) {
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const res = await fetch(`${TWILIO_API}/Services/${serviceSid}/Verifications`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: phone, Channel: "sms" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to send OTP");
  return data.status;
}

export async function verifyOtp(phone, code) {
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const res = await fetch(`${TWILIO_API}/Services/${serviceSid}/VerificationCheck`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: phone, Code: code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to verify OTP");
  return data.status === "approved";
}
