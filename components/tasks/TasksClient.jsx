"use client";

import { useEffect, useState } from "react";
import {
  listTasksForDate,
  taskCompletionSummary,
  createTask,
  setTaskCompleted,
  deleteTask,
} from "@/lib/local/tasks";

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

  async function load() {
    setLoading(true);
    const [taskList, taskSummary] = await Promise.all([
      listTasksForDate(userId, date),
      taskCompletionSummary(userId, date),
    ]);
    setTasks(taskList);
    setSummary(taskSummary);
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
    await setTaskCompleted(userId, task.id, !task.completed);
    load();
  }

  async function removeTask(task) {
    await deleteTask(userId, task.id);
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

      <form onSubmit={addTask} style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input
          placeholder="Add a task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1 }}
        />
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
              }}
            >
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
                </div>
                {task.task_time && (
                  <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{task.task_time}</div>
                )}
              </div>
              <button onClick={() => removeTask(task)} style={{ fontSize: 11 }}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
