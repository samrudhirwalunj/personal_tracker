"use client";

import { useRouter } from "next/navigation";

export default function AdminTopbar() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "10px 16px",
        background: "var(--surface-2)",
        borderBottom: "0.5px solid var(--border)",
      }}
    >
      <span style={{ fontWeight: 500, fontSize: 14, flex: 1 }}>Personal Tracker · Admin</span>
      <button onClick={handleLogout} style={{ fontSize: 11, padding: "5px 10px" }}>
        Log out
      </button>
    </div>
  );
}
