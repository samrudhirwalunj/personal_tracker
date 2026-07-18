import OtpLoginForm from "@/components/auth/OtpLoginForm";
import DevPreviewButton from "@/components/auth/DevPreviewButton";

export default function AdminLoginPage() {
  return (
    <div>
      <OtpLoginForm
        endpoint="/api/admin/otp"
        title="Admin access"
        subtitle="Restricted to authorized administrators only"
        accentLabel="Send admin code"
      />
      <DevPreviewButton admin />
    </div>
  );
}
