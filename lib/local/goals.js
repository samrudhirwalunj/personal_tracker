"use client";

import { getLocalDb } from "./db";

const PRIORITY_ORDER = { high: 0, med: 1, low: 2 };

function sortGoals(goals) {
  return [...goals].sort((a, b) => {
    const aDone = a.status === "done";
    const bDone = b.status === "done";
    if (aDone !== bDone) return aDone ? 1 : -1;

    const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return a.deadline < b.deadline ? -1 : 1;
  });
}

export async function listGoals(userId) {
  const db = await getLocalDb(userId);
  const goals = await db.getAll("goals");
  return sortGoals(goals);
}

export async function createGoal(userId, { title, whyText = null, deadline = null, priority = "med" }) {
  const db = await getLocalDb(userId);
  const id = await db.add("goals", {
    title,
    why_text: whyText,
    deadline,
    priority,
    status: "not_started",
    created_at: new Date().toISOString(),
    completed_at: null,
  });
  return db.get("goals", id);
}

export async function updateGoal(userId, goalId, updates) {
  const db = await getLocalDb(userId);
  const goal = await db.get("goals", goalId);
  if (!goal) return null;
  Object.assign(goal, updates);
  if (updates.status !== undefined) {
    goal.completed_at = updates.status === "done" ? new Date().toISOString() : null;
  }
  await db.put("goals", goal);
  return goal;
}

export async function deleteGoal(userId, goalId) {
  const db = await getLocalDb(userId);
  await db.delete("goals", goalId);
}

export async function replaceAllGoals(userId, goals) {
  const db = await getLocalDb(userId);
  const tx = db.transaction("goals", "readwrite");
  await tx.store.clear();
  for (const g of goals || []) await tx.store.add(g);
  await tx.done;
}
