"use client";

import { getLocalDb } from "./db";

export async function listTemplates(userId) {
  const db = await getLocalDb(userId);
  const templates = await db.getAll("daily_task_templates");
  return templates.sort((a, b) => {
    if (!a.task_time && !b.task_time) return a.id - b.id;
    if (!a.task_time) return 1;
    if (!b.task_time) return -1;
    return a.task_time < b.task_time ? -1 : a.task_time > b.task_time ? 1 : 0;
  });
}

export async function createTemplate(userId, { title, taskTime = null }) {
  const db = await getLocalDb(userId);
  const id = await db.add("daily_task_templates", {
    title,
    task_time: taskTime,
    created_at: new Date().toISOString(),
  });
  return db.get("daily_task_templates", id);
}

export async function updateTemplate(userId, templateId, updates) {
  const db = await getLocalDb(userId);
  const template = await db.get("daily_task_templates", templateId);
  if (!template) return null;
  Object.assign(template, updates);
  await db.put("daily_task_templates", template);
  return template;
}

export async function deleteTemplate(userId, templateId) {
  const db = await getLocalDb(userId);
  await db.delete("daily_task_templates", templateId);
}

export async function replaceAllTemplates(userId, templates) {
  const db = await getLocalDb(userId);
  const tx = db.transaction("daily_task_templates", "readwrite");
  await tx.store.clear();
  for (const t of templates || []) await tx.store.add(t);
  await tx.done;
}

// Merges recurring daily templates with that day's one-off tasks. A template
// shows as a "virtual" (unsaved) row until it's checked off or otherwise
// touched on that specific date, at which point it materializes into a real
// row in the tasks store (see materializeTemplate) — so history stays
// per-day and deleting/editing a template later never rewrites the past.
export async function getScheduleForDate(userId, date) {
  const db = await getLocalDb(userId);
  const [templates, dayTasks] = await Promise.all([
    listTemplates(userId),
    db.getAllFromIndex("tasks", "by_date", date),
  ]);

  const materializedByTemplate = new Map(
    dayTasks.filter((t) => t.template_id != null).map((t) => [t.template_id, t])
  );

  const templateRows = templates.map((template) => {
    const existing = materializedByTemplate.get(template.id);
    if (existing) return existing;
    return {
      id: `virtual-${template.id}`,
      template_id: template.id,
      title: template.title,
      task_time: template.task_time,
      completed: false,
      isVirtual: true,
    };
  });

  const oneOffRows = dayTasks.filter((t) => t.template_id == null);

  return [...templateRows, ...oneOffRows].sort((a, b) => {
    if (!a.task_time && !b.task_time) return 0;
    if (!a.task_time) return 1;
    if (!b.task_time) return -1;
    return a.task_time < b.task_time ? -1 : a.task_time > b.task_time ? 1 : 0;
  });
}

export async function getScheduleSummaryForDate(userId, date) {
  const rows = await getScheduleForDate(userId, date);
  const total = rows.length;
  const done = rows.filter((r) => r.completed).length;
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export async function materializeTemplateItem(userId, item, date, completed) {
  const db = await getLocalDb(userId);
  const id = await db.add("tasks", {
    title: item.title,
    task_date: date,
    task_time: item.task_time,
    template_id: item.template_id,
    completed,
    completed_at: completed ? new Date().toISOString() : null,
    created_at: new Date().toISOString(),
  });
  return db.get("tasks", id);
}
