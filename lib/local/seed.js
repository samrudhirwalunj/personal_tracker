"use client";

import { createTask, listAllTasks } from "./tasks";
import { createTemplate, listTemplates } from "./dailyTasks";
import { createGoal, updateGoal, listGoals } from "./goals";
import { addWaterLog, listAllWaterLogs } from "./water";
import { upsertSleepLog, listAllSleepLogs } from "./sleep";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Populates a few sample rows for the local-only dev preview user, so the
// dashboard/tasks/goals/water/sleep screens don't look empty. No-ops if this
// preview user already has data, so it's safe to call on every dev login.
export async function seedSampleData(userId) {
  const [tasks, templates, goals, water, sleep] = await Promise.all([
    listAllTasks(userId),
    listTemplates(userId),
    listGoals(userId),
    listAllWaterLogs(userId),
    listAllSleepLogs(userId),
  ]);
  if (tasks.length || templates.length || goals.length || water.length || sleep.length) return;

  const date = todayISO();

  await createTemplate(userId, { title: "Morning stretch", taskTime: "07:00" });
  await createTask(userId, { title: "Deep work block", taskDate: date, taskTime: "09:30" });
  await createTask(userId, { title: "Evening walk", taskDate: date, taskTime: "18:00" });

  await createGoal(userId, { title: "Run a 10K", whyText: "Build endurance", deadline: null, priority: "high" });
  const g2 = await createGoal(userId, { title: "Read 12 books this year", priority: "med" });
  await updateGoal(userId, g2.id, { status: "done" });
  await createGoal(userId, { title: "Save ₹50,000", priority: "low" });

  await addWaterLog(userId, 250);
  await addWaterLog(userId, 500);
  await addWaterLog(userId, 250);

  await upsertSleepLog(userId, date, 7.2);
}
