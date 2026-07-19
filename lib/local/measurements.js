"use client";

import { getLocalDb } from "./db";

export const MEASUREMENT_FIELDS = [
  { key: "weight", label: "Weight", unit: "kg" },
  { key: "chest", label: "Chest", unit: "cm" },
  { key: "waist", label: "Waist", unit: "cm" },
  { key: "hips", label: "Hips", unit: "cm" },
  { key: "thigh", label: "Thigh", unit: "cm" },
  { key: "calf", label: "Calf", unit: "cm" },
  { key: "arm", label: "Arm", unit: "cm" },
];

function yearMonthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export async function listMeasurementsForYear(userId, year) {
  const db = await getLocalDb(userId);
  const all = await db.getAll("body_measurements");
  return all.filter((m) => m.year === year);
}

export async function setMeasurementField(userId, year, month, field, value) {
  const db = await getLocalDb(userId);
  const key = yearMonthKey(year, month);
  const existing = await db.getFromIndex("body_measurements", "by_year_month", key);
  const record = {
    ...(existing || {}),
    year,
    month,
    year_month: key,
    [field]: value,
    updated_at: new Date().toISOString(),
  };
  const id = await db.put("body_measurements", record);
  return db.get("body_measurements", id);
}

export async function listAllMeasurements(userId) {
  const db = await getLocalDb(userId);
  return db.getAll("body_measurements");
}

export async function replaceAllMeasurements(userId, rows) {
  const db = await getLocalDb(userId);
  const tx = db.transaction("body_measurements", "readwrite");
  await tx.store.clear();
  for (const r of rows || []) await tx.store.add(r);
  await tx.done;
}
