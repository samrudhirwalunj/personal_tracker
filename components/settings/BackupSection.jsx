"use client";

import { useEffect, useState } from "react";
import { backupToDrive, restoreFromDrive } from "@/lib/local/backup";

const FREQUENCIES = [
  { value: "manual", label: "Manual only" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function BackupSection({ userId }) {
  const [frequency, setFrequency] = useState("manual");
  const [lastSync, setLastSync] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFrequency(localStorage.getItem("pt_drive_sync_frequency") || "manual");
    setLastSync(localStorage.getItem("pt_last_drive_sync"));
  }, []);

  function updateFrequency(value) {
    setFrequency(value);
    localStorage.setItem("pt_drive_sync_frequency", value);
  }

  async function syncNow() {
    setBusy(true);
    setStatus("");
    try {
      await backupToDrive(userId);
      const now = new Date().toISOString();
      localStorage.setItem("pt_last_drive_sync", now);
      setLastSync(now);
      setStatus("Backed up to Google Drive.");
    } catch (err) {
      setStatus(err.message || "Backup failed");
    } finally {
      setBusy(false);
    }
  }

  async function restoreNow() {
    if (
      !confirm(
        "This replaces your current tasks, goals, water, and sleep data with the Drive backup. Continue?"
      )
    ) {
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      const restored = await restoreFromDrive(userId);
      if (!restored) {
        setStatus("No backup found on Drive yet.");
        return;
      }
      setStatus("Restored from Google Drive. Reloading…");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setStatus(err.message || "Restore failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ padding: 16, marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 500 }}>Google Drive backup</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Your tasks, goals, water, and sleep data live only on this device. This optionally saves a
        compressed copy to a hidden folder in your own Google Drive that only this app can see —
        nobody else, not even us — so you can restore it on another device.
      </div>

      <div>
        <label className="field-label">Sync frequency</label>
        <select
          value={frequency}
          onChange={(e) => updateFrequency(e.target.value)}
          style={{ width: "100%", marginTop: 4 }}
        >
          {FREQUENCIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        {lastSync ? `Last backed up ${new Date(lastSync).toLocaleString()}` : "Never backed up yet"}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn-primary" onClick={syncNow} disabled={busy} style={{ flex: 1 }}>
          {busy ? "Working…" : "Back up now"}
        </button>
        <button onClick={restoreNow} disabled={busy} style={{ flex: 1 }}>
          Restore from Drive
        </button>
      </div>

      {status && <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{status}</div>}
    </div>
  );
}
