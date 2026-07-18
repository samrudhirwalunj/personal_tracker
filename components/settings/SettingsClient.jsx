"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackupSection from "./BackupSection";

export default function SettingsClient({ userId }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checkedProfile, setCheckedProfile] = useState(false);
  const [name, setName] = useState("");
  const [lifestyle, setLifestyle] = useState("Sedentary");
  const [reminderOptIn, setReminderOptIn] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setName(data.user.name || "");
          setLifestyle(data.user.lifestyle || "Sedentary");
          setReminderOptIn(!!data.user.reminder_opt_in);
        }
        setCheckedProfile(true);
      });
  }, []);

  async function save(e) {
    e.preventDefault();
    setSaved(false);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, lifestyle, reminderOptIn }),
    });
    setSaved(true);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (!checkedProfile) {
    return <div className="muted" style={{ fontSize: 12 }}>Loading…</div>;
  }

  return (
    <div>
      <div className="page-title">Settings</div>

      {user ? (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Mobile number</div>
          <div style={{ fontSize: 13, marginBottom: 8 }}>{user.phone}</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Getting started since</div>
          <div style={{ fontSize: 13 }}>
            {new Date(user.onboarding_completed_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div className="muted" style={{ fontSize: 12 }}>
            Profile unavailable (Supabase isn&apos;t configured in this environment yet).
          </div>
        </div>
      )}

      {user && (
        <form onSubmit={save} className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label className="field-label">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", marginTop: 4 }} />
          </div>
          <div>
            <label className="field-label">Lifestyle</label>
            <select value={lifestyle} onChange={(e) => setLifestyle(e.target.value)} style={{ width: "100%", marginTop: 4 }}>
              <option>Sedentary</option>
              <option>Lightly active</option>
              <option>Active</option>
              <option>Very active</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12 }}>Daily reminder</span>
            <input type="checkbox" checked={reminderOptIn} onChange={(e) => setReminderOptIn(e.target.checked)} />
          </div>
          {saved && <div style={{ fontSize: 11, color: "var(--text-success)" }}>Saved</div>}
          <button type="submit" className="btn-primary">Save changes</button>
        </form>
      )}

      <BackupSection userId={userId} />

      <button onClick={logout} className="btn-danger" style={{ marginTop: 16, width: "100%" }}>
        Log out
      </button>
    </div>
  );
}
