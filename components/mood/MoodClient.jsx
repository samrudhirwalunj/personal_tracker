"use client";

import { useEffect, useState } from "react";
import { getMoodForDate, setMood, listMoodHistory, deleteMoodForDate } from "@/lib/local/mood";

const MOODS = [
  { key: "great", emoji: "😄", label: "Great" },
  { key: "good", emoji: "🙂", label: "Good" },
  { key: "okay", emoji: "😐", label: "Okay" },
  { key: "bad", emoji: "🙁", label: "Bad" },
  { key: "awful", emoji: "😞", label: "Awful" },
];

const MOOD_BY_KEY = Object.fromEntries(MOODS.map((m) => [m.key, m]));

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function MoodClient({ userId, compact = false, onChange }) {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const date = todayISO();
    const [todayRow, historyRows] = await Promise.all([
      getMoodForDate(userId, date),
      listMoodHistory(userId),
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

  async function pickMood(key) {
    await setMood(userId, todayISO(), key);
    load();
  }

  async function removeDay(row) {
    await deleteMoodForDate(userId, row.id);
    load();
  }

  const todayMeta = today ? MOOD_BY_KEY[today.mood] : null;

  return (
    <div>
      <div className={compact ? "" : "page-title"} style={compact ? { fontSize: 13, fontWeight: 500, marginBottom: 8 } : undefined}>
        Mood {todayMeta ? `· ${todayMeta.emoji} ${todayMeta.label} today` : "· not logged yet"}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {MOODS.map((m) => {
          const active = today?.mood === m.key;
          return (
            <button
              key={m.key}
              onClick={() => pickMood(m.key)}
              title={m.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "8px 2px",
                fontSize: 20,
                background: active ? "var(--bg-accent)" : "var(--surface-2)",
                border: active ? "1.5px solid var(--border-accent)" : "0.5px solid var(--border)",
              }}
            >
              <span>{m.emoji}</span>
              <span style={{ fontSize: 9.5, color: "var(--text-secondary)" }}>{m.label}</span>
            </button>
          );
        })}
      </div>

      {!loading && history.length > 0 && (
        <div className="card">
          {history.map((row, i) => {
            const meta = MOOD_BY_KEY[row.mood];
            return (
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
                <span>{meta ? `${meta.emoji} ${meta.label}` : row.mood}</span>
                <button onClick={() => removeDay(row)} style={{ fontSize: 11 }}>Delete</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
