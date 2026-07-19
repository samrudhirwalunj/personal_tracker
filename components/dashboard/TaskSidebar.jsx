"use client";

import { useState } from "react";
import BatteryIndicator from "@/components/ui/BatteryIndicator";
import ScheduleList from "./ScheduleList";

export default function TaskSidebar({ taskPercent, tasks, onToggle }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside className="dashboard-sidebar">
      {/* Desktop: battery + task list always visible */}
      <div
        className="sidebar-battery-static"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 14 }}
      >
        <BatteryIndicator percent={taskPercent} width={26} height={50} />
        <div style={{ fontSize: 14, fontWeight: 500 }}>{taskPercent}%</div>
        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Tasks today</div>
      </div>

      {/* Mobile: collapsed battery bar, tap to reveal the checklist */}
      <button
        className="sidebar-battery-toggle card"
        onClick={() => setExpanded((v) => !v)}
        style={{ alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 10 }}
      >
        <BatteryIndicator percent={taskPercent} width={18} height={34} />
        <span style={{ fontSize: 12.5, fontWeight: 500 }}>{taskPercent}% · Tasks</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>
          {expanded ? "Hide" : "Show"}
        </span>
      </button>

      <div className={`sidebar-tasks${expanded ? " expanded" : ""}`}>
        <ScheduleList tasks={tasks} onToggle={onToggle} />
      </div>
    </aside>
  );
}
