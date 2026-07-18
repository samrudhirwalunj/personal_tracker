function formatTime(time) {
  if (!time) return "Anytime";
  const [h, m] = time.split(":");
  const hour = Number(h);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = ((hour + 11) % 12) + 1;
  return `${displayHour}:${m} ${period}`;
}

export default function ScheduleList({ tasks }) {
  if (tasks.length === 0) {
    return <div className="muted" style={{ fontSize: 12, padding: "10px 0" }}>No tasks for today yet.</div>;
  }

  return (
    <div className="card">
      {tasks.map((task, i) => (
        <div
          key={task.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            padding: "7px 12px",
            borderBottom: i < tasks.length - 1 ? "0.5px solid var(--border)" : "none",
          }}
        >
          <span style={{ color: task.completed ? "var(--text-success)" : "var(--text-muted)" }}>
            {task.completed ? "✓" : "○"}
          </span>
          <span style={{ color: "var(--text-muted)" }}>{formatTime(task.task_time)}</span>
          <span
            style={{
              textDecoration: task.completed ? "line-through" : "none",
              color: task.completed ? "var(--text-muted)" : "var(--text-primary)",
            }}
          >
            {task.title}
          </span>
        </div>
      ))}
    </div>
  );
}
