"use client";

import { listAllTasks, replaceAllTasks } from "./tasks";
import { listTemplates, replaceAllTemplates } from "./dailyTasks";
import { listGoals, replaceAllGoals } from "./goals";
import { listAllWaterLogs, replaceAllWaterLogs } from "./water";
import { listAllSleepLogs, replaceAllSleepLogs } from "./sleep";
import { listAllMoodLogs, replaceAllMoodLogs } from "./mood";
import { listBooks, replaceAllBooks } from "./books";
import { uploadBackup, downloadBackup } from "@/lib/googleDrive";

export async function backupToDrive(userId) {
  const [tasks, dailyTaskTemplates, goals, waterLogs, sleepLogs, moodLogs, books] = await Promise.all([
    listAllTasks(userId),
    listTemplates(userId),
    listGoals(userId),
    listAllWaterLogs(userId),
    listAllSleepLogs(userId),
    listAllMoodLogs(userId),
    listBooks(userId),
  ]);
  await uploadBackup({
    exportedAt: new Date().toISOString(),
    tasks,
    dailyTaskTemplates,
    goals,
    waterLogs,
    sleepLogs,
    moodLogs,
    books,
  });
}

export async function restoreFromDrive(userId) {
  const backup = await downloadBackup();
  if (!backup) return false;
  await Promise.all([
    replaceAllTasks(userId, backup.tasks),
    replaceAllTemplates(userId, backup.dailyTaskTemplates),
    replaceAllGoals(userId, backup.goals),
    replaceAllWaterLogs(userId, backup.waterLogs),
    replaceAllSleepLogs(userId, backup.sleepLogs),
    replaceAllMoodLogs(userId, backup.moodLogs),
    replaceAllBooks(userId, backup.books),
  ]);
  return true;
}
