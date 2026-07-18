"use client";

import { getLocalDb } from "./db";

export async function listTasksForDate(userId, date) {
  const db = await getLocalDb(userId);
  const tasks = await db.getAllFromIndex("tasks", "by_date", date);
  return tasks.sort((a, b) => {
    if (!a.task_time && !b.task_time) return a.id - b.id;
    if (!a.task_time) return 1;
    if (!b.task_time) return -1;
    return a.task_time < b.task_time ? -1 : a.task_time > b.task_time ? 1 : 0;
  });
}

export async function listAllTasks(userId) {
  const db = await getLocalDb(userId);
  return db.getAll("tasks");
}

export async function createTask(userId, { title, taskDate, taskTime = null }) {
  const db = await getLocalDb(userId);
  const id = await db.add("tasks", {
    title,
    task_date: taskDate,
    task_time: taskTime,
    completed: false,
    completed_at: null,
    created_at: new Date().toISOString(),
  });
  return db.get("tasks", id);
}

export async function setTaskCompleted(userId, taskId, completed) {
  const db = await getLocalDb(userId);
  const task = await db.get("tasks", taskId);
  if (!task) return null;
  task.completed = completed;
  task.completed_at = completed ? new Date().toISOString() : null;
  await db.put("tasks", task);
  return task;
}

export async function updateTask(userId, taskId, updates) {
  const db = await getLocalDb(userId);
  const task = await db.get("tasks", taskId);
  if (!task) return null;
  Object.assign(task, updates);
  await db.put("tasks", task);
  return task;
}

export async function deleteTask(userId, taskId) {
  const db = await getLocalDb(userId);
  await db.delete("tasks", taskId);
}

export async function taskCompletionSummary(userId, date) {
  const tasks = await listTasksForDate(userId, date);
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export async function replaceAllTasks(userId, tasks) {
  const db = await getLocalDb(userId);
  const tx = db.transaction("tasks", "readwrite");
  await tx.store.clear();
  for (const t of tasks || []) await tx.store.add(t);
  await tx.done;
}
