"use client";

import { listAllTasks, replaceAllTasks } from "./tasks";
import { listGoals, replaceAllGoals } from "./goals";
import { listAllWaterLogs, replaceAllWaterLogs } from "./water";
import { listAllSleepLogs, replaceAllSleepLogs } from "./sleep";
import { uploadBackup, downloadBackup } from "@/lib/googleDrive";

export async function backupToDrive(userId) {
  const [tasks, goals, waterLogs, sleepLogs] = await Promise.all([
    listAllTasks(userId),
    listGoals(userId),
    listAllWaterLogs(userId),
    listAllSleepLogs(userId),
  ]);
  await uploadBackup({ exportedAt: new Date().toISOString(), tasks, goals, waterLogs, sleepLogs });
}

export async function restoreFromDrive(userId) {
  const backup = await downloadBackup();
  if (!backup) return false;
  await Promise.all([
    replaceAllTasks(userId, backup.tasks),
    replaceAllGoals(userId, backup.goals),
    replaceAllWaterLogs(userId, backup.waterLogs),
    replaceAllSleepLogs(userId, backup.sleepLogs),
  ]);
  return true;
}
