"use client";

import { useEffect, useState } from "react";
import { listTasksForDate, taskCompletionSummary } from "@/lib/local/tasks";
import { waterTotalForDate } from "@/lib/local/water";
import { sleepForDate } from "@/lib/local/sleep";
import SummaryTiles from "./SummaryTiles";
import ScheduleList from "./ScheduleList";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardClient({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({ total: 0, done: 0, percent: 0 });
  const [waterMl, setWaterMl] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const date = todayISO();
    Promise.all([
      listTasksForDate(userId, date),
      taskCompletionSummary(userId, date),
      waterTotalForDate(userId, date),
      sleepForDate(userId, date),
    ]).then(([taskList, taskSummary, water, sleep]) => {
      setTasks(taskList);
      setSummary(taskSummary);
      setWaterMl(water);
      setSleepHours(sleep ? Number(sleep.hours_slept) : 0);
      setLoading(false);
    });
  }, [userId]);

  if (loading) {
    return <div className="muted" style={{ fontSize: 12 }}>Loading…</div>;
  }

  return (
    <div>
      <div className="page-title">Today&apos;s overview</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <SummaryTiles taskPercent={summary.percent} waterMl={waterMl} sleepHours={sleepHours} />

        <div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Today&apos;s schedule</div>
          <ScheduleList tasks={tasks} />
        </div>
      </div>
    </div>
  );
}
