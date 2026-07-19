"use client";

import { createTask, listAllTasks } from "./tasks";
import { createTemplate, listTemplates } from "./dailyTasks";
import { createGoal, updateGoal, listGoals } from "./goals";
import { addWaterAmount, listAllWaterLogs } from "./water";
import { upsertSleepLog, listAllSleepLogs } from "./sleep";
import { setMood, listAllMoodLogs } from "./mood";
import { createBook, listBooks } from "./books";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Populates a few sample rows for the local-only dev preview user, so the
// dashboard/tasks/goals/water/sleep screens don't look empty. No-ops if this
// preview user already has data, so it's safe to call on every dev login.
export async function seedSampleData(userId) {
  const [tasks, templates, goals, water, sleep, mood, books] = await Promise.all([
    listAllTasks(userId),
    listTemplates(userId),
    listGoals(userId),
    listAllWaterLogs(userId),
    listAllSleepLogs(userId),
    listAllMoodLogs(userId),
    listBooks(userId),
  ]);
  if (tasks.length || templates.length || goals.length || water.length || sleep.length || mood.length || books.length) return;

  const date = todayISO();

  await createTemplate(userId, { title: "Morning stretch", taskTime: "07:00" });
  await createTask(userId, { title: "Deep work block", taskDate: date, taskTime: "09:30" });
  await createTask(userId, { title: "Evening walk", taskDate: date, taskTime: "18:00" });

  await createGoal(userId, { title: "Run a 10K", whyText: "Build endurance", deadline: null, priority: "high" });
  const g2 = await createGoal(userId, { title: "Read 12 books this year", priority: "med" });
  await updateGoal(userId, g2.id, { status: "done" });
  await createGoal(userId, { title: "Save ₹50,000", priority: "low" });

  await addWaterAmount(userId, date, 1000);

  await upsertSleepLog(userId, date, 7.2);

  await setMood(userId, date, "good");

  await createBook(userId, {
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self-help",
    start_date: date,
    finish_date: "",
    format_paper: true,
  });
}
