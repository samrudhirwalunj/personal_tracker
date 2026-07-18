"use client";

import { useRouter } from "next/navigation";
import { seedSampleData } from "@/lib/local/seed";

// Only ever rendered in development — process.env.NODE_ENV is inlined at
// build time, so `next build` (production) dead-code-eliminates this whole
// component down to `return null`, on top of the server-side 404 guard on
// the /api/dev/* routes themselves.
export default function DevPreviewButton({ admin = false }) {
  const router = useRouter();

  if (process.env.NODE_ENV === "production") return null;

  async function handleClick() {
    const endpoint = admin ? "/api/dev/admin-login" : "/api/dev/login";
    const res = await fetch(endpoint, { method: "POST" });
    const data = await res.json();
    if (!res.ok) return;

    if (!admin) {
      await seedSampleData(data.userId);
    }

    router.push(admin ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 380, margin: "12px auto 0", textAlign: "center" }}>
      <button onClick={handleClick} style={{ fontSize: 11, color: "var(--text-muted)" }}>
        🛠 Dev preview login (local only, no OTP)
      </button>
    </div>
  );
}
