"use client";

import { useEffect, useState } from "react";
import { createTask, setTaskCompleted, updateTask, deleteTask } from "@/lib/local/tasks";
import {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getScheduleForDate,
  getScheduleSummaryForDate,
  materializeTemplateItem,
} from "@/lib/local/dailyTasks";
import SpeechToTextButton from "@/components/ui/SpeechToTextButton";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function TasksClient({ userId }) {
  const [date, setDate] = useState(todayISO());
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({ total: 0, done: 0, percent: 0 });
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(true);

  const [templates, setTemplates] = useState([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateTime, setTemplateTime] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTime, setEditTime] = useState("");

  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [editTemplateTitle, setEditTemplateTitle] = useState("");
  const [editTemplateTime, setEditTemplateTime] = useState("");

  async function load() {
    setLoading(true);
    const [taskList, taskSummary, templateList] = await Promise.all([
      getScheduleForDate(userId, date),
      getScheduleSummaryForDate(userId, date),
      listTemplates(userId),
    ]);
    setTasks(taskList);
    setSummary(taskSummary);
    setTemplates(templateList);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask(userId, { title, taskDate: date, taskTime: time || null });
    setTitle("");
    setTime("");
    load();
  }

  async function toggleTask(task) {
    if (task.isVirtual) {
      await materializeTemplateItem(userId, task, date, true);
    } else {
      await setTaskCompleted(userId, task.id, !task.completed);
    }
    load();
  }

  async function removeTask(task) {
    if (task.isVirtual) return;
    await deleteTask(userId, task.id);
    load();
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditTime(task.task_time || "");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(task) {
    if (!editTitle.trim()) return;
    await updateTask(userId, task.id, { title: editTitle, task_time: editTime || null });
    setEditingId(null);
    load();
  }

  async function addTemplate(e) {
    e.preventDefault();
    if (!templateTitle.trim()) return;
    await createTemplate(userId, { title: templateTitle, taskTime: templateTime || null });
    setTemplateTitle("");
    setTemplateTime("");
    load();
  }

  async function removeTemplate(template) {
    await deleteTemplate(userId, template.id);
    load();
  }

  function startEditTemplate(template) {
    setEditingTemplateId(template.id);
    setEditTemplateTitle(template.title);
    setEditTemplateTime(template.task_time || "");
  }

  function cancelEditTemplate() {
    setEditingTemplateId(null);
  }

  async function saveEditTemplate(template) {
    if (!editTemplateTitle.trim()) return;
    await updateTemplate(userId, template.id, { title: editTemplateTitle, task_time: editTemplateTime || null });
    setEditingTemplateId(null);
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div className="page-title" style={{ marginBottom: 0 }}>
          Tasks · {summary.done}/{summary.total}
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <button onClick={() => setShowSchedule((v) => !v)} style={{ fontSize: 11.5, marginBottom: 14 }}>
        {showSchedule ? "Hide daily schedule" : "Manage daily schedule"}
      </button>

      {showSchedule && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 4 }}>Daily schedule</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>
            Recurring tasks that show up automatically every day (e.g. morning stretch, deep work block).
          </div>

          <form onSubmit={addTemplate} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              placeholder="Recurring task"
              value={templateTitle}
              onChange={(e) => setTemplateTitle(e.target.value)}
              style={{ flex: 1 }}
            />
            <input
              type="time"
              value={templateTime}
              onChange={(e) => setTemplateTime(e.target.value)}
              style={{ width: 120 }}
            />
            <button type="submit" className="btn-primary">Add</button>
          </form>

          {templates.length === 0 ? (
            <div className="muted" style={{ fontSize: 11.5 }}>No recurring tasks yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {templates.map((t) =>
                editingTemplateId === t.id ? (
                  <div key={t.id} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                    <input
                      value={editTemplateTitle}
                      onChange={(e) => setEditTemplateTitle(e.target.value)}
                      style={{ flex: 1, minWidth: 100, fontSize: 12 }}
                      autoFocus
                    />
                    <input
                      type="time"
                      value={editTemplateTime}
                      onChange={(e) => setEditTemplateTime(e.target.value)}
                      style={{ width: 100, fontSize: 12 }}
                    />
                    <button onClick={() => saveEditTemplate(t)} className="btn-primary" style={{ fontSize: 11 }}>
                      Save
                    </button>
                    <button onClick={cancelEditTemplate} style={{ fontSize: 11 }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                    <span style={{ flex: 1 }}>{t.title}</span>
                    {t.task_time && <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{t.task_time}</span>}
                    <button onClick={() => startEditTemplate(t)} style={{ fontSize: 11 }}>Edit</button>
                    <button onClick={() => removeTemplate(t)} style={{ fontSize: 11 }}>Remove</button>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      <form onSubmit={addTask} style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input
          placeholder="Add a one-off task for this day"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1 }}
        />
        <SpeechToTextButton onResult={(t) => setTitle((prev) => (prev ? `${prev} ${t}` : t))} />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: 120 }} />
        <button type="submit" className="btn-primary">Add</button>
      </form>

      {loading ? (
        <div className="muted" style={{ fontSize: 12 }}>Loading…</div>
      ) : tasks.length === 0 ? (
        <div className="muted" style={{ fontSize: 12 }}>No tasks for this day yet.</div>
      ) : (
        <div className="card">
          {tasks.map((task, i) => (
            <div
              key={task.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderBottom: i < tasks.length - 1 ? "0.5px solid var(--border)" : "none",
                flexWrap: editingId === task.id ? "wrap" : "nowrap",
              }}
            >
              {editingId === task.id ? (
                <>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={{ flex: 1, minWidth: 120 }}
                    autoFocus
                  />
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    style={{ width: 110 }}
                  />
                  <button onClick={() => saveEdit(task)} className="btn-primary" style={{ fontSize: 11 }}>
                    Save
                  </button>
                  <button onClick={cancelEdit} style={{ fontSize: 11 }}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <input type="checkbox" checked={!!task.completed} onChange={() => toggleTask(task)} />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 12.5,
                        textDecoration: task.completed ? "line-through" : "none",
                        color: task.completed ? "var(--text-muted)" : "var(--text-primary)",
                      }}
                    >
                      {task.title}
                      {task.template_id != null && (
                        <span style={{ fontSize: 9.5, color: "var(--text-accent)", marginLeft: 6 }}>· daily</span>
                      )}
                    </div>
                    {task.task_time && (
                      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{task.task_time}</div>
                    )}
                  </div>
                  {!task.isVirtual && (
                    <>
                      <button onClick={() => startEdit(task)} style={{ fontSize: 11 }}>
                        Edit
                      </button>
                      <button onClick={() => removeTask(task)} style={{ fontSize: 11 }}>
                        Delete
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
