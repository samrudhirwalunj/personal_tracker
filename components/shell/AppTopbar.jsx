"use client";

import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home" },
  { href: "/tasks", label: "Tasks" },
  { href: "/goals", label: "Goals" },
  { href: "/water", label: "Water" },
  { href: "/sleep", label: "Sleep" },
  { href: "/settings", label: "Settings" },
];

export default function AppTopbar({ userName }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const today = new Date().toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });

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
      <span style={{ fontWeight: 500, fontSize: 14 }}>Personal Tracker</span>

      <nav style={{ display: "flex", gap: 14, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <a
              key={item.href}
              href={item.href}
              style={{
                fontSize: 12,
                color: active ? "var(--text-accent)" : "var(--text-secondary)",
                fontWeight: active ? 500 : 400,
              }}
            >
              {item.label}
            </a>
          );
        })}
      </nav>

      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{today}</span>
      {userName ? <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{userName}</span> : null}
      <button onClick={handleLogout} style={{ fontSize: 11, padding: "5px 10px" }}>
        Log out
      </button>
    </div>
  );
}
