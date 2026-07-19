function formatTime(time) {
  if (!time) return "Anytime";
  const [h, m] = time.split(":");
  const hour = Number(h);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = ((hour + 11) % 12) + 1;
  return `${displayHour}:${m} ${period}`;
}

export default function ScheduleList({ tasks, onToggle }) {
  if (tasks.length === 0) {
    return <div className="muted" style={{ fontSize: 12, padding: "10px 0" }}>No tasks for today yet.</div>;
  }

  return (
    <div className="card">
      {tasks.map((task, i) => (
        <label
          key={task.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            padding: "7px 12px",
            cursor: "pointer",
            borderBottom: i < tasks.length - 1 ? "0.5px solid var(--border)" : "none",
          }}
        >
          <input
            type="checkbox"
            checked={!!task.completed}
            onChange={() => onToggle(task)}
          />
          <span style={{ color: "var(--text-muted)" }}>{formatTime(task.task_time)}</span>
          <span
            style={{
              textDecoration: task.completed ? "line-through" : "none",
              color: task.completed ? "var(--text-muted)" : "var(--text-primary)",
            }}
          >
            {task.title}
          </span>
        </label>
      ))}
    </div>
  );
}
