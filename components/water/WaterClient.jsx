"use client";

import { useEffect, useState } from "react";
import { addWaterAmount, getWaterForDate, listWaterHistory, deleteWaterForDate } from "@/lib/local/water";
import WaterDrop from "./WaterDrop";

const DROP_COUNT = 5; // each drop = 1000ml, so this shows up to 5L/day
const DROP_ML = 1000;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function WaterClient({ userId, compact = false, onChange }) {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustom, setShowCustom] = useState(false);
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

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {Array.from({ length: DROP_COUNT }).map((_, i) => {
          const dropPercent = Math.max(0, Math.min(1, (totalMl - i * DROP_ML) / DROP_ML));
          return <WaterDrop key={i} percent={dropPercent} />;
        })}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button className="btn-primary" onClick={() => adjustWater(250)} style={{ flex: 1 }}>
          +250 ml
        </button>
        <button className="btn-primary" onClick={() => adjustWater(1000)} style={{ flex: 1 }}>
          +1 L
        </button>
      </div>

      {showCustom ? (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="number"
            placeholder="Custom amount (ml)"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            style={{ flex: 1 }}
            autoFocus
          />
          <button
            onClick={() => {
              adjustWater(Number(customAmount));
              setCustomAmount("");
              setShowCustom(false);
            }}
          >
            Add
          </button>
        </div>
      ) : (
        <button onClick={() => setShowCustom(true)} style={{ fontSize: 11, marginBottom: 16 }}>
          Custom amount…
        </button>
      )}

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
