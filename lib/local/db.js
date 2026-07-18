"use client";

import { openDB } from "idb";

// One IndexedDB database per logged-in user, so switching accounts on the same
// device/browser can never mix data between users. Nothing here ever leaves
// the device except through an explicit, user-initiated Drive backup.
export async function getLocalDb(userId) {
  return openDB(`pt-${userId}`, 1, {
    upgrade(db) {
      const tasks = db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
      tasks.createIndex("by_date", "task_date");

      db.createObjectStore("goals", { keyPath: "id", autoIncrement: true });

      const water = db.createObjectStore("water_logs", { keyPath: "id", autoIncrement: true });
      water.createIndex("by_logged_at", "logged_at");

      const sleep = db.createObjectStore("sleep_logs", { keyPath: "id", autoIncrement: true });
      sleep.createIndex("by_date", "log_date", { unique: true });
    },
  });
}
