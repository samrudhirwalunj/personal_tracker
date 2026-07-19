import OtpLoginForm from "@/components/auth/OtpLoginForm";
import DevPreviewButton from "@/components/auth/DevPreviewButton";

export default function LoginPage() {
  return (
    <div>
      <OtpLoginForm
        endpoint="/api/auth/otp"
        title="Welcome back"
        subtitle="Sign in with your mobile number to continue"
      />
      <DevPreviewButton />
    </div>
  );
}
