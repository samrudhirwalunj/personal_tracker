import BatteryIndicator from "@/components/ui/BatteryIndicator";

export default function SummaryTiles({ taskPercent, waterMl, sleepHours }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <div
        className="card"
        style={{ flex: 1, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}
      >
        <BatteryIndicator percent={taskPercent} />
        <div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Tasks</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{taskPercent}%</div>
        </div>
      </div>
      <div className="card" style={{ flex: 1, padding: "10px 12px" }}>
        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Water</div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{waterMl.toLocaleString()} ml</div>
      </div>
      <div className="card" style={{ flex: 1, padding: "10px 12px" }}>
        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Sleep</div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{sleepHours} hrs</div>
      </div>
    </div>
  );
}
