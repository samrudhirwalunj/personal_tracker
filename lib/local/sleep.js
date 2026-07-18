"use client";

import { getLocalDb } from "./db";

export async function upsertSleepLog(userId, logDate, hoursSlept) {
  const db = await getLocalDb(userId);
  const existing = await db.getFromIndex("sleep_logs", "by_date", logDate);
  const record = {
    ...(existing || {}),
    log_date: logDate,
    hours_slept: hoursSlept,
    logged_at: new Date().toISOString(),
  };
  const id = await db.put("sleep_logs", record);
  return db.get("sleep_logs", id);
}

export async function listSleepLogs(userId, limit = 14) {
  const db = await getLocalDb(userId);
  const all = await db.getAll("sleep_logs");
  return all.sort((a, b) => (a.log_date < b.log_date ? 1 : -1)).slice(0, limit);
}

export async function listAllSleepLogs(userId) {
  const db = await getLocalDb(userId);
  return db.getAll("sleep_logs");
}

export async function sleepForDate(userId, logDate) {
  const db = await getLocalDb(userId);
  return (await db.getFromIndex("sleep_logs", "by_date", logDate)) || null;
}

export async function deleteSleepLog(userId, logId) {
  const db = await getLocalDb(userId);
  await db.delete("sleep_logs", logId);
}

export async function replaceAllSleepLogs(userId, logs) {
  const db = await getLocalDb(userId);
  const tx = db.transaction("sleep_logs", "readwrite");
  await tx.store.clear();
  for (const l of logs || []) await tx.store.add(l);
  await tx.done;
}
