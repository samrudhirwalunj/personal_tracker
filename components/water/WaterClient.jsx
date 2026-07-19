"use client";

import { useEffect, useState } from "react";
import { addWaterAmount, getWaterForDate, listWaterHistory, deleteWaterForDate } from "@/lib/local/water";

const QUICK_AMOUNTS = [150, 250, 500];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function WaterClient({ userId, compact = false, onChange }) {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState("");

  async function load() {
    setLoading(true);
    const date = todayISO();
    const [todayRow, historyRows] = await Promise.all([
      getWaterForDate(userId, date),
      listWaterHistory(userId),
    ]);
    setToday(todayRow);
    setHistory(historyRows.filter((r) => r.log_date !== date));
    setLoading(false);
    onChange?.();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function adjustWater(delta) {
    if (!delta) return;
    await addWaterAmount(userId, todayISO(), delta);
    load();
  }

  async function removeDay(row) {
    await deleteWaterForDate(userId, row.id);
    load();
  }

  const totalMl = today?.amount_ml || 0;

  return (
    <div>
      <div className={compact ? "" : "page-title"} style={compact ? { fontSize: 13, fontWeight: 500, marginBottom: 8 } : undefined}>
        Water · {totalMl.toLocaleString()} ml today
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {QUICK_AMOUNTS.map((amt) => (
          <button key={amt} className="btn-primary" onClick={() => adjustWater(amt)} style={{ flex: 1 }}>
            +{amt} ml
          </button>
        ))}
        <button onClick={() => adjustWater(-250)} disabled={totalMl <= 0} title="Undo 250ml">
          −250 ml
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="number"
          placeholder="Custom amount (ml)"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          style={{ flex: 1 }}
        />
        <button
          onClick={() => {
            adjustWater(Number(customAmount));
            setCustomAmount("");
          }}
        >
          Add
        </button>
      </div>

      {!loading && history.length > 0 && (
        <div className="card">
          {history.map((row, i) => (
            <div
              key={row.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                fontSize: 12,
                borderBottom: i < history.length - 1 ? "0.5px solid var(--border)" : "none",
              }}
            >
              <span>{row.log_date}</span>
              <span>{row.amount_ml.toLocaleString()} ml</span>
              <button onClick={() => removeDay(row)} style={{ fontSize: 11 }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
