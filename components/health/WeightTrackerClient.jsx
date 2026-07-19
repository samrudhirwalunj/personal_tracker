"use client";

import { useEffect, useState } from "react";
import { listMeasurementsForYear, setMeasurementField, MEASUREMENT_FIELDS } from "@/lib/local/measurements";
import BodySilhouette from "./BodySilhouette";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function WeightTrackerClient({ userId }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [grid, setGrid] = useState({});
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const rows = await listMeasurementsForYear(userId, year);
    const byMonth = {};
    rows.forEach((r) => {
      byMonth[r.month] = r;
    });
    setGrid(byMonth);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  function cellValue(month, field) {
    return grid[month]?.[field] ?? "";
  }

  function updateCell(month, field, value) {
    setGrid((prev) => ({
      ...prev,
      [month]: { ...(prev[month] || {}), [field]: value },
    }));
  }

  async function persistCell(month, field) {
    const value = grid[month]?.[field];
    if (value === "" || value === undefined) return;
    await setMeasurementField(userId, year, month, field, Number(value));
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div className="page-title" style={{ marginBottom: 0 }}>Weight tracker</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setYear((y) => y - 1)} style={{ fontSize: 12, padding: "4px 8px" }}>‹</button>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{year}</span>
          <button onClick={() => setYear((y) => y + 1)} style={{ fontSize: 12, padding: "4px 8px" }}>›</button>
        </div>
      </div>

      <div className="card" style={{ padding: 16, display: "flex", gap: 20, alignItems: "flex-start" }}>
        <BodySilhouette />

        <div style={{ flex: 1, overflowX: "auto" }}>
          {loading ? (
            <div className="muted" style={{ fontSize: 12 }}>Loading…</div>
          ) : (
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontSize: 10.5, color: "var(--text-secondary)" }}>
                    &nbsp;
                  </th>
                  {MONTHS.map((m) => (
                    <th
                      key={m}
                      style={{
                        fontSize: 10,
                        color: "var(--text-secondary)",
                        padding: "6px 4px",
                        textAlign: "center",
                        borderBottom: "0.5px solid var(--border)",
                      }}
                    >
                      {m.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEASUREMENT_FIELDS.map((field) => (
                  <tr key={field.key}>
                    <td
                      style={{
                        fontSize: 11.5,
                        color: "var(--text-secondary)",
                        padding: "6px 8px",
                        whiteSpace: "nowrap",
                        borderBottom: "0.5px solid var(--border)",
                      }}
                    >
                      {field.label} <span style={{ color: "var(--text-muted)" }}>({field.unit})</span>
                    </td>
                    {MONTHS.map((_, monthIndex) => (
                      <td
                        key={monthIndex}
                        style={{ padding: "3px 2px", borderBottom: "0.5px solid var(--border)" }}
                      >
                        <input
                          type="number"
                          step="0.1"
                          value={cellValue(monthIndex, field.key)}
                          onChange={(e) => updateCell(monthIndex, field.key, e.target.value)}
                          onBlur={() => persistCell(monthIndex, field.key)}
                          style={{ width: 52, padding: "5px 4px", fontSize: 11, textAlign: "center" }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
