"use client";

import { openDB } from "idb";

const DB_VERSION = 5;

// One IndexedDB database per logged-in user, so switching accounts on the same
// device/browser can never mix data between users. Nothing here ever leaves
// the device except through an explicit, user-initiated Drive backup.
export async function getLocalDb(userId) {
  return openDB(`pt-${userId}`, DB_VERSION, {
    upgrade(db, oldVersion, _newVersion, transaction) {
      if (oldVersion < 1) {
        const tasks = db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
        tasks.createIndex("by_date", "task_date");

        db.createObjectStore("goals", { keyPath: "id", autoIncrement: true });

        const water = db.createObjectStore("water_logs", { keyPath: "id", autoIncrement: true });
        water.createIndex("by_logged_at", "logged_at");

        const sleep = db.createObjectStore("sleep_logs", { keyPath: "id", autoIncrement: true });
        sleep.createIndex("by_date", "log_date", { unique: true });
      }
      if (oldVersion < 2) {
        db.createObjectStore("daily_task_templates", { keyPath: "id", autoIncrement: true });
      }
      if (oldVersion < 3) {
        // Water moves from one row per "add" event to one row per day
        // (matching sleep) — old per-pour rows lack log_date and simply
        // won't be indexable by day, but stay around as historical rows.
        const water = transaction.objectStore("water_logs");
        water.createIndex("by_date", "log_date", { unique: true });
      }
      if (oldVersion < 4) {
        const mood = db.createObjectStore("mood_logs", { keyPath: "id", autoIncrement: true });
        mood.createIndex("by_date", "log_date", { unique: true });
      }
      if (oldVersion < 5) {
        db.createObjectStore("books", { keyPath: "id", autoIncrement: true });
      }
    },
  });
}
