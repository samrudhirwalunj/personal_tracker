"use client";

import { useEffect, useState } from "react";
import { setTaskCompleted } from "@/lib/local/tasks";
import { getScheduleForDate, getScheduleSummaryForDate, materializeTemplateItem } from "@/lib/local/dailyTasks";
import TaskSidebar from "./TaskSidebar";
import WaterClient from "@/components/water/WaterClient";
import SleepClient from "@/components/sleep/SleepClient";
import MoodClient from "@/components/mood/MoodClient";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardClient({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({ total: 0, done: 0, percent: 0 });
  const [loading, setLoading] = useState(true);

  async function load() {
    const date = todayISO();
    const [taskList, taskSummary] = await Promise.all([
      getScheduleForDate(userId, date),
      getScheduleSummaryForDate(userId, date),
    ]);
    setTasks(taskList);
    setSummary(taskSummary);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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

      <div className="dashboard-layout">
        <TaskSidebar taskPercent={summary.percent} tasks={tasks} onToggle={handleToggle} />

        <div className="dashboard-main">
          <div className="two-col" style={{ marginBottom: 20 }}>
            <WaterClient userId={userId} compact />
            <MoodClient userId={userId} compact />
          </div>

          <SleepClient userId={userId} compact />
        </div>
      </div>
    </div>
  );
}
