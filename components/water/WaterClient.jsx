"use client";

import { useEffect, useState } from "react";
import { addWaterLog, listWaterLogsForDate, waterTotalForDate, deleteWaterLog } from "@/lib/local/water";

const QUICK_AMOUNTS = [150, 250, 500];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function WaterClient({ userId }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState("");

  async function load() {
    setLoading(true);
    const date = todayISO();
    const [logList, dayTotal] = await Promise.all([
      listWaterLogsForDate(userId, date),
      waterTotalForDate(userId, date),
    ]);
    setLogs(logList);
    setTotal(dayTotal);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addWater(amountMl) {
    if (!amountMl || amountMl <= 0) return;
    await addWaterLog(userId, amountMl);
    setCustomAmount("");
    load();
  }

  async function removeLog(log) {
    await deleteWaterLog(userId, log.id);
    load();
  }

  return (
    <div>
      <div className="page-title">Water · {total.toLocaleString()} ml today</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {QUICK_AMOUNTS.map((amt) => (
          <button key={amt} className="btn-primary" onClick={() => addWater(amt)} style={{ flex: 1 }}>
            +{amt} ml
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="number"
          placeholder="Custom amount (ml)"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          style={{ flex: 1 }}
        />
        <button onClick={() => addWater(Number(customAmount))}>Add</button>
      </div>

      {loading ? (
        <div className="muted" style={{ fontSize: 12 }}>Loading…</div>
      ) : logs.length === 0 ? (
        <div className="muted" style={{ fontSize: 12 }}>No water logged today yet.</div>
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
              <span>{log.amount_ml} ml</span>
              <span style={{ color: "var(--text-muted)" }}>
                {new Date(log.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <button onClick={() => removeLog(log)} style={{ fontSize: 11 }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
