"use client";

import { useEffect, useState } from "react";
import { setTaskCompleted } from "@/lib/local/tasks";
import { getScheduleForDate, getScheduleSummaryForDate, materializeTemplateItem } from "@/lib/local/dailyTasks";
import { waterTotalForDate } from "@/lib/local/water";
import { sleepForDate } from "@/lib/local/sleep";
import SummaryTiles from "./SummaryTiles";
import ScheduleList from "./ScheduleList";
import WaterClient from "@/components/water/WaterClient";
import SleepClient from "@/components/sleep/SleepClient";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardClient({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({ total: 0, done: 0, percent: 0 });
  const [waterMl, setWaterMl] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [loading, setLoading] = useState(true);

  async function load() {
    const date = todayISO();
    const [taskList, taskSummary, water, sleep] = await Promise.all([
      getScheduleForDate(userId, date),
      getScheduleSummaryForDate(userId, date),
      waterTotalForDate(userId, date),
      sleepForDate(userId, date),
    ]);
    setTasks(taskList);
    setSummary(taskSummary);
    setWaterMl(water);
    setSleepHours(sleep ? Number(sleep.hours_slept) : 0);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function refreshTiles() {
    const date = todayISO();
    const [water, sleep] = await Promise.all([waterTotalForDate(userId, date), sleepForDate(userId, date)]);
    setWaterMl(water);
    setSleepHours(sleep ? Number(sleep.hours_slept) : 0);
  }

  async function handleToggle(task) {
    const date = todayISO();
    if (task.isVirtual) {
      await materializeTemplateItem(userId, task, date, true);
    } else {
      await setTaskCompleted(userId, task.id, !task.completed);
    }
    const [taskList, taskSummary] = await Promise.all([
      getScheduleForDate(userId, date),
      getScheduleSummaryForDate(userId, date),
    ]);
    setTasks(taskList);
    setSummary(taskSummary);
  }

  if (loading) {
    return <div className="muted" style={{ fontSize: 12 }}>Loading…</div>;
  }

  return (
    <div>
      <div className="page-title">Today&apos;s overview</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <SummaryTiles taskPercent={summary.percent} waterMl={waterMl} sleepHours={sleepHours} />

        <div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Today&apos;s schedule</div>
          <ScheduleList tasks={tasks} onToggle={handleToggle} />
        </div>

        <WaterClient userId={userId} compact onChange={refreshTiles} />
        <SleepClient userId={userId} compact onChange={refreshTiles} />
      </div>
    </div>
  );
}
