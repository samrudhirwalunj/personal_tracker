"use client";

import { useEffect, useState } from "react";
import { listGoals, createGoal, updateGoal, deleteGoal } from "@/lib/local/goals";

const STATUS_META = {
  not_started: { label: "Not started", tone: "danger", bar: "var(--fill-danger)" },
  in_progress: { label: "In progress", tone: "warning", bar: "var(--fill-warning)" },
  done: { label: "Done", tone: "success", bar: "var(--fill-success)" },
};

const TONE_STYLE = {
  danger: { background: "var(--bg-danger)", color: "var(--text-danger)" },
  warning: { background: "var(--bg-warning)", color: "var(--text-warning)" },
  success: { background: "var(--bg-success)", color: "var(--text-success)" },
};

const EMPTY_FORM = { title: "", whyText: "", deadline: "", priority: "med" };

export default function GoalsClient({ userId }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  async function load() {
    setLoading(true);
    setGoals(await listGoals(userId));
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function saveGoal(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    await createGoal(userId, { ...form, deadline: form.deadline || null });
    setForm(EMPTY_FORM);
    setShowForm(false);
    load();
  }

  async function setStatus(goal, status) {
    await updateGoal(userId, goal.id, { status });
    load();
  }

  async function removeGoal(goal) {
    await deleteGoal(userId, goal.id);
    load();
  }

  // Only the title and completion date ever leave this function — never the
  // full goal (why_text, priority, etc.) or any other local data.
  function shareGoal(goal) {
    const text = `I completed my goal: ${goal.title} 🎉`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div className="page-title" style={{ marginBottom: 0 }}>Goals · {goals.length}</div>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Close" : "+ New goal"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveGoal} className="card" style={{ padding: 16, marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            placeholder="Goal title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
          />
          <textarea
            placeholder="Why does this matter to you?"
            value={form.whyText}
            onChange={(e) => set("whyText", e.target.value)}
            style={{ height: 50 }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label className="field-label">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
                style={{ width: "100%", marginTop: 4 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="field-label">Priority</label>
              <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
                {["high", "med", "low"].map((p) => (
                  <span
                    key={p}
                    onClick={() => set("priority", p)}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: 11,
                      padding: "6px 0",
                      borderRadius: "var(--radius)",
                      cursor: "pointer",
                      background: form.priority === p ? "var(--fill-danger)" : "transparent",
                      color: form.priority === p ? "var(--on-danger)" : "var(--text-secondary)",
                      border: form.priority === p ? "none" : "0.5px solid var(--border-strong)",
                      textTransform: "capitalize",
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary">Save goal</button>
        </form>
      )}

      {loading ? (
        <div className="muted" style={{ fontSize: 12 }}>Loading…</div>
      ) : goals.length === 0 ? (
        <div className="muted" style={{ fontSize: 12 }}>No goals yet — add your first one.</div>
      ) : (
        <div className="card">
          {goals.map((goal, i) => {
            const meta = STATUS_META[goal.status];
            return (
              <div
                key={goal.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 12px",
                  borderBottom: i < goals.length - 1 ? "0.5px solid var(--border)" : "none",
                }}
              >
                <div style={{ width: 6, height: 36, borderRadius: 3, background: meta.bar, marginRight: 10 }} />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 500,
                      textDecoration: goal.status === "done" ? "line-through" : "none",
                      color: goal.status === "done" ? "var(--text-muted)" : "var(--text-primary)",
                    }}
                  >
                    {goal.title}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
                    {goal.deadline ? `Due ${goal.deadline}` : "No deadline"} · {goal.priority} priority
                  </div>
                </div>
                <span className="pill" style={{ ...TONE_STYLE[meta.tone], marginRight: 10 }}>{meta.label}</span>
                <select
                  value={goal.status}
                  onChange={(e) => setStatus(goal, e.target.value)}
                  style={{ fontSize: 11, marginRight: 6 }}
                >
                  <option value="not_started">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
                {goal.status === "done" && (
                  <button onClick={() => shareGoal(goal)} style={{ fontSize: 11, marginRight: 6 }}>Share</button>
                )}
                <button onClick={() => removeGoal(goal)} style={{ fontSize: 11 }}>Delete</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
