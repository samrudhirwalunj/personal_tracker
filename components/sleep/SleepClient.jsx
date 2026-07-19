"use client";

import { useEffect, useState } from "react";
import { upsertSleepLog, listSleepLogs, sleepForDate, deleteSleepLog } from "@/lib/local/sleep";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function SleepClient({ userId, compact = false, onChange }) {
  const [logs, setLogs] = useState([]);
  const [todayLog, setTodayLog] = useState(null);
  const [hours, setHours] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [logList, todayEntry] = await Promise.all([
      listSleepLogs(userId),
      sleepForDate(userId, todayISO()),
    ]);
    setLogs(logList);
    setTodayLog(todayEntry);
    setHours(todayEntry ? String(todayEntry.hours_slept) : "");
    setLoading(false);
    onChange?.();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveSleep(e) {
    e.preventDefault();
    const value = Number(hours);
    if (!value || value <= 0) return;
    await upsertSleepLog(userId, todayISO(), value);
    load();
  }

  async function removeLog(log) {
    await deleteSleepLog(userId, log.id);
    load();
  }

  return (
    <div>
      <div className={compact ? "" : "page-title"} style={compact ? { fontSize: 13, fontWeight: 500, marginBottom: 8 } : undefined}>
        Sleep · {todayLog ? `${todayLog.hours_slept} hrs last night` : "not logged yet"}
      </div>

      <form onSubmit={saveSleep} className="card" style={{ padding: 16, marginBottom: 16, display: "flex", gap: 8, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <label className="field-label">Hours slept last night</label>
          <input
            type="number"
            step="0.1"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>
        <button type="submit" className="btn-primary">Save</button>
      </form>

      {loading ? (
        <div className="muted" style={{ fontSize: 12 }}>Loading…</div>
      ) : logs.length === 0 ? (
        <div className="muted" style={{ fontSize: 12 }}>No sleep logged yet.</div>
      ) : (
        <div className="card">
          {logs.map((log, i) => (
            <div
              key={log.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                fontSize: 12,
                borderBottom: i < logs.length - 1 ? "0.5px solid var(--border)" : "none",
              }}
            >
              <span>{log.log_date}</span>
              <span>{log.hours_slept} hrs</span>
              <button onClick={() => removeLog(log)} style={{ fontSize: 11 }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
