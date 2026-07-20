"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home" },
  { href: "/tasks", label: "Tasks" },
  { href: "/goals", label: "Goals" },
  { href: "/books", label: "Books" },
  { href: "/food", label: "Food", soon: true },
  { href: "/travel", label: "Travel", soon: true },
  { href: "/health", label: "Health", soon: true },
  { href: "/passion-career", label: "Passion/Career", soon: true },
  { href: "/settings", label: "Settings" },
];

export default function AppTopbar({ userName }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const today = new Date().toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });

  return (
    <div className="app-topbar">
      <span style={{ fontWeight: 500, fontSize: 14 }}>Personal Tracker</span>

      <button
        className="app-nav-toggle"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Toggle navigation"
        style={{ fontSize: 16, padding: "5px 10px" }}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <nav className={`app-nav${menuOpen ? " open" : ""}`}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: active ? "var(--text-accent)" : "var(--text-secondary)",
                fontWeight: active ? 500 : 400,
              }}
            >
              {item.label}
              {item.soon && (
                <span
                  style={{
                    fontSize: 8.5,
                    padding: "1px 5px",
                    borderRadius: 8,
                    background: "var(--surface-1)",
                    color: "var(--text-muted)",
                  }}
                >
                  soon
                </span>
              )}
            </a>
          );
        })}
      </nav>

      <div className="app-topbar-meta">
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{today}</span>
        {userName ? <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{userName}</span> : null}
        <button onClick={handleLogout} style={{ fontSize: 11, padding: "5px 10px" }}>
          Log out
        </button>
      </div>
    </div>
  );
}
