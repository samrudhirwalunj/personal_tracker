import { redirect } from "next/navigation";

// Mobile + OTP entry now lives inside the unified Getting Started flow,
// which also handles returning users (an existing number just verifies and
// redirects straight to /dashboard without showing the profile steps).
export default function LoginPage() {
  redirect("/onboarding");
}
