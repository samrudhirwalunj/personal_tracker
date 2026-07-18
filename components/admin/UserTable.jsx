export default function UserTable({ users }) {
  if (users.length === 0) {
    return <div className="muted" style={{ fontSize: 12 }}>No users yet.</div>;
  }

  return (
    <div className="card" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "0.5px solid var(--border)" }}>
            <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-secondary)" }}>Name</th>
            <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-secondary)" }}>Phone</th>
            <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-secondary)" }}>Getting started</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: "0.5px solid var(--border)" }}>
              <td style={{ padding: "8px 12px" }}>{user.name || "—"}</td>
              <td style={{ padding: "8px 12px" }}>{user.phone}</td>
              <td style={{ padding: "8px 12px" }}>
                {new Date(user.onboarding_completed_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
