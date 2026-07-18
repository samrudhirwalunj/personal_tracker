"use client";

import { getLocalDb } from "./db";

function nextDateUTC(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export async function addWaterLog(userId, amountMl) {
  const db = await getLocalDb(userId);
  const id = await db.add("water_logs", { amount_ml: amountMl, logged_at: new Date().toISOString() });
  return db.get("water_logs", id);
}

export async function listWaterLogsForDate(userId, date) {
  const db = await getLocalDb(userId);
  const range = IDBKeyRange.bound(
    `${date}T00:00:00.000Z`,
    `${nextDateUTC(date)}T00:00:00.000Z`,
    false,
    true
  );
  const logs = await db.getAllFromIndex("water_logs", "by_logged_at", range);
  return logs.sort((a, b) => (a.logged_at < b.logged_at ? 1 : -1));
}

export async function listAllWaterLogs(userId) {
  const db = await getLocalDb(userId);
  return db.getAll("water_logs");
}

export async function waterTotalForDate(userId, date) {
  const logs = await listWaterLogsForDate(userId, date);
  return logs.reduce((sum, log) => sum + log.amount_ml, 0);
}

export async function deleteWaterLog(userId, logId) {
  const db = await getLocalDb(userId);
  await db.delete("water_logs", logId);
}

export async function replaceAllWaterLogs(userId, logs) {
  const db = await getLocalDb(userId);
  const tx = db.transaction("water_logs", "readwrite");
  await tx.store.clear();
  for (const l of logs || []) await tx.store.add(l);
  await tx.done;
}
