"use client";

import { useEffect, useState } from "react";
import { backupToDrive } from "@/lib/local/backup";

const FREQUENCY_MS = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

export default function SyncPrompt({ userId }) {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const frequency = localStorage.getItem("pt_drive_sync_frequency");
    if (!frequency || frequency === "manual") return;
    if (sessionStorage.getItem("pt_sync_prompted")) return;

    const lastSync = localStorage.getItem("pt_last_drive_sync");
    const threshold = FREQUENCY_MS[frequency];
    const due = !lastSync || Date.now() - new Date(lastSync).getTime() > threshold;

    if (due) {
      setVisible(true);
      sessionStorage.setItem("pt_sync_prompted", "1");
    }
  }, []);

  async function syncNow() {
    setBusy(true);
    try {
      await backupToDrive(userId);
      localStorage.setItem("pt_last_drive_sync", new Date().toISOString());
    } catch {
      // Silently drop it — the user can still back up manually from Settings.
    } finally {
      setBusy(false);
      setVisible(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="floating-banner" style={{ bottom: 16, zIndex: 50 }}>
      <span style={{ fontSize: 12 }}>Back up your data to Google Drive now?</span>
      <div className="floating-banner-actions">
        <button className="btn-primary" onClick={syncNow} disabled={busy} style={{ fontSize: 11 }}>
          {busy ? "Syncing…" : "Sync"}
        </button>
        <button onClick={() => setVisible(false)} style={{ fontSize: 11 }}>
          Not now
        </button>
      </div>
    </div>
  );
}
