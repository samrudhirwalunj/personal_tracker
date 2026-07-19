"use client";

import { getLocalDb } from "./db";

export async function getMoodForDate(userId, date) {
  const db = await getLocalDb(userId);
  return (await db.getFromIndex("mood_logs", "by_date", date)) || null;
}

export async function setMood(userId, date, mood, note = null) {
  const db = await getLocalDb(userId);
  const existing = await db.getFromIndex("mood_logs", "by_date", date);
  const record = {
    ...(existing || {}),
    log_date: date,
    mood,
    note,
    logged_at: new Date().toISOString(),
  };
  const id = await db.put("mood_logs", record);
  return db.get("mood_logs", id);
}

export async function listMoodHistory(userId, limit = 14) {
  const db = await getLocalDb(userId);
  const all = await db.getAll("mood_logs");
  return all.sort((a, b) => (a.log_date < b.log_date ? 1 : -1)).slice(0, limit);
}

export async function listAllMoodLogs(userId) {
  const db = await getLocalDb(userId);
  return db.getAll("mood_logs");
}

export async function deleteMoodForDate(userId, logId) {
  const db = await getLocalDb(userId);
  await db.delete("mood_logs", logId);
}

export async function replaceAllMoodLogs(userId, logs) {
  const db = await getLocalDb(userId);
  const tx = db.transaction("mood_logs", "readwrite");
  await tx.store.clear();
  for (const l of logs || []) await tx.store.add(l);
  await tx.done;
}
