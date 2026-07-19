"use client";

import { getLocalDb } from "./db";

export async function getWaterForDate(userId, date) {
  const db = await getLocalDb(userId);
  return (await db.getFromIndex("water_logs", "by_date", date)) || null;
}

export async function waterTotalForDate(userId, date) {
  const row = await getWaterForDate(userId, date);
  return row ? row.amount_ml : 0;
}

// Adds (or subtracts, for a negative delta) to that day's single running
// total instead of creating a new row per pour — clamped at 0.
export async function addWaterAmount(userId, date, delta) {
  const db = await getLocalDb(userId);
  const existing = await db.getFromIndex("water_logs", "by_date", date);
  const record = {
    ...(existing || {}),
    log_date: date,
    amount_ml: Math.max(0, (existing?.amount_ml || 0) + delta),
    logged_at: new Date().toISOString(),
  };
  const id = await db.put("water_logs", record);
  return db.get("water_logs", id);
}

export async function setWaterAmount(userId, date, amountMl) {
  const db = await getLocalDb(userId);
  const existing = await db.getFromIndex("water_logs", "by_date", date);
  const record = {
    ...(existing || {}),
    log_date: date,
    amount_ml: Math.max(0, amountMl),
    logged_at: new Date().toISOString(),
  };
  const id = await db.put("water_logs", record);
  return db.get("water_logs", id);
}

export async function listWaterHistory(userId, limit = 14) {
  const db = await getLocalDb(userId);
  const all = await db.getAll("water_logs");
  return all
    .filter((r) => r.log_date)
    .sort((a, b) => (a.log_date < b.log_date ? 1 : -1))
    .slice(0, limit);
}

export async function listAllWaterLogs(userId) {
  const db = await getLocalDb(userId);
  return db.getAll("water_logs");
}

export async function deleteWaterForDate(userId, logId) {
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
